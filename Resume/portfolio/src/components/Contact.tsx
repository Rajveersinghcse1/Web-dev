"use client";

import styles from "./SkillsContact.module.css";
import { motion } from "framer-motion";
import ContactForm from "./ContactForm";

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
                    <div className={styles.contactCard}>
                        <h3>📧 Email</h3>
                        <a href="mailto:rajveer.connect@gmail.com">rajveer.connect@gmail.com</a>
                    </div>
                    <div className={styles.contactCard}>
                        <h3>💼 LinkedIn</h3>
                        <a href="https://linkedin.com/in/rajveersinghcse" target="_blank" rel="noopener noreferrer">
                            linkedin.com/in/rajveersinghcse
                        </a>
                    </div>
                    <div className={styles.contactCard}>
                        <h3>🐙 GitHub</h3>
                        <a href="https://github.com/Rajveersinghcse1" target="_blank" rel="noopener noreferrer">
                            github.com/Rajveersinghcse1
                        </a>
                    </div>
                    <div className={styles.contactCard}>
                        <h3>📍 Location</h3>
                        <p>Jodhpur, India</p>
                    </div>
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
