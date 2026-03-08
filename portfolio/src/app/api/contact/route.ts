import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        // Send email using Web3Forms (free service)
        // Get your access key from https://web3forms.com/
        const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE";

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: WEB3FORMS_ACCESS_KEY,
                name: name,
                email: email,
                message: message,
                subject: `New Portfolio Contact from ${name}`,
                from_name: "Portfolio Contact Form",
            }),
        });

        const result = await response.json();

        if (result.success) {
            return NextResponse.json(
                { success: true, message: "Message sent successfully!" },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: result.message || "Failed to send message" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
