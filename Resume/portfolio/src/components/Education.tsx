"use client";

import styles from "./Education.module.css";
import { motion } from "framer-motion";

const educationData = [
    {
        degree: "B.Tech in Computer Science",
        institution: "JIET Jodhpur",
        period: "2023 – 2027",
        description: "Focusing on AI/ML, Full-Stack Development, and Data Structures."
    },
    {
        degree: "Higher Secondary (XII)",
        institution: "CBSE Board",
        period: "2022 – 2023",
        description: "Completed with focus on Science stream (PCM)."
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
                <h2 className={styles.title}>Education</h2>
                <p className={styles.subtitle}>Academic background</p>
            </motion.div>

            <div className={styles.timeline}>
                {educationData.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={styles.card}
                    >
                        <div className={styles.cardHeader}>
                            <div>
                                <h3 className={styles.degree}>{item.degree}</h3>
                                <p className={styles.institution}>{item.institution}</p>
                            </div>
                            <span className={styles.period}>{item.period}</span>
                        </div>
                        <p className={styles.description}>{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
