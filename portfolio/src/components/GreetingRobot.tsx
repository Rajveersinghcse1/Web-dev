"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Robot 3D Model Component with mouse tracking
function Robot3D({ isWaving, onClick, mousePosition }: { isWaving: boolean; onClick: () => void; mousePosition: { x: number; y: number } }) {
    const groupRef = useRef<THREE.Group>(null!);
    const { scene } = useGLTF("/models/genkub_greeting_robot.gltf");

    // Clone the scene to avoid sharing issues
    const clonedScene = scene.clone();

    // Target rotation for smooth following
    const targetRotation = useRef({ x: 0, y: 0 });

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (groupRef.current) {
            // Smooth floating animation
            groupRef.current.position.y = Math.sin(time * 1.2) * 0.05;

            if (isWaving) {
                // Bounce animation when waving
                groupRef.current.position.y += Math.sin(time * 15) * 0.03;
                groupRef.current.rotation.z = Math.sin(time * 10) * 0.05;
            } else {
                // Follow mouse - robot looks towards cursor
                targetRotation.current.y = Math.PI + mousePosition.x * 1.8; // Horizontal rotation (increased speed)
                targetRotation.current.x = -mousePosition.y * 1.5; // Vertical tilt (increased speed)

                // Smooth interpolation for natural movement
                groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.15;
                groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.15;
                groupRef.current.rotation.z = 0;
            }
        }
    });

    // Apply custom colors to the robot materials
    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                // Clone the material to avoid affecting other instances
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(mat => {
                        const newMat = mat.clone();
                        applyColorToMaterial(newMat, child.name);
                        return newMat;
                    });
                } else {
                    child.material = child.material.clone();
                    applyColorToMaterial(child.material, child.name);
                }
            }
        });
    }, [clonedScene]);

    const applyColorToMaterial = (material: THREE.Material, nodeName: string) => {
        const lowerName = nodeName.toLowerCase();

        if (material instanceof THREE.MeshStandardMaterial) {
            // Apply portfolio theme colors (purple/blue gradient theme)
            if (lowerName.includes("head") || lowerName.includes("body")) {
                material.color = new THREE.Color("#6a0dad"); // Purple
                material.metalness = 0.3;
                material.roughness = 0.4;
            } else if (lowerName.includes("arm") || lowerName.includes("hand")) {
                material.color = new THREE.Color("#8b5cf6"); // Light purple
                material.metalness = 0.4;
                material.roughness = 0.3;
            } else if (lowerName.includes("eye")) {
                material.color = new THREE.Color("#00d4ff"); // Cyan for eyes
                material.emissive = new THREE.Color("#00d4ff");
                material.emissiveIntensity = isWaving ? 2 : 0.8;
            } else if (lowerName.includes("mouth")) {
                material.color = new THREE.Color("#ff6a00"); // Orange for mouth
                material.emissive = new THREE.Color("#ff6a00");
                material.emissiveIntensity = isWaving ? 1.5 : 0.5;
            } else {
                // Default dark purple for other parts
                material.color = new THREE.Color("#4c1d95");
                material.metalness = 0.5;
                material.roughness = 0.5;
            }
        } else if (material instanceof THREE.MeshBasicMaterial) {
            // MeshBasicMaterial doesn't have metalness/roughness
            material.color = new THREE.Color("#6a0dad");
        }
    };

    return (
        <group ref={groupRef} scale={2.5} rotation={[0, 0, 0]}>
            <primitive object={clonedScene} />

            {/* Invisible clickable area - larger than the robot for easier clicking */}
            <mesh onClick={onClick}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Add ambient glow */}
            <pointLight
                color={isWaving ? "#00d4ff" : "#6a0dad"}
                intensity={isWaving ? 2 : 0.8}
                distance={5}
                position={[0, 0.5, 0.5]}
            />
        </group>
    );
}

// Floating particles around robot
function FloatingParticles({ isWaving }: { isWaving: boolean }) {
    const particlesRef = useRef<THREE.Points>(null!);
    const count = 40;

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
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
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color={isWaving ? "#00d4ff" : "#6a0dad"}
                transparent
                opacity={0.5}
            />
        </points>
    );
}

// Scene with all elements
function RobotScene({ isWaving, onRobotClick, mousePosition }: { isWaving: boolean; onRobotClick: () => void; mousePosition: { x: number; y: number } }) {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#6a0dad" />
            <spotLight position={[0, 5, 0]} intensity={0.6} angle={0.5} color="#00d4ff" />

            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
                <Robot3D isWaving={isWaving} onClick={onRobotClick} mousePosition={mousePosition} />
            </Float>

            <FloatingParticles isWaving={isWaving} />

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
            />
        </>
    );
}

// Main component
export default function GreetingRobot() {
    const [isWaving, setIsWaving] = useState(false);
    const [greetingText, setGreetingText] = useState("");
    const [mounted, setMounted] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Track mouse position relative to the container
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Normalize to -1 to 1 range
                const x = (e.clientX - centerX) / (rect.width / 2);
                const y = (e.clientY - centerY) / (rect.height / 2);

                setMousePosition({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleClick = () => {
        if (!isWaving) {
            setIsWaving(true);

            // Animated greeting text sequence
            const greetingSequence = ["Hello!", "👋 Hi there!", "Welcome!", "🚀 Let's build!"];
            greetingSequence.forEach((text, i) => {
                setTimeout(() => setGreetingText(text), i * 500);
            });

            setTimeout(() => {
                setIsWaving(false);
                setGreetingText("");
            }, 3500);
        }
    };

    if (!mounted) {
        return <div style={{ height: "500px" }} />;
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "650px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            {/* Greeting text with enhanced animation */}
            <AnimatePresence>
                {greetingText && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.5, rotateX: -30 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{ type: "spring", damping: 12 }}
                        style={{
                            position: "absolute",
                            top: 20,
                            zIndex: 20,
                            fontSize: "2.5rem",
                            fontWeight: 900,
                            background: "linear-gradient(135deg, #6a0dad, #00d4ff)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 4px 20px rgba(106, 13, 173, 0.5)",
                            filter: "drop-shadow(0 0 30px rgba(0, 212, 255, 0.5))"
                        }}
                    >
                        {greetingText}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Three.js Canvas - Larger size */}
            <div style={{
                width: "100%",
                height: "600px",
                cursor: "pointer"
            }}>
                <Canvas
                    camera={{ position: [0, 0, 4.5], fov: 50 }}
                    style={{ background: "transparent" }}
                >
                    <Suspense fallback={null}>
                        <RobotScene isWaving={isWaving} onRobotClick={handleClick} mousePosition={mousePosition} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Glow effect behind */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isWaving ? "400px" : "350px",
                height: isWaving ? "400px" : "350px",
                background: isWaving
                    ? "radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, rgba(106, 13, 173, 0.15) 50%, transparent 70%)"
                    : "radial-gradient(circle, rgba(106, 13, 173, 0.15) 0%, rgba(0, 212, 255, 0.05) 50%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
                transition: "all 0.4s ease",
                zIndex: 0
            }} />
        </div>
    );
}

// Preload the GLTF model
useGLTF.preload("/models/genkub_greeting_robot.gltf");
