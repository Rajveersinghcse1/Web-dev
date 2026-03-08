"use client";

import styles from "./SkillsContact.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { IconType } from "react-icons";
import {
    SiPython, SiJavascript, SiTypescript, SiCplusplus,
    SiReact, SiNextdotjs, SiHtml5, SiTailwindcss,
    SiFastapi, SiNodedotjs, SiExpress,
    SiPandas, SiNumpy, SiScikitlearn, SiTensorflow,
    SiPostgresql, SiMongodb, SiRedis,
    SiGit, SiDocker, SiPostman, SiLinux,
    SiFramer, SiLangchain
} from "react-icons/si";
import { TbSql, TbDatabase, TbBrandFramerMotion, TbBrandPython } from "react-icons/tb";
import { VscCode } from "react-icons/vsc";
import { MdApi } from "react-icons/md";
import { IoClose } from "react-icons/io5";

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
    "REST APIs": MdApi,
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

// Skill experience/practice information
const skillExperience: { [key: string]: { description: string; projects: string[] } } = {
    "Python": {
        description: "Primary language for AI/ML, data analysis, and backend development. Proficient in writing clean, efficient code.",
        projects: ["AI Chatbots", "Data Analysis Tools", "FastAPI Backend Services", "Machine Learning Models"]
    },
    "JavaScript": {
        description: "Core language for web development, used extensively in frontend and backend projects.",
        projects: ["Interactive Web Apps", "React Components", "Node.js APIs", "Full-Stack Applications"]
    },
    "TypeScript": {
        description: "Type-safe development for large-scale applications. Used in Next.js and React projects.",
        projects: ["Enterprise Web Apps", "Type-Safe APIs", "React/Next.js Projects", "Component Libraries"]
    },
    "C/C++": {
        description: "Strong foundation in data structures, algorithms, and competitive programming.",
        projects: ["DSA Problem Solving", "Performance-Critical Code", "System Programming"]
    },
    "SQL": {
        description: "Database querying and optimization for relational databases.",
        projects: ["Complex Queries", "Database Design", "Data Analysis", "Performance Optimization"]
    },
    "React": {
        description: "Building modern, interactive user interfaces with hooks and state management.",
        projects: ["Portfolio Websites", "E-commerce Platforms", "Dashboard Applications", "SPA Development"]
    },
    "Next.js": {
        description: "Full-stack React framework with SSR, SSG, and API routes for production apps.",
        projects: ["Portfolio Sites", "SEO-Optimized Websites", "Full-Stack Applications", "Static Sites"]
    },
    "HTML/CSS": {
        description: "Semantic HTML and modern CSS including Flexbox, Grid, and responsive design.",
        projects: ["Responsive Layouts", "UI Components", "Landing Pages", "Web Animations"]
    },
    "Tailwind CSS": {
        description: "Utility-first CSS framework for rapid UI development.",
        projects: ["Modern UIs", "Responsive Designs", "Component Styling", "Design Systems"]
    },
    "Framer Motion": {
        description: "Production-ready animations for React applications.",
        projects: ["Page Transitions", "Interactive Animations", "Micro-interactions", "Gesture Animations"]
    },
    "FastAPI": {
        description: "Modern Python framework for building high-performance APIs.",
        projects: ["REST APIs", "AI Service Backends", "Data Processing APIs", "Real-time Services"]
    },
    "Node.js": {
        description: "Server-side JavaScript runtime for scalable backend services.",
        projects: ["REST APIs", "Real-time Services", "Microservices", "Backend Systems"]
    },
    "Express": {
        description: "Minimal Node.js framework for web applications and APIs.",
        projects: ["Web Servers", "API Development", "Middleware Systems", "Backend Services"]
    },
    "REST APIs": {
        description: "Designing and implementing RESTful APIs following best practices.",
        projects: ["CRUD APIs", "Authentication Systems", "Data Services", "Third-party Integrations"]
    },
    "Pandas": {
        description: "Data manipulation and analysis library for Python.",
        projects: ["Data Cleaning", "Statistical Analysis", "CSV Processing", "Data Transformation"]
    },
    "NumPy": {
        description: "Numerical computing with Python for array operations.",
        projects: ["Mathematical Operations", "Array Processing", "Scientific Computing", "Data Analysis"]
    },
    "Scikit-learn": {
        description: "Machine learning algorithms and model building.",
        projects: ["Classification Models", "Regression Analysis", "Model Training", "Data Preprocessing"]
    },
    "TensorFlow": {
        description: "Deep learning framework for neural networks and AI models.",
        projects: ["Neural Networks", "Image Processing", "Deep Learning Models", "AI Applications"]
    },
    "LangChain": {
        description: "Building LLM-powered applications with chains and agents.",
        projects: ["AI Chatbots", "RAG Systems", "Document Processing", "LLM Applications"]
    },
    "PostgreSQL": {
        description: "Advanced relational database with complex queries and optimization.",
        projects: ["Database Design", "Complex Queries", "Data Modeling", "Backend Integration"]
    },
    "MongoDB": {
        description: "NoSQL database for flexible, scalable data storage.",
        projects: ["Document Storage", "Real-time Apps", "API Backends", "Data Aggregation"]
    },
    "Redis": {
        description: "In-memory data store for caching and real-time applications.",
        projects: ["Caching Systems", "Session Management", "Real-time Features", "Performance Optimization"]
    },
    "Convex": {
        description: "Real-time backend platform for modern applications.",
        projects: ["Real-time Apps", "Backend Services", "Database Management", "API Development"]
    },
    "Git": {
        description: "Version control for collaborative development and code management.",
        projects: ["Code Versioning", "Team Collaboration", "Branch Management", "CI/CD Workflows"]
    },
    "Docker": {
        description: "Containerization for consistent development and deployment.",
        projects: ["Container Deployment", "Development Environments", "Microservices", "DevOps"]
    },
    "VS Code": {
        description: "Primary IDE with extensions for efficient development workflow.",
        projects: ["Code Development", "Debugging", "Git Integration", "Extension Usage"]
    },
    "Postman": {
        description: "API testing and development tool for backend services.",
        projects: ["API Testing", "Request Collections", "Automated Testing", "API Documentation"]
    },
    "Linux": {
        description: "Unix-based system administration and command-line proficiency.",
        projects: ["Server Management", "Shell Scripting", "System Configuration", "DevOps Tasks"]
    }
};

const skillCategories = [
    {
        category: "Languages",
        skills: [
            { name: "Python", icon: <SiPython /> },
            { name: "JavaScript", icon: <SiJavascript /> },
            { name: "TypeScript", icon: <SiTypescript /> },
            { name: "C/C++", icon: <SiCplusplus /> },
            { name: "SQL", icon: <TbSql /> }
        ]
    },
    {
        category: "Frontend",
        skills: [
            { name: "React", icon: <SiReact /> },
            { name: "Next.js", icon: <SiNextdotjs /> },
            { name: "HTML/CSS", icon: <SiHtml5 /> },
            { name: "Tailwind CSS", icon: <SiTailwindcss /> },
            { name: "Framer Motion", icon: <TbBrandFramerMotion /> }
        ]
    },
    {
        category: "Backend",
        skills: [
            { name: "FastAPI", icon: <SiFastapi /> },
            { name: "Node.js", icon: <SiNodedotjs /> },
            { name: "Express", icon: <SiExpress /> },
            { name: "REST APIs", icon: <MdApi /> }
        ]
    },
    {
        category: "Data & AI",
        skills: [
            { name: "Pandas", icon: <SiPandas /> },
            { name: "NumPy", icon: <SiNumpy /> },
            { name: "Scikit-learn", icon: <SiScikitlearn /> },
            { name: "TensorFlow", icon: <SiTensorflow /> },
            { name: "LangChain", icon: <TbBrandPython /> }
        ]
    },
    {
        category: "Databases",
        skills: [
            { name: "PostgreSQL", icon: <SiPostgresql /> },
            { name: "MongoDB", icon: <SiMongodb /> },
            { name: "Redis", icon: <SiRedis /> },
            { name: "Convex", icon: <TbDatabase /> }
        ]
    },
    {
        category: "Tools",
        skills: [
            { name: "Git", icon: <SiGit /> },
            { name: "Docker", icon: <SiDocker /> },
            { name: "VS Code", icon: <VscCode /> },
            { name: "Postman", icon: <SiPostman /> },
            { name: "Linux", icon: <SiLinux /> }
        ]
    }
];

export default function Skills() {
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    const handleSkillClick = (skill: string) => {
        setSelectedSkill(skill);
    };

    const closeModal = () => {
        setSelectedSkill(null);
    };

    return (
        <section id="skills" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <h2 className={styles.title}>Skills</h2>
                <p className={styles.subtitle}>Technologies and tools I work with (Click to learn more)</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.grid}
            >
                {skillCategories.map((category, categoryIndex) => (
                    <motion.div
                        key={category.category}
                        className={styles.card}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: categoryIndex * 0.1 }}
                    >
                        <h3 className={styles.categoryTitle}>{category.category}</h3>
                        <div className={styles.skills}>
                            {category.skills.map((skill, skillIndex) => (
                                <motion.div
                                    key={skill.name}
                                    className={styles.skill}
                                    onClick={() => handleSkillClick(skill.name)}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: skillIndex * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <span className={styles.skillIcon}>{skill.icon}</span>
                                    <span className={styles.skillName}>{skill.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {selectedSkill && skillExperience[selectedSkill] && (
                    <>
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                        />
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50 }}
                            transition={{ type: "spring", damping: 25 }}
                        >
                            <button className={styles.closeButton} onClick={closeModal}>
                                <IoClose />
                            </button>

                            <div className={styles.modalHeader}>
                                {skillIcons[selectedSkill] && (
                                    <motion.div
                                        className={styles.modalIcon}
                                        animate={{
                                            rotate: [0, 360],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            duration: 0.6
                                        }}
                                    >
                                        {(() => {
                                            const Icon = skillIcons[selectedSkill];
                                            return <Icon style={{ color: skillColors[selectedSkill] }} />;
                                        })()}
                                    </motion.div>
                                )}
                                <h3>{selectedSkill}</h3>
                            </div>

                            <div className={styles.modalContent}>
                                <p className={styles.modalDescription}>
                                    {skillExperience[selectedSkill].description}
                                </p>

                                <div className={styles.modalProjects}>
                                    <h4>Practice & Experience:</h4>
                                    <ul>
                                        {skillExperience[selectedSkill].projects.map((project, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                {project}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
