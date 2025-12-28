"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.left}>
                    <span className={styles.logo}>🎃 Rajveer Singh</span>
                    <p className={styles.copy}>© {new Date().getFullYear()} All rights reserved.</p>
                </div>

                <div className={styles.links}>
                    <a href="https://github.com/Rajveersinghcse1" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://linkedin.com/in/rajveersinghcse" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a href="mailto:rajveer.connect@gmail.com">Email</a>
                </div>

                <button
                    className={styles.backToTop}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    ↑ Back to Top
                </button>
            </div>
        </footer>
    );
}
