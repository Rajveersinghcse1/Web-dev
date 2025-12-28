"use client";

import { motion } from "framer-motion";

export default function SectionDivider() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
                margin: "0 auto",
                maxWidth: "200px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(106, 13, 173, 0.3), transparent)"
            }}
        />
    );
}
