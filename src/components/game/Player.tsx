import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useGameStore } from '../../store/useGameStore';
import { PHYSICS } from '../../systems/Physics';
import { AimIndicator } from './AimIndicator';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { GlitchMaterial } from '../shaders/GlitchMaterial';

export function Player() {
    const groupRef = useRef<Group>(null);
    const rbRef = useRef<RapierRigidBody>(null);
    const input = useKeyboard();
    const mousePos = useMousePosition();

    const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
    const showAimIndicator = useGameStore((s) => s.showAimIndicator);
    const toggleAimIndicator = useGameStore((s) => s.toggleAimIndicator);
    const targetPosition = useGameStore((s) => s.targetPosition);
    const setTargetPosition = useGameStore((s) => s.setTargetPosition);

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

    useFrame(() => {
        if (!groupRef.current || !rbRef.current) return;

        const rbPos = rbRef.current.translation();
        const playerPos = new Vector3(rbPos.x, rbPos.y, rbPos.z);

        // Rotate ENTIRE GROUP to face mouse
        if (mousePos) {
            const lookTarget = new Vector3(mousePos.x, groupRef.current.position.y, mousePos.z);
            groupRef.current.lookAt(lookTarget);
        }

        const speed = input.sprint ? PHYSICS.MOVE_SPEED * PHYSICS.SPRINT_MULTIPLIER : PHYSICS.MOVE_SPEED;
        const moveDir = new Vector3();

        if (input.forward || input.backward || input.left || input.right) {
            if (targetPosition) setTargetPosition(null);

            if (input.forward) moveDir.z -= 1;
            if (input.backward) moveDir.z += 1;
            if (input.left) moveDir.x -= 1;
            if (input.right) moveDir.x += 1;
        } else if (targetPosition) {
            const target = new Vector3(targetPosition[0], playerPos.y, targetPosition[2]);
            const dist = playerPos.distanceTo(target);

            if (dist > 0.5) {
                moveDir.copy(target).sub(playerPos).normalize();
            } else {
                setTargetPosition(null);
            }
        }

        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(speed);
        }

        // Keep current vertical velocity to allow gravity to work
        const currentVel = rbRef.current.linvel();
        let newVelY = currentVel.y;

        if (input.jump && Math.abs(currentVel.y) < 0.1) {
            newVelY = PHYSICS.JUMP_FORCE;
        }

        rbRef.current.setLinvel({ x: moveDir.x, y: newVelY, z: moveDir.z }, true);

        // Sync State
        setPlayerPosition([rbPos.x, rbPos.y, rbPos.z]);
    });

    return (
        <RigidBody ref={rbRef} colliders={false} type="dynamic" position={[10, 20, 10]} enabledRotations={[false, false, false]}>
            <CapsuleCollider args={[0.25, 0.5]} position={[0, 0.75, 0]} />
            <group ref={groupRef} position={[0, 0.5, 0]}>
                <mesh rotation-y={Math.PI}>
                    <boxGeometry args={[1, 1, 1]} />
                    <GlitchMaterial color={"#00d4ff"} wobbleAmount={0.1} wobbleSpeed={3.0} />
                    <mesh position={[0, 0, -0.4]} scale={0.2}>
                        <boxGeometry />
                        <GlitchMaterial color="white" wobbleAmount={0.0} />
                    </mesh>
                </mesh>

                {showAimIndicator && mousePos && (
                    <AimIndicator
                        start={new Vector3(0, 0, 0)}
                        end={new Vector3(0, 0, groupRef.current?.position.distanceTo(mousePos) || 0)}
                    />
                )}
            </group>
        </RigidBody>
    );
}
