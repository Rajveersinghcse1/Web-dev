"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimeBasedTheme() {
    const [timeOfDay, setTimeOfDay] = useState<"day" | "evening" | "night">("day");
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const updateTimeOfDay = () => {
            const hour = new Date().getHours();
            let newTime: "day" | "evening" | "night";

            if (hour >= 6 && hour < 17) {
                newTime = "day";
            } else if (hour >= 17 && hour < 20) {
                newTime = "evening";
            } else {
                newTime = "night";
            }

            if (newTime !== timeOfDay) {
                setTimeOfDay(newTime);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
            }
        };

        updateTimeOfDay();
        const interval = setInterval(updateTimeOfDay, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [timeOfDay]);

    useEffect(() => {
        // Apply theme classes
        document.body.classList.remove("theme-day", "theme-evening", "theme-night");
        document.body.classList.add(`theme-${timeOfDay}`);
    }, [timeOfDay]);

    const themes = {
        day: { icon: "☀️", message: "The sun shines upon your quest...", bg: "rgba(255, 250, 240, 0.95)" },
        evening: { icon: "🌅", message: "The witching hour approaches...", bg: "rgba(255, 240, 230, 0.95)" },
        night: { icon: "🌙", message: "Darkness awakens the spirits...", bg: "rgba(240, 240, 255, 0.95)" }
    };

    return (
        <>
            {/* Time notification */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        style={{
                            position: "fixed",
                            top: 100,
                            right: 20,
                            background: themes[timeOfDay].bg,
                            padding: "15px 25px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            boxShadow: "0 10px 40px rgba(74, 0, 128, 0.15)",
                            border: "1px solid rgba(74, 0, 128, 0.1)",
                            zIndex: 9999
                        }}
                    >
                        <span style={{ fontSize: "1.5rem" }}>{themes[timeOfDay].icon}</span>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            {themes[timeOfDay].message}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Theme-specific styles */}
            <style jsx global>{`
                .theme-day {
                    --bg-primary: #ffffff;
                    --bg-secondary: #fafafa;
                }
                
                .theme-evening {
                    --bg-primary: #fffaf5;
                    --bg-secondary: #fff5f0;
                }
                
                .theme-night {
                    --bg-primary: #f8f8ff;
                    --bg-secondary: #f0f0ff;
                }
                
                .theme-night .sectionIcon,
                .theme-night .floatingPumpkin,
                .theme-night .magicSpark {
                    filter: drop-shadow(0 0 15px rgba(255, 106, 0, 0.8));
                }
            `}</style>
        </>
    );
}
