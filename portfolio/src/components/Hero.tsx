"use client";

import Link from "next/link";
import styles from "./Hero.module.css";
import { motion } from "framer-motion";
import HyperText from "./HyperText";
import GreetingRobot from "./GreetingRobot";

export default function Hero() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    };

    return (
        <section className={`container ${styles.hero}`}>
            {/* LEFT SIDE - Text Content */}
            <motion.div
                className={styles.content}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className={styles.eyebrow}>
                    <HyperText text="Rajveer Singh" duration={1200} />
                    <span className={styles.badge}>🤖 Open to Work</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className={styles.name}>
                    AI & Full-Stack<br />
                    <span className={styles.accent}>Developer</span>
                </motion.h1>

                <motion.p variants={itemVariants} className={styles.description}>
                    Crafting production-grade, data-driven applications that solve complex problems.
                    I build modern web experiences with elegant code.
                </motion.p>

                <motion.div variants={itemVariants} className={styles.ctaGroup}>
                    <Link href="#projects" className={styles.primaryBtn}>
                        View My Work
                    </Link>
                    <Link href="#blogs" className={styles.secondaryBtn}>
                        Read Blogs
                    </Link>
                </motion.div>
            </motion.div>

            {/* RIGHT SIDE - Robot */}
            <motion.div
                className={styles.pumpkinSide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                <GreetingRobot />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className={styles.scrollIndicator}
            >
                <span>↓</span>
            </motion.div>
        </section>
    );
}
