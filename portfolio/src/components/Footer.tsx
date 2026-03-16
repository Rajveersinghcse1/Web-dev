"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaHeart, FaPhoneAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.footerContent}>
                    <div className={styles.brandSection}>
                        <span className={styles.logo}>👨‍💻 RAJVEER SINGH</span>
                        <p className={styles.tagline}>Building the future, one line of code at a time.</p>
                        <div className={styles.socialLinks}>
                            <motion.a
                                href="https://github.com/Rajveersinghcse1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialIcon}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaGithub />
                            </motion.a>
                            <motion.a
                                href="https://www.linkedin.com/in/rajveer-singh-cse/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialIcon}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaLinkedin />
                            </motion.a>
                            <motion.a
                                href="mailto:1.rajveersinghcse@gmail.com"
                                className={styles.socialIcon}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaEnvelope />
                            </motion.a>
                        </div>
                    </div>

                    <div className={styles.linksSection}>
                        <h4>Quick Links</h4>
                        <Link href="#about">About</Link>
                        <Link href="#experience">Experience</Link>
                        <Link href="#projects">Projects</Link>
                        <Link href="#skills">Skills</Link>
                        <Link href="#blogs">Blogs</Link>
                        <Link href="#education">Education</Link>
                    </div>

                    <div className={styles.contactSection}>
                        <h4>Get In Touch</h4>
                        <p>
                            <FaEnvelope className={styles.inlineIcon} />
                            <a href="mailto:1.rajveersinghcse@gmail.com" className={styles.emailLink}>
                                1.rajveersinghcse@gmail.com
                            </a>
                        </p>
                        <p>
                            <FaMapMarkerAlt className={styles.inlineIcon} />
                            Jodhpur, India
                        </p>
                        <p>
                            <FaPhoneAlt className={styles.inlineIcon} />
                            <a href="tel:+918529348446" className={styles.emailLink}>
                                +91 8529348446
                            </a>
                        </p>
                        <div className={styles.connectMessage}>
                            <p>Connect with me on GitHub, LinkedIn, or via email!</p>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Rajveer Singh. All rights reserved.
                    </p>
                    <p className={styles.madeWith}>
                        Made with <FaHeart className={styles.heartIcon} /> using Next.js & React
                    </p>
                </div>
            </div>
        </footer>
    );
}
