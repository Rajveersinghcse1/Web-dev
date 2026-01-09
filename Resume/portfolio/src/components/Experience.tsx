"use client";

import styles from "./Experience.module.css";
import { motion } from "framer-motion";
import { FaBriefcase, FaTrophy, FaExternalLinkAlt, FaAward, FaCertificate } from "react-icons/fa";

const experienceData = [
    {
        icon: FaBriefcase,
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
        icon: FaTrophy,
        title: "CyberAI Hackathon 2025",
        organization: "University of Derby (UK) & American Society of Engineers (USA)",
        date: "November 2025",
        description: "Technical Partner for international hackathon event.",
        link: "https://www.linkedin.com/posts/rajveer-singh-cse_cyberaihack2025-cybersecurity-ai-activity-7399953052214022144-NP33?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEawe0MBkwo7wjeURquG4s1Oo6hjoxjLbfU"
    },
    {
        icon: FaCertificate,
        title: "Professional Certification",
        organization: "Ulster University (UK) & American Society of Engineers (USA)",
        date: "October 2025",
        description: "Professional certification in engineering practices.",
        link: "https://www.linkedin.com/posts/rajveer-singh-cse_certificate-activity-7384527132602900480-tn1J?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEawe0MBkwo7wjeURquG4s1Oo6hjoxjLbfU"
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
                            <div className={styles.headerLeft}>
                                <motion.div 
                                    className={styles.experienceIcon}
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3
                                    }}
                                >
                                    <item.icon style={{ color: "#6a0dad" }} />
                                </motion.div>
                                <div>
                                    <h3 className={styles.role}>{item.title}</h3>
                                    <p className={styles.company}>{item.company}</p>
                                </div>
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
                        <motion.div 
                            className={styles.achievementIcon}
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 4
                            }}
                        >
                            <item.icon style={{ color: "#ffd700" }} />
                        </motion.div>
                        <h4 className={styles.achievementTitle}>{item.title}</h4>
                        <p className={styles.achievementOrg}>{item.organization}</p>
                        <span className={styles.achievementDate}>{item.date}</span>
                        <p className={styles.achievementDesc}>{item.description}</p>
                        {item.link && (
                            <motion.a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={styles.achievementLink}
                                whileHover={{ scale: 1.05, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaExternalLinkAlt /> View Certificate
                            </motion.a>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
