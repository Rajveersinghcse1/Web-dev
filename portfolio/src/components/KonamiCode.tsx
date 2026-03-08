"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KonamiCode() {
    const [isActivated, setIsActivated] = useState(false);
    const [sequence, setSequence] = useState<string[]>([]);
    const [showHint, setShowHint] = useState(false);

    const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.key;
        const newSequence = [...sequence, key].slice(-10);
        setSequence(newSequence);

        if (newSequence.join(",") === konamiCode.join(",")) {
            setIsActivated(true);
            document.body.classList.add("super-spooky-mode");

            // Play sound if available
            const audio = new Audio();
            audio.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYbJjzSiAAAAAAAAAAAAAAAAAAA=";
            audio.volume = 0.3;
            audio.play().catch(() => { });

            setTimeout(() => {
                setIsActivated(false);
                document.body.classList.remove("super-spooky-mode");
            }, 10000);
        }
    }, [sequence]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Show hint after 30 seconds
    useEffect(() => {
        const timeout = setTimeout(() => setShowHint(true), 30000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {/* Hint for Konami code */}
            <AnimatePresence>
                {showHint && !isActivated && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: "fixed",
                            bottom: 20,
                            left: 20,
                            background: "rgba(26, 26, 46, 0.95)",
                            color: "white",
                            padding: "12px 20px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            border: "1px solid rgba(74, 0, 128, 0.3)",
                            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)"
                        }}
                    >
                        <span>🎮</span>
                        <span>Try the Konami Code for a secret...</span>
                        <button
                            onClick={() => setShowHint(false)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "rgba(255,255,255,0.5)",
                                cursor: "pointer",
                                marginLeft: "10px"
                            }}
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Activated effect */}
            <AnimatePresence>
                {isActivated && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            pointerEvents: "none",
                            zIndex: 9998,
                            background: "radial-gradient(circle at center, transparent 0%, rgba(74, 0, 128, 0.1) 100%)"
                        }}
                    >
                        {/* Floating emojis explosion */}
                        {Array.from({ length: 50 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: "50vw",
                                    y: "50vh",
                                    scale: 0,
                                    opacity: 1
                                }}
                                animate={{
                                    x: `${Math.random() * 100}vw`,
                                    y: `${Math.random() * 100}vh`,
                                    scale: 1,
                                    opacity: 0,
                                    rotate: Math.random() * 360
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    delay: i * 0.02
                                }}
                                style={{
                                    position: "absolute",
                                    fontSize: "2rem"
                                }}
                            >
                                {["🎃", "👻", "🦇", "💀", "🕷️", "🧙", "🪄", "🔮", "⚗️", "🌙"][i % 10]}
                            </motion.div>
                        ))}

                        {/* Secret message */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                textAlign: "center"
                            }}
                        >
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎃👻🧙</div>
                            <h2 style={{
                                fontSize: "2rem",
                                color: "var(--accent-purple)",
                                textShadow: "0 0 30px var(--accent-glow)"
                            }}>
                                SUPER SPOOKY MODE ACTIVATED!
                            </h2>
                            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                                You discovered the secret! 👀
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Super spooky mode styles */}
            <style jsx global>{`
                .super-spooky-mode {
                    animation: spookyShake 0.5s ease-in-out infinite;
                }
                
                .super-spooky-mode * {
                    filter: hue-rotate(30deg);
                }
                
                @keyframes spookyShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
            `}</style>
        </>
    );
}
