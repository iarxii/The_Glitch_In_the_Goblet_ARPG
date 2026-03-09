# Shaders and Aesthetics (The "Glitch" Style)

Achieving a stylized, visually interesting game world without the intense overhead of writing raw GLSL from scratch is handled by injecting logic into Three.js's built-in physically based materials.

## 1. Material Injection (`GlitchMaterial.tsx`)

Instead of writing a custom `ShaderMaterial` and losing built-in shadows, reflections, and lighting, we use the `onBeforeCompile` property of the standard `<meshStandardMaterial>`.

### The Wobble Effect
We intercept the vertex shader compilation step and inject a subtle sine/cosine wave based on the vertex position and `uTime`.

```glsl
// Injected into <begin_vertex>
float glitchWave = sin(position.y * 5.0 + uTime * uSpeed) * cos(position.x * 3.0 + uTime * uSpeed);
transformed.x += glitchWave * uAmount;
transformed.z += glitchWave * (uAmount * 0.5);
```

### Usage
Simply use `<GlitchMaterial />` in place of `<meshStandardMaterial />`.
*   **Props:**
    *   `wobbleSpeed`: How fast the vertices shift.
    *   `wobbleAmount`: The amplitude of the shift.
    *   `color`, `vertexColors`, etc.

**Note:** When reusing `onBeforeCompile` with different dynamic uniforms (like different speeds), you *must* pass a unique string to `customProgramCacheKey` so Three.js compiles separate internal shader programs.

## 2. Advanced Glass/Portals

For complex refraction effects (like the Exit Portal), we utilize `@react-three/drei`'s `<MeshTransmissionMaterial>`. It handles screen-space refraction, chromatic aberration, and thickness. In combination with a `<pointLight>`, it creates an impressive glowing, distorted gateway effect out-of-the-box.
