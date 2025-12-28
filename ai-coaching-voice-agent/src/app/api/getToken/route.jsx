import { NextResponse } from "next/server";

/**
 * Token API Route - Disabled
 * 
 * AssemblyAI has been removed from this project.
 * This endpoint returns a 404 to prevent errors.
 */
export async function GET(req) {
    return NextResponse.json(
        { 
            error: 'Service not available',
            message: 'AssemblyAI integration has been removed from this project'
        }, 
        { status: 404 }
    );
}
