"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function StarField() {
    const meshRef = useRef<THREE.Points>(null!);
    const count = 3000;

    // Create random positions for stars
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 40 * Math.cbrt(Math.random()); // Even distribution in sphere
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            arr[i * 3 + 2] = r * Math.cos(phi);
        }
        return arr;
    }, []);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05; // Slow rotation
            meshRef.current.rotation.x += delta * 0.02;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#6366f1"
                sizeAttenuation={true}
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function GridPlane() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
            <planeGeometry args={[100, 100, 40, 40]} />
            <meshBasicMaterial
                color="#22d3ee"
                wireframe
                transparent
                opacity={0.05}
            />
        </mesh>
    );
}

function Scene() {
    return (
        <>
            <fog attach="fog" args={['#050505', 10, 50]} />
            <ambientLight intensity={0.5} />
            <StarField />
            <GridPlane />
            {/* <ModeController /> */}
        </>
    )
}

export default function ThreeBackground() {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                background: "radial-gradient(circle at 50% 50%, #111827 0%, #000000 100%)",
                opacity: 0.8
            }}
        >
            <Canvas camera={{ position: [0, 0, 20], fov: 60 }} gl={{ antialias: true, alpha: true }}>
                <Scene />
            </Canvas>
        </div>
    );
}
