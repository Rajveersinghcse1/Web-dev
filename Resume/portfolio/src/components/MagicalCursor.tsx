"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function MagicalCursor() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
    const trailIdRef = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });

            // Add to trail
            trailIdRef.current++;
            setTrail(prev => {
                const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: trailIdRef.current }];
                return newTrail.slice(-15); // Keep last 15 positions
            });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Cursor trail - magical wand effect */}
            {trail.map((pos, i) => (
                <motion.div
                    key={pos.id}
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 0.3 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: "fixed",
                        left: pos.x - 3,
                        top: pos.y - 3,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: i % 2 === 0 ? "#4a0080" : "#ff4500",
                        pointerEvents: "none",
                        zIndex: 9998,
                        boxShadow: `0 0 10px ${i % 2 === 0 ? "#4a0080" : "#ff4500"}`,
                    }}
                />
            ))}

            {/* Main cursor - magical orb */}
            <motion.div
                animate={{
                    x: mousePos.x - 15,
                    y: mousePos.y - 15,
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                style={{
                    position: "fixed",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "2px solid #4a0080",
                    background: isHovering
                        ? "radial-gradient(circle, rgba(74,0,128,0.3) 0%, transparent 70%)"
                        : "transparent",
                    pointerEvents: "none",
                    zIndex: 9999,
                    boxShadow: isHovering ? "0 0 20px rgba(74,0,128,0.5)" : "none",
                    mixBlendMode: "difference",
                }}
            />

            {/* Inner cursor dot */}
            <motion.div
                animate={{
                    x: mousePos.x - 4,
                    y: mousePos.y - 4,
                }}
                transition={{ type: "spring", stiffness: 800, damping: 35 }}
                style={{
                    position: "fixed",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4a0080 0%, #ff4500 100%)",
                    pointerEvents: "none",
                    zIndex: 10000,
                    boxShadow: "0 0 10px rgba(74,0,128,0.5)",
                }}
            />

            {/* Hide default cursor */}
            <style jsx global>{`
                * {
                    cursor: none !important;
                }
            `}</style>
        </>
    );
}
