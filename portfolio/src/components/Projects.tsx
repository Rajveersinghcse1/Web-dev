"use client";

import styles from "./Projects.module.css";
import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt, FaRocket, FaCode, FaChartLine } from "react-icons/fa";
import {
    SiNextdotjs,
    SiReact,
    SiFastapi,
    SiMongodb,
    SiRedis,
    SiPython
} from "react-icons/si";
import { HiSparkles, HiMicrophone } from "react-icons/hi";
import { BsDatabase, BsGraphUp, BsBroadcast } from "react-icons/bs";

// Tech stack icon mapping
const techIcons: { [key: string]: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string } } = {
    "Next.js 14": { icon: SiNextdotjs, color: "#000000" },
    "Next.js": { icon: SiNextdotjs, color: "#000000" },
    "Convex": { icon: BsDatabase, color: "#F97316" },
    "FastAPI": { icon: SiFastapi, color: "#009688" },
    "AssemblyAI": { icon: BsBroadcast, color: "#3B82F6" },
    "gTTS": { icon: HiMicrophone, color: "#4285F4" },
    "React": { icon: SiReact, color: "#61DAFB" },
    "MongoDB": { icon: SiMongodb, color: "#47A248" },
    "Redis": { icon: SiRedis, color: "#DC382D" },
    "Data Visualization": { icon: BsGraphUp, color: "#FF6B6B" },
    "AI Integration": { icon: FaRocket, color: "#6a0dad" },
    "Python": { icon: SiPython, color: "#3776AB" }
};

const projects = [
    {
        icon: HiMicrophone,
        iconColor: "#00d4ff",
        title: "AI Coaching Voice Agent",
        description: "Voice-first coaching platform with STT/TTS pipelines and Gemini AI for real-time mock interviews and feedback.",
        stack: ["Next.js 14", "Convex", "FastAPI", "AssemblyAI", "gTTS"],
        links: {
            github: "https://github.com/Rajveersinghcse1/Web-dev/tree/main/ai-coaching-voice-agent",
            live: "https://placement-trainee-git-main-rajveersinghcse1s-projects.vercel.app/"
        }
    },
    {
        icon: FaCode,
        iconColor: "#6a0dad",
        title: "Coding Society Platform",
        description: "Full-stack education hub with gamification, quizzes, and live code editor for integrated learning paths.",
        stack: ["React", "Next.js", "FastAPI", "MongoDB", "Redis"],
        links: {
            github: "https://github.com/Rajveersinghcse1/Web-dev/tree/main/Coding%20Society",
            live: "https://web-dev3390.vercel.app"
        }
    },
    {
        icon: FaChartLine,
        iconColor: "#ff6a00",
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
                <div className={styles.titleWrapper}>
                    <HiSparkles className={styles.sparkle} />
                    <h2 className={styles.title}>Projects</h2>
                    <HiSparkles className={styles.sparkle} />
                </div>
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
                        whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(106, 13, 173, 0.12)" }}
                        className={styles.card}
                    >
                        <div className={styles.cardTop}>
                            <motion.div
                                className={styles.projectIcon}
                                style={{ background: `${project.iconColor}15` }}
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.05, 1.05, 1]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                            >
                                <project.icon style={{ color: project.iconColor }} />
                            </motion.div>
                        </div>

                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <p className={styles.projectDesc}>{project.description}</p>

                        <div className={styles.stack}>
                            {project.stack.map((tech) => {
                                const techInfo = techIcons[tech] || { icon: FaCode, color: "#666" };
                                const TechIcon = techInfo.icon;
                                return (
                                    <motion.span
                                        key={tech}
                                        className={styles.tech}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                    >
                                        <TechIcon
                                            className={styles.techIcon}
                                            style={{ color: techInfo.color }}
                                        />
                                        <span className={styles.techName}>{tech}</span>
                                    </motion.span>
                                );
                            })}
                        </div>

                        <div className={styles.links}>
                            {project.links.github && (
                                <motion.a
                                    href={project.links.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.link}
                                    whileHover={{ scale: 1.02, x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaGithub /> Code
                                </motion.a>
                            )}
                            {project.links.live && (
                                <motion.a
                                    href={project.links.live}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkPrimary}
                                    whileHover={{ scale: 1.02, x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaExternalLinkAlt /> Live Demo
                                </motion.a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
