import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useGameStore } from '../../store/useGameStore';
import { PHYSICS } from '../../systems/Physics';
import { AimIndicator } from './AimIndicator';

/**
 * Player
 * ------
 * Implements a kinematic character controller.
 * Handles input, physics, and state synchronization.
 * Uses a Group wrapper to separate logic from visual rotation.
 */
export function Player() {
    const groupRef = useRef<Group>(null);
    const input = useKeyboard();
    const mousePos = useMousePosition();

    // Optimized selectors to avoid infinite re-renders
    const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
    const showAimIndicator = useGameStore((s) => s.showAimIndicator);
    const toggleAimIndicator = useGameStore((s) => s.toggleAimIndicator);
    const targetPosition = useGameStore((s) => s.targetPosition);
    const setTargetPosition = useGameStore((s) => s.setTargetPosition);

    // Physics state
    const [velocity] = useState(new Vector3(0, 0, 0));
    const [isGrounded, setIsGrounded] = useState(false);

    // Toggle Aim Binding
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyT') toggleAimIndicator();
            if (e.code === 'KeyI') toggleAimIndicator(); // Alias
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleAimIndicator]);

    // Tracking mouse pos in ref for click handler
    const mousePosRef = useRef<Vector3 | null>(null);
    useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);

    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            // Only Left Click (button 0)
            if (e.button === 0 && mousePosRef.current) {
                // Check if clicking on UI? (Not implemented yet).
                setTargetPosition([mousePosRef.current.x, mousePosRef.current.y, mousePosRef.current.z]);
            }
        };
        window.addEventListener('pointerdown', handlePointerDown);
        return () => window.removeEventListener('pointerdown', handlePointerDown);
    }, [setTargetPosition]);

    useFrame((_state, delta) => {
        if (!groupRef.current) return;

        const playerPos = groupRef.current.position;

        // Rotate ENTIRE GROUP to face mouse
        if (mousePos) {
            // target point at player's height to allow flat rotation
            const lookTarget = new Vector3(mousePos.x, playerPos.y, mousePos.z);
            groupRef.current.lookAt(lookTarget);
        }

        // 0. Handle Click to Move
        // We need to capture click. Since this is useFrame, we can't add event listener here repeatedly.
        // But we can check input.

        // 1. Handle Input (Movement)
        const speed = input.sprint ? PHYSICS.MOVE_SPEED * PHYSICS.SPRINT_MULTIPLIER : PHYSICS.MOVE_SPEED;
        const moveDir = new Vector3();

        // Manual Input Overrides Click-to-Move
        if (input.forward || input.backward || input.left || input.right) {
            if (targetPosition) setTargetPosition(null); // Cancel target

            if (input.forward) moveDir.z -= 1;
            if (input.backward) moveDir.z += 1;
            if (input.left) moveDir.x -= 1;
            if (input.right) moveDir.x += 1;
        } else if (targetPosition) {
            // Autonomous Movement towards Target
            const target = new Vector3(...targetPosition);
            const currentPos = new Vector3(playerPos.x, playerPos.y, playerPos.z);
            const dist = currentPos.distanceTo(target);

            if (dist > 0.1) {
                moveDir.copy(target).sub(currentPos).normalize();
                // Face movement direction if moving autonomously?
                // Or still face mouse?
                // User said "face mouse for forward direction".
                // Usually click-to-move implies facing target.
                // But aim implies mouse.
                // If I click to move, do I aim at target?
                // Let's assume Aim (Mouse) takes precedence for Rotation, but Movement is towards target.
                // Or should we rotate to target if no mouse input? Mouse is always there.
                // "The player should follow the mouse for forward direction" -> aimed movement?
                // But click-to-move is usually independent of aim in top-down shooters, OR aim IS movement.
                // User said "face mouse for forward direction" previously.
                // I will keep Rotation locked to Mouse. Movement towards Target.
                // This allows strafing/kiting behavior (move to point, shoot at mouse).
            } else {
                setTargetPosition(null); // Reached
            }
        }

        // Normalize and apply speed
        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(speed * delta);
        }

        // Apply movement (Absolute World Coordinates: WSAD = NSEW)
        if (moveDir.length() > 0) {
            playerPos.x += moveDir.x;
            playerPos.z += moveDir.z;
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
    });

    return (
        <group ref={groupRef} position={[0, 0.5, 0]}>
            {/* Visual Mesh with Rotation Correction */}
            {/* Rotate 180 degrees (Math.PI) around Y because lookAt points +Z, but our "Front" was -Z */}
            <mesh rotation-y={Math.PI} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={isGrounded ? "#00d4ff" : "#ff0000"} />

                {/* Direction Indicator (White Box) - Represents "Face" */}
                {/* Since we rotate Mesh 180, this -0.4 Z becomes +0.4 Z in Group Space? */}
                {/* No, Mesh is rotated. Local -0.4Z inside Mesh -> Rotated 180 -> +0.4Z in Group. */}
                {/* Group looks at Target (+Z). So +0.4Z points at Target. Correct. */}
                <mesh position={[0, 0, -0.4]} scale={0.2}>
                    <boxGeometry />
                    <meshStandardMaterial color="white" />
                </mesh>
            </mesh>

            {showAimIndicator && mousePos && (
                // AimIndicator is inside Group. [0,0,0] is Player Center.
                // mousePos is World Coord. 
                // We need relative coords for Line if it acts in local space?
                // Drei Line points are world space by default? No, usually local to parent.
                // If Line uses buffer geometry, it's local.
                // So end point should be (mousePos - playerPos).
                // But rotating Group rotates the Line too!
                // If we draw line to (Target - Pos), and Group is looking at Target...
                // Then (Target - Pos) is a vector along Z axis (length D).
                // So end point should be [0, 0, Distance].
                // Let's calculate distance.
                // OR: Put AimIndicator outside group? No, cleanest is inside but use local logic.
                <AimIndicator
                    start={new Vector3(0, 0, 0)}
                    // Calculate relative position of mouse in rotated group space
                    // Actually, simpler: Use inverse rotation?
                    // Or just use distance.
                    end={
                        new Vector3(0, 0, groupRef.current?.position.distanceTo(mousePos) || 0)
                    }
                />
            )}

        </group>
    );
}
