"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// UFO Component - Flies across the screen mysteriously
function UFO() {
    const groupRef = useRef<THREE.Group>(null!);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (groupRef.current) {
            // Sinusoidal flight path
            const time = state.clock.elapsedTime;
            groupRef.current.position.x = Math.sin(time * 0.3) * 15;
            groupRef.current.position.y = Math.cos(time * 0.2) * 3 + 5;
            groupRef.current.position.z = Math.sin(time * 0.15) * 5 - 10;

            // Gentle rotation
            groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.3;
            groupRef.current.rotation.z = Math.cos(time * 0.3) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={[0, 5, -10]}>
            {/* UFO Body - Purple metallic */}
            <mesh>
                <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#4a0080"
                    metalness={0.8}
                    roughness={0.2}
                    emissive="#4a0080"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* UFO Disc */}
            <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[2.5, 2, 0.3, 32]} />
                <meshStandardMaterial
                    color="#6B21A8"
                    metalness={0.9}
                    roughness={0.1}
                    emissive="#ff4500"
                    emissiveIntensity={0.1}
                />
            </mesh>

            {/* UFO Bottom Ring */}
            <mesh position={[0, -0.4, 0]}>
                <torusGeometry args={[1.8, 0.1, 8, 32]} />
                <meshStandardMaterial
                    color="#ff4500"
                    emissive="#ff4500"
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* UFO Lights */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <mesh
                    key={i}
                    position={[
                        Math.cos(i * Math.PI / 4) * 2,
                        -0.35,
                        Math.sin(i * Math.PI / 4) * 2
                    ]}
                >
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshStandardMaterial
                        color="#22d3ee"
                        emissive="#22d3ee"
                        emissiveIntensity={1}
                    />
                </mesh>
            ))}

            {/* UFO Beam */}
            <mesh position={[0, -2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[1.5, 4, 32, 1, true]} />
                <meshStandardMaterial
                    color="#4a0080"
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                    emissive="#4a0080"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Point light for glow */}
            <pointLight color="#ff4500" intensity={2} distance={10} />
        </group>
    );
}

// Floating Pumpkin
function Pumpkin({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const startY = position[1];
    const offset = Math.random() * Math.PI * 2;

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = startY + Math.sin(state.clock.elapsedTime * 2 + offset) * 0.3;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + offset;
        }
    });

    return (
        <group ref={meshRef} position={position} scale={scale}>
            {/* Pumpkin body */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial
                    color="#ff6a00"
                    emissive="#ff4500"
                    emissiveIntensity={0.3}
                />
            </mesh>
            {/* Pumpkin stem */}
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
                <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.15, 0.1, 0.4]}>
                <coneGeometry args={[0.08, 0.15, 3]} />
                <meshStandardMaterial
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={1}
                />
            </mesh>
            <mesh position={[0.15, 0.1, 0.4]}>
                <coneGeometry args={[0.08, 0.15, 3]} />
                <meshStandardMaterial
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={1}
                />
            </mesh>
            {/* Mouth */}
            <mesh position={[0, -0.15, 0.4]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.3, 0.08, 0.1]} />
                <meshStandardMaterial
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={1}
                />
            </mesh>
            {/* Inner glow */}
            <pointLight color="#ff6a00" intensity={0.5} distance={3} />
        </group>
    );
}

// Flying Bats
function Bats() {
    const batsRef = useRef<THREE.Group>(null!);
    const count = 15;

    const batsData = useMemo(() => {
        return Array.from({ length: count }, () => ({
            offset: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1,
            radius: 8 + Math.random() * 10,
            height: Math.random() * 10 - 5,
            scale: 0.2 + Math.random() * 0.3,
        }));
    }, []);

    useFrame((state) => {
        if (batsRef.current) {
            batsRef.current.children.forEach((bat, i) => {
                const data = batsData[i];
                const time = state.clock.elapsedTime * data.speed + data.offset;
                bat.position.x = Math.sin(time) * data.radius;
                bat.position.z = Math.cos(time) * data.radius - 15;
                bat.position.y = data.height + Math.sin(time * 3) * 0.5;
                bat.rotation.y = -time + Math.PI / 2;
            });
        }
    });

    return (
        <group ref={batsRef}>
            {batsData.map((data, i) => (
                <mesh key={i} scale={data.scale}>
                    {/* Simple bat shape */}
                    <cylinderGeometry args={[0.5, 0.5, 0.1, 3]} />
                    <meshStandardMaterial
                        color="#1a1a1a"
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Floating Ghosts
function Ghosts() {
    const ghostsRef = useRef<THREE.Group>(null!);
    const count = 8;

    const ghostsData = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 30,
            y: Math.random() * 5,
            z: -10 - Math.random() * 20,
            offset: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.3,
        }));
    }, []);

    useFrame((state) => {
        if (ghostsRef.current) {
            ghostsRef.current.children.forEach((ghost, i) => {
                const data = ghostsData[i];
                const time = state.clock.elapsedTime * data.speed + data.offset;
                ghost.position.y = data.y + Math.sin(time) * 1;
                ghost.position.x = data.x + Math.sin(time * 0.5) * 2;
                ghost.rotation.y = Math.sin(time * 0.3) * 0.3;

                // Fade in/out
                const material = (ghost as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (material) {
                    material.opacity = 0.3 + Math.sin(time) * 0.2;
                }
            });
        }
    });

    return (
        <group ref={ghostsRef}>
            {ghostsData.map((data, i) => (
                <mesh key={i} position={[data.x, data.y, data.z]}>
                    <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.4}
                        emissive="#ffffff"
                        emissiveIntensity={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Magical Stars
function Stars() {
    const starsRef = useRef<THREE.Points>(null!);
    const count = 500;

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 100;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 50;
            arr[i * 3 + 2] = -20 - Math.random() * 50;
        }
        return arr;
    }, []);

    useFrame((state) => {
        if (starsRef.current) {
            starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#ffd700"
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}

// Moon
function Moon() {
    const moonRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (moonRef.current) {
            moonRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <mesh ref={moonRef} position={[15, 12, -30]}>
            <sphereGeometry args={[4, 32, 32]} />
            <meshStandardMaterial
                color="#fffacd"
                emissive="#fffacd"
                emissiveIntensity={0.5}
            />
            <pointLight color="#fffacd" intensity={5} distance={50} />
        </mesh>
    );
}

// Floating Candles
function Candles() {
    const candlesRef = useRef<THREE.Group>(null!);
    const count = 12;

    const candlesData = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 25,
            y: 2 + Math.random() * 8,
            z: -5 - Math.random() * 15,
            offset: Math.random() * Math.PI * 2,
        }));
    }, []);

    useFrame((state) => {
        if (candlesRef.current) {
            candlesRef.current.children.forEach((candle, i) => {
                const data = candlesData[i];
                const time = state.clock.elapsedTime + data.offset;
                candle.position.y = data.y + Math.sin(time * 1.5) * 0.2;
                candle.rotation.z = Math.sin(time * 2) * 0.05;
            });
        }
    });

    return (
        <group ref={candlesRef}>
            {candlesData.map((data, i) => (
                <group key={i} position={[data.x, data.y, data.z]}>
                    {/* Candle body */}
                    <mesh>
                        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
                        <meshStandardMaterial color="#f5f5dc" />
                    </mesh>
                    {/* Flame */}
                    <mesh position={[0, 0.35, 0]}>
                        <coneGeometry args={[0.05, 0.15, 8]} />
                        <meshStandardMaterial
                            color="#ff6a00"
                            emissive="#ff4500"
                            emissiveIntensity={2}
                        />
                    </mesh>
                    <pointLight color="#ff6a00" intensity={0.3} distance={3} />
                </group>
            ))}
        </group>
    );
}

// Scene with all elements
function MagicalScene() {
    return (
        <>
            <fog attach="fog" args={['#ffffff', 30, 80]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />

            <UFO />
            <Bats />
            <Ghosts />
            <Stars />
            <Moon />
            <Candles />

            {/* Multiple pumpkins */}
            <Pumpkin position={[-8, 2, -8]} scale={0.8} />
            <Pumpkin position={[10, 4, -12]} scale={1.2} />
            <Pumpkin position={[-12, 6, -15]} scale={0.6} />
            <Pumpkin position={[6, 1, -6]} scale={0.9} />
            <Pumpkin position={[-4, 8, -18]} scale={0.7} />
        </>
    );
}

export default function MagicalBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 50%, #fff7ed 100%)",
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 20], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
            >
                <MagicalScene />
            </Canvas>
        </div>
    );
}
