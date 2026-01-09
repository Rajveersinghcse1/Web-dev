"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaHeart } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.footerContent}>
                    <div className={styles.brandSection}>
                        <span className={styles.logo}>🎃 RAJVEER SINGH</span>
                        <p className={styles.tagline}>Building the future, one line of code at a time.</p>
                        <div className={styles.socialLinks}>
                            <a href="https://github.com/Rajveersinghcse1" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                                <FaGithub />
                            </a>
                            <a href="https://linkedin.com/in/rajveersinghcse" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                                <FaLinkedin />
                            </a>
                            <a href="mailto:rajveer.connect@gmail.com" className={styles.socialIcon}>
                                <FaEnvelope />
                            </a>
                        </div>
                    </div>

                    <div className={styles.linksSection}>
                        <h4>Quick Links</h4>
                        <Link href="#about">About</Link>
                        <Link href="#experience">Experience</Link>
                        <Link href="#projects">Projects</Link>
                        <Link href="#skills">Skills</Link>
                        <Link href="#contact">Contact</Link>
                    </div>

                    <div className={styles.contactSection}>
                        <h4>Contact Info</h4>
                        <p>
                            <FaEnvelope className={styles.inlineIcon} />
                            rajveer.connect@gmail.com
                        </p>
                        <p>
                            <FaMapMarkerAlt className={styles.inlineIcon} />
                            Jodhpur, India
                        </p>
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
