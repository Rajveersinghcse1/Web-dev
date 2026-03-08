"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const [scrollPercent, setScrollPercent] = useState(0);

    // Potion fill level
    const potionLevel = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    useEffect(() => {
        return scrollYProgress.onChange((v) => {
            setScrollPercent(Math.round(v * 100));
        });
    }, [scrollYProgress]);

    return (
        <motion.div
            style={{
                position: "fixed",
                bottom: 30,
                right: 30,
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
        >
            {/* Potion bottle */}
            <div
                style={{
                    width: 40,
                    height: 70,
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px 8px 20px 20px",
                    border: "2px solid rgba(74, 0, 128, 0.2)",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 5px 20px rgba(74, 0, 128, 0.15)"
                }}
            >
                {/* Cork */}
                <div
                    style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 20,
                        height: 12,
                        background: "#8b4513",
                        borderRadius: "4px 4px 0 0",
                        border: "2px solid #5d3a1a"
                    }}
                />

                {/* Neck */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 18,
                        height: 15,
                        background: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "2px"
                    }}
                />

                {/* Liquid */}
                <motion.div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: potionLevel,
                        background: "linear-gradient(180deg, #ff6a00 0%, #4a0080 100%)",
                        borderRadius: "0 0 18px 18px"
                    }}
                />

                {/* Bubbles */}
                {scrollPercent > 20 && (
                    <motion.div
                        animate={{ y: [-10, -20], opacity: [1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                            position: "absolute",
                            bottom: `${scrollPercent * 0.5}%`,
                            left: 12,
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.6)"
                        }}
                    />
                )}
                {scrollPercent > 40 && (
                    <motion.div
                        animate={{ y: [-10, -25], opacity: [1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                        style={{
                            position: "absolute",
                            bottom: `${scrollPercent * 0.4}%`,
                            right: 10,
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.5)"
                        }}
                    />
                )}
            </div>

            {/* Progress text */}
            <motion.span
                style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "var(--accent-purple)",
                    background: "rgba(255, 255, 255, 0.9)",
                    padding: "4px 10px",
                    borderRadius: "100px",
                    border: "1px solid rgba(74, 0, 128, 0.1)"
                }}
            >
                {scrollPercent}%
            </motion.span>
        </motion.div>
    );
}
