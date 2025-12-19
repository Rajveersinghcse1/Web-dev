import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

const assemblyAi = new AssemblyAI({ apiKey: process.env.ASSEMBLY_API_KEY });

export async function GET(req) {
    try {
        // Validate API key exists
        if (!process.env.ASSEMBLY_API_KEY) {
            console.error('ASSEMBLY_API_KEY is not configured');
            return NextResponse.json(
                { error: 'API key not configured' }, 
                { status: 500 }
            );
        }

        console.log('Creating AssemblyAI temporary token...');
        
        const tokenResult = await assemblyAi.realtime.createTemporaryToken({ 
            expires_in: 3600,
            model: 'universal-streaming' // Use the new model instead of deprecated one
        });
        
        console.log('Token result type:', typeof tokenResult);
        
        // AssemblyAI SDK returns the token string directly
        let token = tokenResult;
        
        if (typeof tokenResult === 'object' && tokenResult !== null) {
            token = tokenResult.token || JSON.stringify(tokenResult);
        }

        // Validate we have a valid token string
        if (!token || typeof token !== 'string' || token.length < 10) {
            console.error('Invalid token received:', tokenResult);
            return NextResponse.json(
                { error: 'Invalid token received from AssemblyAI' }, 
                { status: 500 }
            );
        }

        console.log('Token generated successfully, length:', token.length);
        
        // Return as object with token property for consistent handling
        return NextResponse.json({ token: token });
    } catch (error) {
        console.error('Error creating AssemblyAI token:', error);
        
        // Check for specific error types
        if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
            return NextResponse.json(
                { error: 'Invalid API key' }, 
                { status: 401 }
            );
        }
        
        if (error.message?.includes('rate') || error.message?.includes('limit')) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' }, 
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create token: ' + (error.message || 'Unknown error') }, 
            { status: 500 }
        );
    }
}