"use client";

import { useState } from "react";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });

        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h3 className={styles.formTitle}>Send a Message</h3>

            <div className={styles.field}>
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="message">Message</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Your message..."
                />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : submitted ? "Sent! ✓" : "Send Message"}
            </button>
        </form>
    );
}
