"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
}

export default function SparkleEffect() {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const colors = ["#4a0080", "#ff4500", "#ffd700", "#22d3ee", "#ff6a00"];
            const newSparkles: Sparkle[] = [];

            // Create 12 sparkles on click
            for (let i = 0; i < 12; i++) {
                newSparkles.push({
                    id: Date.now() + i,
                    x: e.clientX + (Math.random() - 0.5) * 60,
                    y: e.clientY + (Math.random() - 0.5) * 60,
                    size: 4 + Math.random() * 8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                });
            }

            setSparkles(prev => [...prev, ...newSparkles]);

            // Remove sparkles after animation
            setTimeout(() => {
                setSparkles(prev => prev.filter(s => !newSparkles.includes(s)));
            }, 1000);
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    return (
        <div style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }}>
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    initial={{
                        x: sparkle.x,
                        y: sparkle.y,
                        scale: 1,
                        opacity: 1
                    }}
                    animate={{
                        x: sparkle.x + (Math.random() - 0.5) * 100,
                        y: sparkle.y - 50 - Math.random() * 50,
                        scale: 0,
                        opacity: 0,
                        rotate: 360
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        width: sparkle.size,
                        height: sparkle.size,
                        borderRadius: "50%",
                        backgroundColor: sparkle.color,
                        boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`,
                    }}
                />
            ))}
        </div>
    );
}
