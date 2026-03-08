"use client";

import { useEffect, useRef, useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

interface HyperTextProps {
    text: string;
    duration?: number;
    delay?: number;
    className?: string;
    triggerOnHover?: boolean;
}

export default function HyperText({
    text,
    duration = 800,
    delay = 0,
    className = "",
    triggerOnHover = true,
}: HyperTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [iterations, setIterations] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startScramble = () => {
        let iter = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText((currentText) =>
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iter) {
                            return text[index];
                        }
                        return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                    })
                    .join("")
            );

            if (iter >= text.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }

            iter += 1 / (duration / 10 / text.length);
        }, 30);
    };

    useEffect(() => {
        const timeout = setTimeout(startScramble, delay);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <span
            className={className}
            onMouseEnter={triggerOnHover ? startScramble : undefined}
            style={{ display: "inline-block", fontFamily: "monospace" }}
        // Monospace font helps preventing jitter
        >
            {displayText}
        </span>
    );
}
