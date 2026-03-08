"use client";

import styles from "./Education.module.css";
import { motion } from "framer-motion";
import { FaGraduationCap, FaSchool } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const educationData = [
    {
        icon: FaGraduationCap,
        degree: "B.Tech in Computer Science",
        institution: "JIET College, Jodhpur",
        period: "2023 – 2027",
        description: "Focusing on AI/ML, Full-Stack Development, and Data Structures.",
        score: "CGPA: 8.68",
        color: "#6a0dad"
    },
    {
        icon: FaSchool,
        degree: "Schooling",
        institution: "KV NO 1 AFS Jodhpur",
        period: "2020 – 2023",
        description: "Completed Higher Secondary (XII) and Secondary School (X) with Science stream (PCM).",
        score: "XII: 66.4% | X: 85%",
        color: "#00d4ff"
    }
];

export default function Education() {
    return (
        <section id="education" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <div className={styles.titleWrapper}>
                    <HiSparkles className={styles.sparkle} />
                    <h2 className={styles.title}>Education</h2>
                    <HiSparkles className={styles.sparkle} />
                </div>
                <p className={styles.subtitle}>Academic background & achievements</p>
            </motion.div>

            <div className={styles.timeline}>
                {educationData.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            whileHover={{ y: -4, boxShadow: `0 16px 48px ${item.color}15` }}
                            className={styles.card}
                        >
                            <motion.div
                                className={styles.iconWrapper}
                                style={{ background: `${item.color}12` }}
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                            >
                                <Icon className={styles.icon} style={{ color: item.color }} />
                            </motion.div>

                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.degree}>{item.degree}</h3>
                                        <p className={styles.institution} style={{ color: item.color }}>{item.institution}</p>
                                    </div>
                                    <span className={styles.period}>
                                        📅 {item.period}
                                    </span>
                                </div>
                                <p className={styles.description}>{item.description}</p>
                                <p className={styles.score} style={{ color: item.color }}>{item.score}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
