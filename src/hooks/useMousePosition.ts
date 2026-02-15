import { useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PHYSICS } from '../systems/Physics';

export function useMousePosition() {
    const { camera, raycaster, pointer } = useThree();
    const [mouseWorldPos] = useState(new THREE.Vector3());
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PHYSICS.GROUND_Y);

    useFrame(() => {
        // Update raycaster with current camera and pointer
        raycaster.setFromCamera(pointer, camera);

        // Intersect with ground plane
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, target);

        if (target) {
            mouseWorldPos.copy(target);
        }
    });

    return mouseWorldPos;
}
