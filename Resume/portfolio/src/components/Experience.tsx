"use client";

import styles from "./Experience.module.css";
import { motion } from "framer-motion";

const experienceData = [
    {
        title: "Data Analysis Intern",
        company: "Continuous Excellence Pvt. Ltd.",
        date: "May 2025 – July 2025",
        description: "Developed comprehensive dashboards and AI-powered data analysis tools.",
        achievements: [
            "Built a dashboard for the Mine Excellence website with real-time data visualization",
            "Redesigned the interface for improved usability and user experience",
            "Integrated AI functionality for auto-filtering and actionable insights"
        ],
        tags: ["Data Analysis", "AI", "Dashboard", "UX Design"]
    }
];

const achievementsData = [
    {
        title: "CyberAI Hackathon 2025",
        organization: "University of Derby (UK) & American Society of Engineers (USA)",
        date: "November 2025",
        description: "Technical Partner for international hackathon event."
    },
    {
        title: "Professional Certification",
        organization: "Ulster University (UK) & American Society of Engineers (USA)",
        date: "October 2025",
        description: "Professional certification in engineering practices."
    }
];

export default function Experience() {
    return (
        <section id="experience" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <h2 className={styles.title}>Experience</h2>
                <p className={styles.subtitle}>Professional journey and achievements</p>
            </motion.div>

            <div className={styles.timeline}>
                {experienceData.map((item, index) => (
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
                                <h3 className={styles.role}>{item.title}</h3>
                                <p className={styles.company}>{item.company}</p>
                            </div>
                            <span className={styles.date}>{item.date}</span>
                        </div>

                        <p className={styles.description}>{item.description}</p>

                        <ul className={styles.achievements}>
                            {item.achievements.map((ach, i) => (
                                <li key={i}>{ach}</li>
                            ))}
                        </ul>

                        <div className={styles.tags}>
                            {item.tags.map(tag => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Achievements */}
            <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={styles.achievementsTitle}
            >
                🏆 Achievements
            </motion.h3>

            <div className={styles.achievementsGrid}>
                {achievementsData.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className={styles.achievementCard}
                    >
                        <h4 className={styles.achievementTitle}>{item.title}</h4>
                        <p className={styles.achievementOrg}>{item.organization}</p>
                        <span className={styles.achievementDate}>{item.date}</span>
                        <p className={styles.achievementDesc}>{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
