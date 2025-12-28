"use client";

import styles from "./Projects.module.css";
import { motion } from "framer-motion";

const projects = [
    {
        title: "AI Coaching Voice Agent",
        description: "Voice-first coaching platform with STT/TTS pipelines and Gemini AI for real-time mock interviews and feedback.",
        stack: ["Next.js 14", "Convex", "FastAPI", "AssemblyAI", "gTTS"],
        links: {
            github: "https://github.com/Rajveersinghcse1/Webdev/tree/main/ai-coaching-voiceagent",
            live: "https://placement-trainee-git-main-rajveersinghcse1s-projects.vercel.app/"
        }
    },
    {
        title: "Coding Society Platform",
        description: "Full-stack education hub with gamification, quizzes, and live code editor for integrated learning paths.",
        stack: ["React", "Next.js", "FastAPI", "MongoDB", "Redis"],
        links: {
            github: "https://github.com/Rajveersinghcse1/Webdev/tree/main/Coding%20Society",
            live: "https://web-dev3390.vercel.app"
        }
    },
    {
        title: "Mine Excellence Dashboard",
        description: "AI-powered dashboard for mining data analysis with auto-filtering and visual reporting.",
        stack: ["React", "Data Visualization", "AI Integration"],
        links: {
            github: "https://github.com/1Rajveer-Singh/Mine-Excellence-Dashboard",
            live: "https://mine-excellence-dashboard.vercel.app"
        }
    }
];

export default function Projects() {
    return (
        <section id="projects" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <h2 className={styles.title}>Projects</h2>
                <p className={styles.subtitle}>Selected work and side projects</p>
            </motion.div>

            <div className={styles.grid}>
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={styles.card}
                    >
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <p className={styles.projectDesc}>{project.description}</p>

                        <div className={styles.stack}>
                            {project.stack.map((tech) => (
                                <span key={tech} className={styles.tech}>{tech}</span>
                            ))}
                        </div>

                        <div className={styles.links}>
                            {project.links.github && (
                                <a href={project.links.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                    Code →
                                </a>
                            )}
                            {project.links.live && (
                                <a href={project.links.live} target="_blank" rel="noopener noreferrer" className={styles.linkPrimary}>
                                    Live Demo →
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
