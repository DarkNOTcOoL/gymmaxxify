import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// -----------------------------------------------------------------------------
// FluidBackground
//
// Full-viewport, fixed-position WebGL background. Renders a slow, aurora-like
// domain-warped noise field, but instead of *blurring* between colorA and
// colorB it DITHERS between them: every pixel is fully colorA or fully
// colorB, and the choice is made by comparing the smooth noise field against
// a per-cell random threshold. Where the field is far from the midpoint,
// that comparison almost always resolves the same way -> solid clean color.
// Where the field hovers near the midpoint, the comparison flips back and
// forth pixel-to-pixel -> a grainy, interlocking dot pattern. No part of the
// pipeline uses gaussian/soft blur.
//
// See the "DITHERING" block inside the fragment shader for the actual logic
// and the two knobs (uGrainScale, EDGE_SHARPNESS) you'll likely want to tune.
// -----------------------------------------------------------------------------

const DEFAULT_COLOR_A = '#ca0000'; // deep navy / indigo
const DEFAULT_COLOR_B = '#4b0000'; // bright teal / mint

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // Plane is a 2x2 quad and the camera is an orthographic camera framed
    // to [-1, 1], so this maps the quad to exactly fill clip space -
    // i.e. a full-screen pass, no projection math needed.
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uSpeed;
  uniform float uGrainScale;
  uniform vec2  uMouse; // reserved for future pointer-driven warp - unused for now

  varying vec2 vUv;

  // ---------------------------------------------------------------------
  // 2D simplex noise (Ashima Arts / Ian McEwan, MIT-licensed reference
  // implementation). This is the base building block for the scalar field
  // below - NOT used for blurring, only to drive the field that gets
  // dithered further down.
  // ---------------------------------------------------------------------
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion - stacks octaves of simplex noise for richer,
  // less obviously-periodic detail. Kept to 4 octaves (was 5) - the 5th,
  // highest-frequency octave was adding fine ripple that kept nudging the
  // field back across 0.5 in lots of small scattered spots, which is part
  // of why dithering was showing up everywhere instead of in one clean band.
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 2; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // Domain-warped scalar field (Inigo Quilez's "domain warping"): noise is
  // used to distort the *input coordinates* of more noise, twice over. This
  // is what gives the flowing, aurora-like curves instead of generic bumpy
  // Perlin blobs. uTime slowly drifts the warp so the whole field breathes
  // and undulates rather than just scrolling.
  float warpedField(vec2 uv, float t) {
    vec2 q = vec2(
      fbm(uv + t * 0.05),
      fbm(uv + vec2(5.2, 1.3) + t * 0.05)
    );
    // Warp offset strength dialed back from (1.6, 1.4) to (1.0, 0.8) to match
    // the lower base frequency below - otherwise the warp itself re-injects
    // fine, fast-changing detail on top of an already-coarser field.
    vec2 r = vec2(
      fbm(uv + 1.0 * q + vec2(1.7, 9.2) + t * 0.08),
      fbm(uv + 1.0 * q + vec2(8.3, 2.8) + t * 0.08)
    );
    return fbm(uv + 0.8 * r + t * 0.03);
  }

  // ---------------------------------------------------------------------
  // DITHERING
  //
  // This whole block is the actual "dithered gradient, not blur" effect.
  // Read it top to bottom - the three steps map directly to the technique
  // described in the brief.
  // ---------------------------------------------------------------------

  // Per-cell pseudo-random hash. Deliberately a hash (irregular / "sand
  // grain" scatter) and NOT a Bayer matrix (which would tile a regular,
  // structured pattern and read as a checkerboard rather than organic
  // grain).
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 nuv = uv;
    nuv.x *= aspect; // keep noise features round, not stretched by viewport shape

    float t = uTime * uSpeed;

    // --- STEP 1: smooth scalar field --------------------------------
    // "how much color A vs color B, right here" - a continuous, animated
    // value in [0, 1]. This is the only place the two colors are related
    // to a gradient at all; nothing here is a color yet, and nothing is
    // blurred - it's just a number per pixel.
    // TUNABLE: NOISE_SCALE is the base spatial frequency of the field.
    // Lower = larger, smoother regions with a thinner organic boundary
    // between them; higher = smaller, busier blobs. Dropped from 1.6 to
    // 0.6 so the field actually holds large flat stretches near 0 or 1
    // instead of oscillating across the whole [0,1] range everywhere.
    const float NOISE_SCALE = 0.3;
    float field = warpedField(nuv * NOISE_SCALE, t);
    field = clamp(field * 0.5 + 0.45, 0.0, 1.0); // raw snoise is ~[-1,1] -> remap to [0,1]

    // --- STEP 1b: isolate the transition band -----------------------
    // TUNABLE: TRANSITION_WIDTH is how far from field == 0.5 the dithered
    // boundary extends. smoothstep (not pow()) is what makes this actually
    // work: outside [0.5 - TRANSITION_WIDTH, 0.5 + TRANSITION_WIDTH] the
    // result is *clamped* to exactly 0.0 or 1.0 - genuinely solid color,
    // not just "closer to solid" - which is what pow() could never fully
    // reach. Only inside that narrow band does field vary continuously,
    // which is the only place STEP 3 below can actually produce a 50/50-ish
    // dither. Smaller width = crisper edge, bigger solid regions; larger
    // width = a softer, wider grain band. This is independent of dot size
    // (that's uGrainScale below).
    const float TRANSITION_WIDTH = 0.08;
    field = smoothstep(0.5 - TRANSITION_WIDTH, 0.5 + TRANSITION_WIDTH, field);

    // --- STEP 2: per-pixel dither threshold -------------------------
    // TUNABLE: uGrainScale is the dot size in screen pixels. Quantizing
    // gl_FragCoord into uGrainScale-sized cells before hashing is what turns
    // single-pixel noise into visible grains/dots rather than TV static.
    // Bump this up for chunkier, more visible grain; drop it toward 1.0 for
    // a fine sand-like texture.
    vec2 cell = floor(gl_FragCoord.xy / max(uGrainScale, 1.0));
    float threshold = hash21(cell);

    // --- STEP 3: dither (threshold the field, don't blend it) -------
    // This is the crux of the whole effect: colorA/colorB are never mixed
    // as a blend. Each pixel's *cell* independently "votes" colorA or
    // colorB by comparing the smooth field value to its own random
    // threshold:
    //   field near 0   -> threshold beats field almost every cell -> solid colorA
    //   field near 0.5  -> roughly a coin flip per cell            -> interlocking grain
    //   field near 1    -> field beats threshold almost every cell -> solid colorB
    // So grain concentrates exactly where the field is transitioning, and
    // clears up to flat color everywhere else, with no explicit masking.
    float mixVal = step(threshold, field);

    vec3 color = mix(uColorA, uColorB, mixVal);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * FluidBackground
 *
 * Full-screen, fixed-position, click-through WebGL background using the
 * dithered-gradient technique (see fragment shader above for the core
 * effect). Not wired into App.jsx - drop <FluidBackground /> in wherever
 * you're ready for it.
 *
 * Props (all optional, all map 1:1 to shader uniforms):
 *   colorA      - CSS color string, the "dark" end of the field (default deep navy)
 *   colorB      - CSS color string, the "light" end of the field (default mint/teal)
 *   speed       - animation speed multiplier for the domain warp drift
 *   grainScale  - dot size in screen pixels (see STEP 2 comment above)
 */
export default function FluidBackground({
  colorA = DEFAULT_COLOR_A,
  colorB = DEFAULT_COLOR_B,
  speed = 0.15,
  grainScale = 0.5,
}) {
  const mountRef = useRef(null);
  const uniformsRef = useRef(null);

  // Mount/teardown the WebGL context exactly once.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Orthographic camera framed exactly to [-1, 1] paired with a 2x2 plane
    // below = a standard full-screen-quad setup for shader passes.
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uSpeed: { value: speed },
      uGrainScale: { value: grainScale },
      // Stub only - not read anywhere in the shader yet. Wire up real
      // pointer coordinates here later for mouse-driven distortion.
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      uniformsRef.current = null;
    };
    // Intentionally empty - the context is created once; prop changes are
    // pushed into the existing uniforms by the effects below instead of
    // tearing down and recreating the WebGL context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push prop changes into the live uniforms without re-mounting WebGL.
  useEffect(() => {
    if (uniformsRef.current) uniformsRef.current.uColorA.value.set(colorA);
  }, [colorA]);

  useEffect(() => {
    if (uniformsRef.current) uniformsRef.current.uColorB.value.set(colorB);
  }, [colorB]);

  useEffect(() => {
    if (uniformsRef.current) uniformsRef.current.uSpeed.value = speed;
  }, [speed]);

  useEffect(() => {
    if (uniformsRef.current) uniformsRef.current.uGrainScale.value = grainScale;
  }, [grainScale]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
