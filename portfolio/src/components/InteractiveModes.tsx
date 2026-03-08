"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Shaders ---

const RippleShader = {
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uClick: { value: 0 }, // Ripple trigger
        uColor: { value: new THREE.Color("#06b6d4") } // NEON CYAN
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uClick;
      uniform vec3 uColor;
      varying vec2 vUv;
      
      void main() {
        float dist = distance(vUv, uMouse);
        float ripple = sin(dist * 60.0 - uTime * 8.0) * exp(-dist * 3.0) * uClick;
        // High contrast ripple
        vec3 color = uColor + vec3(ripple * 2.0); 
        gl_FragColor = vec4(color, 0.2 + abs(ripple) * 0.5);
      }
    `
};

// --- Effects Components ---

function ModeR_Rupture({ active, mouse }: { active: boolean, mouse: THREE.Vector2 }) {
    // Mirror Break: Click spawns shards
    const group = useRef<THREE.Group>(null!);
    const [shards, setShards] = useState<{ pos: THREE.Vector3, vel: THREE.Vector3, rot: THREE.Vector3 }[]>([]);

    useFrame((state, delta) => {
        if (!active) return;

        // Physics update
        setShards(prev => prev.map(s => ({
            pos: s.pos.add(s.vel.clone().multiplyScalar(delta)),
            vel: s.vel, // constant velocity
            rot: s.rot
        })).filter(s => s.pos.y > -5)); // remove fallen
    });

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!active) return;
            // Spawn shards at click
            const newShards: { pos: THREE.Vector3, vel: THREE.Vector3, rot: THREE.Vector3 }[] = [];
            for (let i = 0; i < 15; i++) {
                newShards.push({
                    pos: new THREE.Vector3((e.clientX / window.innerWidth) * 10 - 5, -(e.clientY / window.innerHeight) * 10 + 5, 0),
                    vel: new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8),
                    rot: new THREE.Vector3(Math.random(), Math.random(), Math.random())
                });
            }
            setShards(prev => [...prev, ...newShards]);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [active]);

    if (!active) return null;

    return (
        <group ref={group}>
            {shards.map((s, i) => (
                <mesh key={i} position={s.pos} rotation={[s.rot.x, s.rot.y, s.rot.z]}>
                    <dodecahedronGeometry args={[0.3, 0]} />
                    <meshBasicMaterial color="#ef4444" wireframe={false} toneMapped={false} />
                    {/* NEON RED, SOLID */}
                </mesh>
            ))}
        </group>
    );
}

function ModeA_Aqua({ active }: { active: boolean }) {
    const mat = useRef<THREE.ShaderMaterial>(null!);
    const mouse = useRef(new THREE.Vector2(0.5, 0.5));

    useFrame((state) => {
        if (mat.current) {
            mat.current.uniforms.uTime.value = state.clock.getElapsedTime();
            // Lerp mouse
            mouse.current.lerp(new THREE.Vector2(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5), 0.1);
            mat.current.uniforms.uMouse.value = mouse.current;

            // Auto-ripple on click?
            // simplified: pulse always active for demo
            mat.current.uniforms.uClick.value = 1.0;
        }
    });

    if (!active) return null;

    return (
        <mesh scale={[20, 10, 1]}>
            <planeGeometry args={[1, 1, 64, 64]} />
            <shaderMaterial
                ref={mat}
                args={[RippleShader]}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    )
}

function ModeJ_Join({ active }: { active: boolean }) {
    // Swirl Effect - NEON PURPLE
    const count = 800;
    const mesh = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();
        const mx = state.pointer.x * 10;
        const my = state.pointer.y * 10;

        for (let i = 0; i < count; i++) {
            const t = time + i * 0.05;
            // spiral around mouse
            const r = 2 + Math.sin(t * 0.5 + i);
            const x = mx + Math.cos(t * 2) * r;
            const y = my + Math.sin(t * 2) * r;
            const z = Math.sin(t * 3) * 2;

            dummy.position.set(x, y, z);
            dummy.scale.setScalar(0.08); // Larger particles
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#d946ef" toneMapped={false} />
            {/* NEON PURPLE */}
        </instancedMesh>
    )
}

function ModeController() {
    const [mode, setMode] = useState<string>('default');
    const mouseRef = useRef(new THREE.Vector2());

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (['r', 'a', 'j', 'v', 'e', 'c'].includes(k)) {
                setMode(k);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    // Visual feedback for mode
    return (
        <>
            <group visible={mode === 'r'}>
                <ModeR_Rupture active={mode === 'r'} mouse={mouseRef.current} />
            </group>
            <group visible={mode === 'a'}>
                <ModeA_Aqua active={mode === 'a'} />
            </group>
            <group visible={mode === 'j' || mode === 'v' || mode === 'e'}>
                <ModeJ_Join active={mode === 'j' || mode === 'v' || mode === 'e'} />
            </group>

            {/* Default State (Original Background) */}
            {mode === 'c' || mode === 'default' ? null : null}
        </>
    );
}

export { ModeController };
