import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface GlitchMaterialProps {
    color?: string | number;
    wobbleSpeed?: number;
    wobbleAmount?: number;
    vertexColors?: boolean;
    fadeDistance?: number;
}

/**
 * Stylized Material using onBeforeCompile.
 * Adds subtle vertex displacement (wobble) to mimic the "Glitch" aesthetic,
 * while retaining MeshStandardMaterial's lighting and shadow properties.
 */
export function GlitchMaterial({
    color = '#ffffff',
    wobbleSpeed = 2.0,
    wobbleAmount = 0.05,
    vertexColors = false,
    fadeDistance = 3.0 // Default hide objects closer than 3 units
}: GlitchMaterialProps) {
    const customUniforms = useRef({
        uTime: { value: 0 },
        uSpeed: { value: wobbleSpeed },
        uAmount: { value: wobbleAmount }
    });

    useFrame(({ clock }) => {
        customUniforms.current.uTime.value = clock.getElapsedTime();
    });

    const onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
        shader.uniforms.uTime = customUniforms.current.uTime;
        shader.uniforms.uSpeed = customUniforms.current.uSpeed;
        shader.uniforms.uAmount = customUniforms.current.uAmount;

        // Add uniforms to vertex shader
        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
            #include <common>
            uniform float uTime;
            uniform float uSpeed;
            uniform float uAmount;
            `
        );

        // Apply vertex displacement
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            // Subtle wave based on position and time
            float glitchWave = sin(position.y * 5.0 + uTime * uSpeed) * cos(position.x * 3.0 + uTime * uSpeed);
            transformed.x += glitchWave * uAmount;
            transformed.z += glitchWave * (uAmount * 0.5);
            `
        );

        // Apply camera distance fade out via discard
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <alphatest_fragment>',
            `
            #include <alphatest_fragment>
            float distToCamera = length(vViewPosition);

            // Dither / Discard pixels too close to the camera.
            // smoothstep gives us a gradient of opacities, but since we are not fully transparent 
            // (to save FPS), we just use a hard alpha cutoff / discard using standard pseudo-random dithering.
            
            // Basic screen-space dithering matrix approximation
            float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
            
            float alphaFade = smoothstep(${fadeDistance.toFixed(1)}, ${fadeDistance.toFixed(1)} + 3.0, distToCamera);

            if (alphaFade < dither) {
                discard;
            }
            `
        );
    };

    return (
        <meshStandardMaterial
            color={color}
            vertexColors={vertexColors}
            transparent={false} // Performance: Disable true transparency
            onBeforeCompile={onBeforeCompile}
            // Need to set customProgramCacheKey when reusing onBeforeCompile 
            // across multiple objects with different params so Three.js compiles it properly
            customProgramCacheKey={() => `glitch_${wobbleSpeed}_${wobbleAmount}`}
        />
    );
}
