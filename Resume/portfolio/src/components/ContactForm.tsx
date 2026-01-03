"use client";

import { useState } from "react";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", message: "" });
                setTimeout(() => setStatus("idle"), 5000);
            } else {
                setStatus("error");
                setErrorMessage(data.message || "Something went wrong. Please try again.");
                setTimeout(() => setStatus("idle"), 5000);
            }
        } catch {
            setStatus("error");
            setErrorMessage("Network error. Please check your connection.");
            setTimeout(() => setStatus("idle"), 5000);
        }
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
                    disabled={status === "loading"}
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
                    disabled={status === "loading"}
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
                    disabled={status === "loading"}
                />
            </div>

            {status === "error" && (
                <div className={styles.errorMessage}>
                    ❌ {errorMessage}
                </div>
            )}

            {status === "success" && (
                <div className={styles.successMessage}>
                    ✅ Message sent successfully! I&apos;ll get back to you soon.
                </div>
            )}

            <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <span className={styles.loadingSpinner}>
                        <span className={styles.spinner}></span>
                        Sending...
                    </span>
                ) : status === "success" ? (
                    "Sent! ✓"
                ) : (
                    "Send Message"
                )}
            </button>
        </form>
    );
}
