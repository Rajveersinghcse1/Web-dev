"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced 3D Pumpkin with professional design
function Pumpkin3D({ isLaughing, onClick }: { isLaughing: boolean; onClick: () => void }) {
    const groupRef = useRef<THREE.Group>(null!);
    const glowRef = useRef<THREE.PointLight>(null!);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (groupRef.current) {
            // Smooth floating animation
            groupRef.current.position.y = Math.sin(time * 1.2) * 0.08;

            if (isLaughing) {
                // Shake effect when laughing
                groupRef.current.rotation.z = Math.sin(time * 25) * 0.08;
                groupRef.current.position.y += Math.sin(time * 20) * 0.1;
            } else {
                // Gentle rotation
                groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
                groupRef.current.rotation.z = 0;
            }
        }

        // Pulsing glow effect
        if (glowRef.current) {
            glowRef.current.intensity = isLaughing
                ? 3 + Math.sin(time * 10) * 1
                : 1.5 + Math.sin(time * 2) * 0.3;
        }
    });

    const pumpkinColor = isLaughing ? "#ff8c00" : "#ff6a00";
    const glowColor = isLaughing ? "#ffff00" : "#ff6a00";
    const faceColor = isLaughing ? "#ffff00" : "#0a0500";

    return (
        <group ref={groupRef} onClick={onClick} scale={1.8}>
            {/* Main pumpkin body - multiple segments for realistic look */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.15, 0, Math.sin(angle) * 0.15]}>
                        <sphereGeometry args={[0.55, 32, 32]} />
                        <meshStandardMaterial
                            color={pumpkinColor}
                            roughness={0.5}
                            metalness={0.1}
                            emissive={isLaughing ? "#ff4500" : "#cc3700"}
                            emissiveIntensity={isLaughing ? 0.4 : 0.15}
                        />
                    </mesh>
                );
            })}

            {/* Top dome */}
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                    color={pumpkinColor}
                    roughness={0.5}
                    metalness={0.1}
                    emissive={isLaughing ? "#ff4500" : "#cc3700"}
                    emissiveIntensity={isLaughing ? 0.3 : 0.1}
                />
            </mesh>

            {/* Stem with detail */}
            <group position={[0, 0.65, 0]} rotation={[0, 0, -0.15]}>
                <mesh>
                    <cylinderGeometry args={[0.06, 0.1, 0.35, 12]} />
                    <meshStandardMaterial color="#2d5a27" roughness={0.8} metalness={0} />
                </mesh>
                {/* Leaf */}
                <mesh position={[0.1, -0.05, 0]} rotation={[0, 0, 0.5]}>
                    <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#3d7a37" roughness={0.7} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* FACE - Left Eye (Triangle) */}
            <mesh position={[-0.22, 0.12, 0.5]} rotation={[0.1, 0, 0]}>
                <coneGeometry args={[0.12, 0.18, 3]} />
                <meshStandardMaterial
                    color={faceColor}
                    emissive={isLaughing ? "#ffff00" : "#000000"}
                    emissiveIntensity={isLaughing ? 3 : 0}
                />
            </mesh>

            {/* Right Eye (Triangle) */}
            <mesh position={[0.22, 0.12, 0.5]} rotation={[0.1, 0, 0]}>
                <coneGeometry args={[0.12, 0.18, 3]} />
                <meshStandardMaterial
                    color={faceColor}
                    emissive={isLaughing ? "#ffff00" : "#000000"}
                    emissiveIntensity={isLaughing ? 3 : 0}
                />
            </mesh>

            {/* Nose (Triangle) */}
            <mesh position={[0, -0.05, 0.52]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.08, 0.14, 3]} />
                <meshStandardMaterial
                    color={faceColor}
                    emissive={isLaughing ? "#ffff00" : "#000000"}
                    emissiveIntensity={isLaughing ? 2 : 0}
                />
            </mesh>

            {/* Mouth - Creepy smile */}
            <mesh position={[0, -0.28, 0.45]} scale={isLaughing ? [1, 1.6, 1] : [1, 1, 1]}>
                <boxGeometry args={[0.45, 0.12, 0.15]} />
                <meshStandardMaterial
                    color={faceColor}
                    emissive={isLaughing ? "#ffff00" : "#000000"}
                    emissiveIntensity={isLaughing ? 3 : 0}
                />
            </mesh>

            {/* Teeth */}
            {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
                <mesh key={`tooth-${i}`} position={[x, -0.23, 0.5]}>
                    <boxGeometry args={[0.06, 0.1, 0.08]} />
                    <meshStandardMaterial
                        color={faceColor}
                        emissive={isLaughing ? "#ffff00" : "#000000"}
                        emissiveIntensity={isLaughing ? 2.5 : 0}
                    />
                </mesh>
            ))}

            {/* Inner glow light */}
            <pointLight
                ref={glowRef}
                color={glowColor}
                intensity={1.5}
                distance={4}
                position={[0, 0, 0.2]}
            />

            {/* Extra ambient glow when laughing */}
            {isLaughing && (
                <pointLight
                    color="#ffcc00"
                    intensity={2}
                    distance={6}
                    position={[0, 0, 0.5]}
                />
            )}
        </group>
    );
}

// Floating particles around pumpkin
function FloatingParticles({ isLaughing }: { isLaughing: boolean }) {
    const particlesRef = useRef<THREE.Points>(null!);
    const count = 50;

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 4;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            particlesRef.current.rotation.x = state.clock.elapsedTime * 0.03;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color={isLaughing ? "#ffcc00" : "#6a0dad"}
                transparent
                opacity={0.6}
            />
        </points>
    );
}

// Scene with all elements
function PumpkinScene({ isLaughing, onPumpkinClick }: { isLaughing: boolean; onPumpkinClick: () => void }) {
    return (
        <>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#6a0dad" />
            <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.5} color="#ff6a00" />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Pumpkin3D isLaughing={isLaughing} onClick={onPumpkinClick} />
            </Float>

            <FloatingParticles isLaughing={isLaughing} />

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 2}
            />
        </>
    );
}

// Main component
export default function BigPumpkin() {
    const [isLaughing, setIsLaughing] = useState(false);
    const [laughText, setLaughText] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick = () => {
        if (!isLaughing) {
            setIsLaughing(true);

            // Animated laugh text sequence
            const laughSequence = ["HA!", "HA HA!", "HA HA HA!", "😈 HA HA HA HA! 😈"];
            laughSequence.forEach((text, i) => {
                setTimeout(() => setLaughText(text), i * 400);
            });

            setTimeout(() => {
                setIsLaughing(false);
                setLaughText("");
            }, 3500);
        }
    };

    if (!mounted) {
        return <div style={{ height: "400px" }} />;
    }

    return (
        <div style={{
            width: "100%",
            height: "400px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
            {/* Instruction badge */}
            <motion.div
                animate={{
                    opacity: isLaughing ? 0 : 1,
                    y: isLaughing ? -20 : 0
                }}
                style={{
                    position: "absolute",
                    top: 0,
                    zIndex: 10,
                    background: "linear-gradient(135deg, rgba(106, 13, 173, 0.15), rgba(255, 106, 0, 0.1))",
                    padding: "10px 24px",
                    borderRadius: "100px",
                    border: "2px solid rgba(255, 106, 0, 0.3)",
                    fontSize: "0.95rem",
                    color: "#ff6a00",
                    fontWeight: 600,
                    backdropFilter: "blur(10px)"
                }}
            >
                👆 Click the Pumpkin!
            </motion.div>

            {/* Laugh text with enhanced animation */}
            <AnimatePresence>
                {laughText && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.5, rotateX: -30 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{ type: "spring", damping: 12 }}
                        style={{
                            position: "absolute",
                            top: 50,
                            zIndex: 20,
                            fontSize: "2.5rem",
                            fontWeight: 900,
                            background: "linear-gradient(135deg, #ff6a00, #ffcc00)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 4px 20px rgba(255, 106, 0, 0.5)",
                            filter: "drop-shadow(0 0 30px rgba(255, 200, 0, 0.5))"
                        }}
                    >
                        {laughText}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Three.js Canvas */}
            <div style={{
                width: "100%",
                height: "350px",
                marginTop: 40,
                cursor: "pointer"
            }}>
                <Canvas
                    camera={{ position: [0, 0.5, 3.5], fov: 45 }}
                    style={{ background: "transparent" }}
                >
                    <Suspense fallback={null}>
                        <PumpkinScene isLaughing={isLaughing} onPumpkinClick={handleClick} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Glow effect behind */}
            <div style={{
                position: "absolute",
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isLaughing ? "350px" : "280px",
                height: isLaughing ? "350px" : "280px",
                background: isLaughing
                    ? "radial-gradient(circle, rgba(255, 200, 0, 0.35) 0%, rgba(255, 106, 0, 0.15) 50%, transparent 70%)"
                    : "radial-gradient(circle, rgba(255, 106, 0, 0.15) 0%, rgba(106, 13, 173, 0.05) 50%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
                transition: "all 0.4s ease",
                zIndex: 0
            }} />

            {/* Interactive hint */}
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    marginTop: "8px",
                    fontSize: "0.85rem",
                    color: "#6a0dad",
                    fontWeight: 500
                }}
            >
                🎃 Drag to rotate • Click to interact 🎃
            </motion.p>
        </div>
    );
}
