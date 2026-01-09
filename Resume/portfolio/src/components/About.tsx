"use client";

import styles from "./About.module.css";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { FaBrain, FaRocket, FaUsers, FaCubes, FaComments } from "react-icons/fa";

const stats = [
    { value: 200, suffix: "+", label: "Problems Solved" },
    { value: 15, suffix: "+", label: "Projects Built" },
    { value: 50, suffix: "+", label: "Courses Completed" }
];

const skills = [
    { name: "Problem Solving", icon: FaBrain },
    { name: "Fast Learner", icon: FaRocket },
    { name: "Team Collaboration", icon: FaUsers },
    { name: "System Design", icon: FaCubes },
    { name: "Communication", icon: FaComments }
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
                        <strong>RAJVEER SINGH</strong> | <strong>B.Tech Computer Science (Core)</strong> | <strong>Third Year Student</strong> | JIET College, Jodhpur
                    </p>
                    <p>
                        Passionate about building <strong>AI-powered applications</strong>, <strong>full-stack web solutions</strong>, and <strong>data-driven systems</strong>. 
                        Experienced in developing production-ready applications using modern frameworks and technologies including <strong>Python, JavaScript, React, Next.js, FastAPI</strong>, and cloud platforms.
                    </p>
                    <p>
                        Skilled in <strong>problem-solving</strong>, <strong>system design</strong>, <strong>data analysis</strong>, and <strong>team collaboration</strong>. 
                        Proven track record through internships and projects in creating efficient, scalable solutions that solve real-world problems.
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
                        {skills.map((skill) => {
                            const Icon = skill.icon;
                            return (
                                <span key={skill.name} className={styles.strength}>
                                    <Icon className={styles.strengthIcon} />
                                    {skill.name}
                                </span>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
