"use client";

import styles from "./Experience.module.css";
import { motion } from "framer-motion";
import { FaBriefcase, FaTrophy, FaExternalLinkAlt, FaCertificate, FaStar, FaChartBar, FaRobot, FaPalette } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";

// Tech stack icon mapping for experience tags
const tagIcons: { [key: string]: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string } } = {
    "Data Analysis": { icon: FaChartBar, color: "#00d4ff" },
    "AI": { icon: FaRobot, color: "#6a0dad" },
    "Dashboard": { icon: MdDashboard, color: "#ff6a00" },
    "UX Design": { icon: FaPalette, color: "#e91e63" }
};

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
        badge: "🏆",
        title: "CyberAI Hackathon 2025",
        organization: "University of Derby (UK) & American Society of Engineers (USA)",
        role: "Technical Partner",
        date: "November 2025",
        description: "Technical Partner for international hackathon event.",
        link: "https://www.linkedin.com/posts/rajveer-singh-cse_cyberaihack2025-cybersecurity-ai-activity-7399953052214022144-NP33?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEawe0MBkwo7wjeURquG4s1Oo6hjoxjLbfU",
        color: "#ffd700"
    },
    {
        icon: FaCertificate,
        badge: "📜",
        title: "Professional Certification",
        organization: "Ulster University (UK) & American Society of Engineers (USA)",
        role: "Certified Professional",
        date: "October 2025",
        description: "Professional certification in engineering practices.",
        link: "https://www.linkedin.com/posts/rajveer-singh-cse_certificate-activity-7384527132602900480-tn1J?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEawe0MBkwo7wjeURquG4s1Oo6hjoxjLbfU",
        color: "#6a0dad"
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
                <div className={styles.titleWrapper}>
                    <HiSparkles className={styles.sparkle} />
                    <h2 className={styles.title}>Experience</h2>
                    <HiSparkles className={styles.sparkle} />
                </div>
                <p className={styles.subtitle}>Professional journey and achievements</p>
            </motion.div>

            {/* Timeline Section */}
            <div className={styles.timelineContainer}>
                <div className={styles.timeline}>
                    {experienceData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={styles.timelineItem}
                        >
                            <div className={styles.timelineNode}>
                                <motion.div
                                    className={styles.timelineDot}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        boxShadow: [
                                            "0 0 0 0 rgba(106, 13, 173, 0.4)",
                                            "0 0 0 10px rgba(106, 13, 173, 0)",
                                            "0 0 0 0 rgba(106, 13, 173, 0)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                >
                                    <item.icon />
                                </motion.div>
                            </div>
                            <motion.div
                                className={styles.card}
                                whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(106, 13, 173, 0.12)" }}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerInfo}>
                                        <h3 className={styles.role}>{item.title}</h3>
                                        <p className={styles.company}>{item.company}</p>
                                    </div>
                                    <span className={styles.date}>
                                        <span className={styles.dateIcon}>📅</span>
                                        {item.date}
                                    </span>
                                </div>

                                <p className={styles.description}>{item.description}</p>

                                <ul className={styles.achievements}>
                                    {item.achievements.map((ach, i) => (
                                        <li key={i}>
                                            <FaStar className={styles.achievementStar} />
                                            {ach}
                                        </li>
                                    ))}
                                </ul>

                                <div className={styles.tags}>
                                    {item.tags.map(tag => {
                                        const tagInfo = tagIcons[tag];
                                        const TagIcon = tagInfo?.icon;
                                        return (
                                            <motion.span
                                                key={tag}
                                                className={styles.tag}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                            >
                                                {TagIcon && <TagIcon className={styles.tagIcon} style={{ color: tagInfo.color }} />}
                                                {tag}
                                            </motion.span>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Achievements Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.achievementsSection}
            >
                <h3 className={styles.achievementsTitle}>
                    <FaTrophy className={styles.trophyIcon} />
                    Achievements & Certifications
                </h3>

                <div className={styles.achievementsGrid}>
                    {achievementsData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            whileHover={{ y: -6, boxShadow: `0 16px 48px ${item.color}25` }}
                            className={styles.achievementCard}
                        >
                            <div className={styles.achievementHeader}>
                                <motion.div
                                    className={styles.achievementBadge}
                                    style={{ background: `${item.color}15` }}
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatDelay: 2
                                    }}
                                >
                                    <span className={styles.badgeEmoji}>{item.badge}</span>
                                </motion.div>
                                <span className={styles.achievementDate}>{item.date}</span>
                            </div>

                            <h4 className={styles.achievementTitle}>{item.title}</h4>
                            <p className={styles.achievementRole} style={{ color: item.color }}>{item.role}</p>
                            <p className={styles.achievementOrg}>{item.organization}</p>
                            <p className={styles.achievementDesc}>{item.description}</p>

                            {item.link && (
                                <motion.a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.achievementLink}
                                    style={{
                                        background: `${item.color}10`,
                                        color: item.color,
                                        borderColor: `${item.color}30`
                                    }}
                                    whileHover={{ scale: 1.02, x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaExternalLinkAlt />
                                    View Certificate
                                </motion.a>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
