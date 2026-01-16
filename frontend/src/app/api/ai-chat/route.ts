import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        // Make HTTP request to Flask server
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        try {
            const response = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response from AI server');
            }

            const result = await response.json();
            return NextResponse.json(result);

        } catch (fetchError: any) {
            clearTimeout(timeout);

            if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout after 60 seconds');
            }

            if (fetchError.code === 'ECONNREFUSED') {
                throw new Error('AI server is not running. Please start it with: python aiml/weather_server.py');
            }

            throw fetchError;
        }

    } catch (error: any) {
        console.error('AI Chat API Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to process request',
                success: false
            },
            { status: 500 }
        );
    }
}
