import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import * as THREE from 'three';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameStore } from '../../store/useGameStore';
import { PHYSICS } from '../../systems/Physics';

/**
 * Player
 * ------
 * Implements a kinematic character controller.
 * Handles input, physics, and state synchronization.
 */
export function Player() {
    const meshRef = useRef<Mesh>(null);
    // const { camera } = useThree(); // Unused for now
    const input = useKeyboard();
    const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);

    // Physics state
    const [velocity] = useState(new THREE.Vector3(0, 0, 0));
    const [isGrounded, setIsGrounded] = useState(false);

    useFrame((_state, delta) => {
        if (!meshRef.current) return;

        const playerPos = meshRef.current.position;

        // 1. Handle Input (Movement)
        const speed = input.sprint ? PHYSICS.MOVE_SPEED * PHYSICS.SPRINT_MULTIPLIER : PHYSICS.MOVE_SPEED;
        const moveDir = new THREE.Vector3();

        if (input.forward) moveDir.z -= 1;
        if (input.backward) moveDir.z += 1;
        if (input.left) moveDir.x -= 1;
        if (input.right) moveDir.x += 1;

        // Normalize and apply speed
        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(speed * delta);
        }

        // Apply movement relative to camera (optional, but standard for 3rd person)
        // For now, absolute world coordinates (WSAD = NSEW)
        // We'll update rotation to face movement direction
        if (moveDir.length() > 0) {
            playerPos.x += moveDir.x;
            playerPos.z += moveDir.z;

            // Simple rotation to face direction
            // const angle = Math.atan2(moveDir.x, moveDir.z); 
            // meshRef.current.rotation.y = angle;
            // Note: check coordinate system
            // Actually in Three.js: x is right, z is out of screen (backwards). 
            // forward (-z), backward (+z), left (-x), right (+x).
            // atan2(x, z) gives angle from z axis.
            // meshRef.current.rotation.y = Math.atan2(velocity.x, velocity.z);
            // We'll smooth this later.
        }

        // 2. Handle Physics (Gravity & Jumping)

        // Apply Gravity
        velocity.y -= PHYSICS.GRAVITY * delta;

        // Jump
        if (input.jump && isGrounded) {
            velocity.y = PHYSICS.JUMP_FORCE;
            setIsGrounded(false);
        }

        // Apply Velocity to Position (Y-axis)
        playerPos.y += velocity.y * delta;

        // 3. Ground Collision (Simple flat plane at GROUND_Y)
        // Correction if below ground
        // Note: Box height is 1, so center is at 0.5. Ground is at 0.
        const halfHeight = 0.5; // Box geometry arg [1,1,1]
        const groundLevel = PHYSICS.GROUND_Y + halfHeight;

        if (playerPos.y <= groundLevel) {
            playerPos.y = groundLevel;
            velocity.y = 0;
            if (!isGrounded) setIsGrounded(true);
        } else {
            if (isGrounded) setIsGrounded(false);
        }

        // 4. Sync State
        setPlayerPosition([playerPos.x, playerPos.y, playerPos.z]);

        // 5. Camera Follow (Simple)
        // Keep camera at fixed offset relative to player
        // Or just let OrbitControls handle it by updating target?
        // Ideally we update the controls target.
        // For now, simple lookAt if we weren't using OrbitControls.
        // With OrbitControls, we need to imperatively update its target.
        // We'll leave camera logic to a separate system or Controls component 
        // that subscribes to player position store.
    });

    return (
        <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={isGrounded ? "#00d4ff" : "#ff0000"} />

            {/* Direction Indicator */}
            <mesh position={[0, 0, -0.4]} scale={0.2}>
                <boxGeometry />
                <meshStandardMaterial color="white" />
            </mesh>
        </mesh>
    );
}
