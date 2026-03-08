"use client";

import styles from "./About.module.css";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { FaBrain, FaRocket, FaUsers, FaCubes, FaComments, FaCode, FaLaptopCode, FaDatabase } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const stats = [
    { value: 200, suffix: "+", label: "Problems Solved", icon: FaCode, color: "#6a0dad" },
    { value: 15, suffix: "+", label: "Projects Built", icon: FaLaptopCode, color: "#ff6a00" },
    { value: 50, suffix: "+", label: "Courses Completed", icon: FaDatabase, color: "#00d4ff" }
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
                <div className={styles.titleWrapper}>
                    <HiSparkles className={styles.sparkle} />
                    <h2 className={styles.title}>About Me</h2>
                    <HiSparkles className={styles.sparkle} />
                </div>
                <p className={styles.subtitle}>A little bit about myself</p>
            </motion.div>

            <div className={styles.content}>
                {/* Two Column Layout */}
                <div className={styles.twoColumn}>
                    {/* Left: Key Strengths */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className={styles.strengths}
                    >
                        <h3 className={styles.strengthsTitle}>
                            <span className={styles.strengthsTitleIcon}>✨</span>
                            Key Strengths
                        </h3>
                        <div className={styles.strengthsList}>
                            {skills.map((skill, index) => {
                                const Icon = skill.icon;
                                return (
                                    <motion.div
                                        key={skill.name}
                                        className={styles.strength}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                    >
                                        <Icon className={styles.strengthIcon} />
                                        <span>{skill.name}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Right: Profile & Stats */}
                    <div className={styles.rightColumn}>
                        {/* Profile Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={styles.profileCard}
                        >
                            <div className={styles.profileGradient}></div>
                            <div className={styles.profileContent}>
                                <div className={styles.profileHeader}>
                                    <div className={styles.avatarWrapper}>
                                        <span className={styles.avatarEmoji}>👨‍💻</span>
                                    </div>
                                    <div className={styles.profileInfo}>
                                        <h3 className={styles.profileName}>RAJVEER SINGH</h3>
                                        <p className={styles.profileRole}>B.Tech Computer Science | Third Year Student</p>
                                        <p className={styles.profileLocation}>📍 JIET College, Jodhpur</p>
                                    </div>
                                </div>
                                <div className={styles.bio}>
                                    <p>
                                        Passionate about building <strong>AI-powered applications</strong>, <strong>full-stack web solutions</strong>, and <strong>data-driven systems</strong>.
                                        Experienced in developing production-ready applications using modern frameworks and technologies including <strong>Python, JavaScript, React, Next.js, FastAPI</strong>, and cloud platforms.
                                    </p>
                                    <p>
                                        Skilled in <strong>problem-solving</strong>, <strong>system design</strong>, <strong>data analysis</strong>, and <strong>team collaboration</strong>.
                                        Proven track record through internships and projects in creating efficient, scalable solutions that solve real-world problems.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={styles.stats}
                        >
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        className={styles.stat}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className={styles.statIconWrapper} style={{ background: `${stat.color}15` }}>
                                            <Icon className={styles.statIcon} style={{ color: stat.color }} />
                                        </div>
                                        <span className={styles.statValue} style={{ color: stat.color }}>
                                            <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                                        </span>
                                        <span className={styles.statLabel}>{stat.label}</span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
