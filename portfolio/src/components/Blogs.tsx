"use client";

import styles from "./Blogs.module.css";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { FaArrowRight, FaLinkedin } from "react-icons/fa";

const blogTopics = [
    {
        title: "AI Engineering",
        description: "Notes on shipping practical AI features with stable APIs, feedback loops, and measurable outcomes.",
        status: "Publishing soon"
    },
    {
        title: "Full-Stack Systems",
        description: "Breakdowns of real project architecture, backend decisions, and frontend patterns that scale cleanly.",
        status: "Publishing soon"
    },
    {
        title: "Observability & Reliability",
        description: "Write-ups around monitoring, dashboards, and production visibility using tools like Grafana and Prometheus.",
        status: "Publishing soon"
    }
];

export default function Blogs() {
    return (
        <section id="blogs" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <div className={styles.titleWrapper}>
                    <HiSparkles className={styles.sparkle} />
                    <h2 className={styles.title}>Blogs</h2>
                    <HiSparkles className={styles.sparkle} />
                </div>
                <p className={styles.subtitle}>A writing space for my ideas, experiments, and engineering notes.</p>
            </motion.div>

            <div className={styles.layout}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={styles.featuredCard}
                >
                    <span className={styles.eyebrow}>Writing Hub</span>
                    <h3 className={styles.featuredTitle}>Fresh posts will appear here.</h3>
                    <p className={styles.featuredText}>
                        This section now lives in the portfolio navigation so visitors can jump straight to my writing.
                        Until the first long-form posts are published here, LinkedIn is the best place to follow updates.
                    </p>
                    <a
                        href="https://www.linkedin.com/in/rajveer-singh-cse/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.primaryLink}
                    >
                        <FaLinkedin /> Follow on LinkedIn
                    </a>
                </motion.div>

                <div className={styles.grid}>
                    {blogTopics.map((topic, index) => (
                        <motion.article
                            key={topic.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={styles.card}
                        >
                            <span className={styles.status}>{topic.status}</span>
                            <h3 className={styles.cardTitle}>{topic.title}</h3>
                            <p className={styles.cardText}>{topic.description}</p>
                            <span className={styles.cardHint}>
                                Reserved for upcoming posts <FaArrowRight />
                            </span>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}