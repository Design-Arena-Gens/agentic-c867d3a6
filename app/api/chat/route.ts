import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from 'ollama';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemRules, model } = await req.json();

    // Initialize Ollama client - it connects to local Ollama instance by default
    const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

    // Prepare messages with custom system rules
    const ollamaMessages = [
      {
        role: 'system',
        content: systemRules || 'You are a helpful assistant.',
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call Ollama with the specified model
    const response = await ollama.chat({
      model: model || 'llama3.2',
      messages: ollamaMessages,
      stream: false,
    });

    return NextResponse.json({
      message: response.message.content,
    });
  } catch (error: any) {
    console.error('Error calling Ollama:', error);
    return NextResponse.json(
      {
        error: 'Failed to get response from Ollama',
        details: error.message,
        suggestion: 'Make sure Ollama is running with: ollama serve',
      },
      { status: 500 }
    );
  }
}
