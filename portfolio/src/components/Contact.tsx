"use client";

import styles from "./SkillsContact.module.css";
import { motion } from "framer-motion";
import ContactForm from "./ContactForm";
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const contactItems = [
    {
        icon: HiOutlineMail,
        title: "Email",
        content: "1.rajveersinghcse@gmail.com",
        href: "mailto:1.rajveersinghcse@gmail.com",
        color: "#EA4335"
    },
    {
        icon: FaLinkedin,
        title: "LinkedIn",
        content: "linkedin.com/in/rajveersinghcse",
        href: "https://linkedin.com/in/rajveersinghcse",
        color: "#0A66C2"
    },
    {
        icon: FaGithub,
        title: "GitHub",
        content: "github.com/Rajveersinghcse1",
        href: "https://github.com/Rajveersinghcse1",
        color: "#333"
    },
    {
        icon: HiOutlineLocationMarker,
        title: "Location",
        content: "Jodhpur, India",
        href: null,
        color: "#6a0dad"
    }
];

export default function Contact() {
    return (
        <section id="contact" className={`container section ${styles.section}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.header}
            >
                <h2 className={styles.title}>Get In Touch</h2>
                <p className={styles.subtitle}>Have a project in mind? Let&apos;s connect!</p>
            </motion.div>

            <div className={styles.contactContent}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={styles.contactInfo}
                >
                    {contactItems.map((item, index) => {
                        const Icon = item.icon;
                        const content = item.href ? (
                            <a
                                href={item.href}
                                target={item.href.startsWith("mailto") ? undefined : "_blank"}
                                rel="noopener noreferrer"
                            >
                                {item.content}
                            </a>
                        ) : (
                            <p>{item.content}</p>
                        );

                        return (
                            <motion.div
                                key={index}
                                className={styles.contactCard}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, x: 5 }}
                            >
                                <motion.div
                                    className={styles.contactIconWrapper}
                                    style={{ backgroundColor: `${item.color}15` }}
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatDelay: 2 + index
                                    }}
                                >
                                    <Icon className={styles.contactIcon} style={{ color: item.color }} />
                                </motion.div>
                                <div className={styles.contactCardContent}>
                                    <h3>{item.title}</h3>
                                    {content}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className={styles.formWrapper}
                >
                    <ContactForm />
                </motion.div>
            </div>
        </section>
    );
}
