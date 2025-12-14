import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

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

        // Path to Python script
        const scriptPath = path.join(process.cwd(), '..', 'aiml', 'weather_predict_api.py');

        // Execute Python script
        const pythonProcess = spawn('python', [scriptPath, query]);

        let stdout = '';
        let stderr = '';

        // Collect data from script
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Wait for process to complete
        const result = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('Request timeout after 30 seconds'));
            }, 30000);

            pythonProcess.on('close', (code) => {
                clearTimeout(timeout);

                if (code === 0) {
                    try {
                        const output = JSON.parse(stdout);
                        resolve(output);
                    } catch (e) {
                        reject(new Error(`Failed to parse Python output: ${stdout}`));
                    }
                } else {
                    reject(new Error(`Python script error: ${stderr || 'Unknown error'}`));
                }
            });

            pythonProcess.on('error', (error) => {
                clearTimeout(timeout);
                reject(new Error(`Failed to start Python process: ${error.message}`));
            });
        });

        return NextResponse.json(result);

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
