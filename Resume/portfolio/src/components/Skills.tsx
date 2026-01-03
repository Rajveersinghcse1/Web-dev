"use client";

import styles from "./SkillsContact.module.css";
import { motion } from "framer-motion";
import {
    SiPython, SiJavascript, SiTypescript, SiCplusplus,
    SiReact, SiNextdotjs, SiHtml5, SiTailwindcss, SiFramer,
    SiFastapi, SiNodedotjs, SiExpress,
    SiPandas, SiNumpy, SiScikitlearn, SiTensorflow, SiLangchain,
    SiPostgresql, SiMongodb, SiRedis,
    SiGit, SiDocker, SiPostman, SiLinux
} from "react-icons/si";
import { TbApi, TbSql, TbDatabase } from "react-icons/tb";
import { FaCss3Alt } from "react-icons/fa";
import { VscCode } from "react-icons/vsc";
import { IconType } from "react-icons";

// Icon mapping for each skill
const skillIcons: { [key: string]: IconType } = {
    // Languages
    "Python": SiPython,
    "JavaScript": SiJavascript,
    "TypeScript": SiTypescript,
    "C/C++": SiCplusplus,
    "SQL": TbSql,
    // Frontend
    "React": SiReact,
    "Next.js": SiNextdotjs,
    "HTML/CSS": SiHtml5,
    "Tailwind CSS": SiTailwindcss,
    "Framer Motion": SiFramer,
    // Backend
    "FastAPI": SiFastapi,
    "Node.js": SiNodedotjs,
    "Express": SiExpress,
    "REST APIs": TbApi,
    // Data & AI
    "Pandas": SiPandas,
    "NumPy": SiNumpy,
    "Scikit-learn": SiScikitlearn,
    "TensorFlow": SiTensorflow,
    "LangChain": SiLangchain,
    // Databases
    "PostgreSQL": SiPostgresql,
    "MongoDB": SiMongodb,
    "Redis": SiRedis,
    "Convex": TbDatabase,
    // Tools
    "Git": SiGit,
    "Docker": SiDocker,
    "VS Code": VscCode,
    "Postman": SiPostman,
    "Linux": SiLinux,
};

// Icon colors for each skill
const skillColors: { [key: string]: string } = {
    // Languages
    "Python": "#3776AB",
    "JavaScript": "#F7DF1E",
    "TypeScript": "#3178C6",
    "C/C++": "#00599C",
    "SQL": "#336791",
    // Frontend
    "React": "#61DAFB",
    "Next.js": "#000000",
    "HTML/CSS": "#E34F26",
    "Tailwind CSS": "#06B6D4",
    "Framer Motion": "#0055FF",
    // Backend
    "FastAPI": "#009688",
    "Node.js": "#339933",
    "Express": "#000000",
    "REST APIs": "#6a0dad",
    // Data & AI
    "Pandas": "#150458",
    "NumPy": "#013243",
    "Scikit-learn": "#F7931E",
    "TensorFlow": "#FF6F00",
    "LangChain": "#1C3C3C",
    // Databases
    "PostgreSQL": "#4169E1",
    "MongoDB": "#47A248",
    "Redis": "#DC382D",
    "Convex": "#F97316",
    // Tools
    "Git": "#F05032",
    "Docker": "#2496ED",
    "VS Code": "#007ACC",
    "Postman": "#FF6C37",
    "Linux": "#FCC624",
};

const skillCategories = [
    {
        title: "Languages",
        skills: ["Python", "JavaScript", "TypeScript", "C/C++", "SQL"]
    },
    {
        title: "Frontend",
        skills: ["React", "Next.js", "HTML/CSS", "Tailwind CSS", "Framer Motion"]
    },
    {
        title: "Backend",
        skills: ["FastAPI", "Node.js", "Express", "REST APIs"]
    },
    {
        title: "Data & AI",
        skills: ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "LangChain"]
    },
    {
        title: "Databases",
        skills: ["PostgreSQL", "MongoDB", "Redis", "Convex"]
    },
    {
        title: "Tools",
        skills: ["Git", "Docker", "VS Code", "Postman", "Linux"]
    }
];

export default function Skills() {
    return (
        <section id="skills" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <h2 className={styles.title}>Skills</h2>
                <p className={styles.subtitle}>Technologies and tools I work with</p>
            </motion.div>

            <div className={styles.grid}>
                {skillCategories.map((category, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className={styles.card}
                    >
                        <h3 className={styles.categoryTitle}>{category.title}</h3>
                        <div className={styles.skills}>
                            {category.skills.map((skill) => {
                                const Icon = skillIcons[skill];
                                const color = skillColors[skill];
                                return (
                                    <span key={skill} className={styles.skill}>
                                        {Icon && <Icon className={styles.skillIcon} style={{ color }} />}
                                        {skill}
                                    </span>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
