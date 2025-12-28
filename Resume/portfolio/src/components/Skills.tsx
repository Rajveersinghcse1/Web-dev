"use client";

import styles from "./SkillsContact.module.css";
import { motion } from "framer-motion";

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
                            {category.skills.map((skill) => (
                                <span key={skill} className={styles.skill}>{skill}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
