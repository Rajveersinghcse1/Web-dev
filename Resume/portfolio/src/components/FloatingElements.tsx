"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FloatingElements.module.css";

interface FloatingItem {
    id: number;
    type: "pumpkin" | "hat" | "spider" | "candy" | "skull" | "potion" | "wand" | "crystal" | "eye" | "cauldron";
    x: number;
    y: number;
    size: number;
    rotation: number;
    duration: number;
}

const emojis = {
    pumpkin: "🎃",
    hat: "🎩",
    spider: "🕷️",
    candy: "🍬",
    skull: "💀",
    potion: "🧪",
    wand: "🪄",
    crystal: "🔮",
    eye: "👁️",
    cauldron: "🫕"
};

export default function FloatingElements() {
    const [elements, setElements] = useState<FloatingItem[]>([]);

    useEffect(() => {
        // Create initial floating elements
        const types: FloatingItem["type"][] = ["pumpkin", "hat", "spider", "candy", "skull", "potion", "wand", "crystal", "eye", "cauldron"];
        const initial: FloatingItem[] = [];

        for (let i = 0; i < 25; i++) {
            initial.push({
                id: i,
                type: types[Math.floor(Math.random() * types.length)],
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 20 + Math.random() * 30,
                rotation: Math.random() * 360,
                duration: 10 + Math.random() * 20,
            });
        }

        setElements(initial);

        // Periodically add new elements
        const interval = setInterval(() => {
            const newElement: FloatingItem = {
                id: Date.now(),
                type: types[Math.floor(Math.random() * types.length)],
                x: Math.random() * 100,
                y: 110, // Start below viewport
                size: 20 + Math.random() * 30,
                rotation: Math.random() * 360,
                duration: 15 + Math.random() * 10,
            };

            setElements(prev => {
                const updated = [...prev, newElement];
                // Keep max 40 elements
                if (updated.length > 40) {
                    return updated.slice(-40);
                }
                return updated;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <AnimatePresence>
                {elements.map((el) => (
                    <motion.div
                        key={el.id}
                        className={styles.element}
                        initial={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            rotate: el.rotation,
                            opacity: 0,
                        }}
                        animate={{
                            top: "-10%",
                            rotate: el.rotation + 360,
                            opacity: [0, 0.6, 0.6, 0],
                        }}
                        transition={{
                            duration: el.duration,
                            ease: "linear",
                        }}
                        style={{
                            fontSize: el.size,
                        }}
                    >
                        {emojis[el.type]}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Static corner decorations */}
            <div className={styles.cornerPumpkin1}>🎃</div>
            <div className={styles.cornerPumpkin2}>🎃</div>
            <div className={styles.cornerHat}>🎩</div>
            <div className={styles.cornerWand}>🪄</div>
            <div className={styles.cornerSpider}>🕷️</div>
            <div className={styles.cornerCrystal}>🔮</div>
        </div>
    );
}
