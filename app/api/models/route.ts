import { NextResponse } from 'next/server';
import { Ollama } from 'ollama';

export async function GET() {
  try {
    // Initialize Ollama client
    const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

    // Get list of available models
    const response = await ollama.list();

    const models = response.models.map((model: any) => model.name);

    return NextResponse.json({
      models,
    });
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch models from Ollama',
        details: error.message,
        models: [],
      },
      { status: 500 }
    );
  }
}
