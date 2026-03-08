"use client";

import { useRef, useState, ReactNode } from "react";
import styles from "./SpotlightCard.module.css";

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    variant?: "default" | "dark" | "glow";
}

export default function SpotlightCard({ children, className = "", variant = "default" }: SpotlightCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSpotlightPos({ x, y });

        // 3D tilt effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
        });
    };

    const handleMouseEnter = () => setIsHovering(true);

    const handleMouseLeave = () => {
        setIsHovering(false);
        setTiltStyle({ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)" });
    };

    const variantClass = variant === "dark" ? styles.dark : variant === "glow" ? styles.glow : "";

    return (
        <div
            ref={cardRef}
            className={`${styles.spotlightCard} ${variantClass} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
        >
            {/* Purple spotlight - now with visible color */}
            <div
                className={styles.spotlight1}
                style={{
                    opacity: isHovering ? 1 : 0,
                    left: spotlightPos.x - 200,
                    top: spotlightPos.y - 200,
                    background: `radial-gradient(400px at center, rgba(106, 13, 173, 0.25), transparent 60%)`,
                }}
            />

            {/* Orange spotlight */}
            <div
                className={styles.spotlight2}
                style={{
                    opacity: isHovering ? 0.8 : 0,
                    left: spotlightPos.x - 150,
                    top: spotlightPos.y - 150,
                    background: `radial-gradient(300px at center, rgba(255, 106, 0, 0.2), transparent 60%)`,
                }}
            />

            {/* Content */}
            <div className={styles.cardContent}>
                {children}
            </div>

            {/* Corner accent */}
            <div className={styles.cornerAccent} />
        </div>
    );
}
