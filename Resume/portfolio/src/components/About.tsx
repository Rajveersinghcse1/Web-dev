"use client";

import styles from "./About.module.css";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
    { value: 200, suffix: "+", label: "Problems Solved" },
    { value: 15, suffix: "+", label: "Projects Built" },
    { value: 50, suffix: "+", label: "Courses Completed" }
];

const skills = [
    "Problem Solving",
    "Fast Learner",
    "Team Collaboration",
    "System Design",
    "Communication"
];

export default function About() {
    return (
        <section id="about" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <h2 className={styles.title}>About Me</h2>
                <p className={styles.subtitle}>A little bit about myself</p>
            </motion.div>

            <div className={styles.content}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={styles.bio}
                >
                    <p>
                        I&apos;m a <strong>second-year B.Tech Computer Science student</strong> at JIET Jodhpur,
                        passionate about building <strong>AI-powered applications</strong> and <strong>full-stack solutions</strong>.
                    </p>
                    <p>
                        My focus is on creating production-ready applications that solve real-world problems
                        through clean, efficient code and modern development practices.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className={styles.stats}
                >
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.stat}>
                            <span className={styles.statValue}>
                                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                            </span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className={styles.strengths}
                >
                    <h3 className={styles.strengthsTitle}>Key Strengths</h3>
                    <div className={styles.strengthsList}>
                        {skills.map((skill) => (
                            <span key={skill} className={styles.strength}>{skill}</span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
