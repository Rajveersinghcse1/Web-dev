"use client";

import { useEffect, useState } from "react";
import styles from "./HalloweenBackground.module.css";

// Generate random particles
const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
        size: 2 + Math.random() * 4,
    }));
};

// Generate floating orbs
const generateOrbs = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 80,
        delay: Math.random() * 3,
        duration: 8 + Math.random() * 4,
        size: 50 + Math.random() * 100,
    }));
};

export default function HalloweenBackground() {
    const [particles] = useState(() => generateParticles(20));
    const [orbs] = useState(() => generateOrbs(5));
    const [showBat, setShowBat] = useState(false);

    // Occasionally show a flying bat
    useEffect(() => {
        const interval = setInterval(() => {
            setShowBat(true);
            setTimeout(() => setShowBat(false), 4000);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.background}>
            {/* Mist orbs */}
            {orbs.map((orb) => (
                <div
                    key={`orb-${orb.id}`}
                    className={styles.mistOrb}
                    style={{
                        left: `${orb.left}%`,
                        top: `${orb.top}%`,
                        width: orb.size,
                        height: orb.size,
                        animationDelay: `${orb.delay}s`,
                        animationDuration: `${orb.duration}s`,
                    }}
                />
            ))}

            {/* Floating particles */}
            {particles.map((particle) => (
                <div
                    key={`particle-${particle.id}`}
                    className={styles.particle}
                    style={{
                        left: `${particle.left}%`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                        width: particle.size,
                        height: particle.size,
                    }}
                />
            ))}

            {/* Cobweb corners */}
            <div className={styles.cobwebTopLeft} />
            <div className={styles.cobwebTopRight} />
            <div className={styles.cobwebBottomLeft} />
            <div className={styles.cobwebBottomRight} />

            {/* Flying bat */}
            {showBat && <div className={styles.bat} />}

            {/* Gradient overlays */}
            <div className={styles.gradientTop} />
            <div className={styles.gradientBottom} />
        </div>
    );
}
