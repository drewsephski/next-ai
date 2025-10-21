import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToModelMessages } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const modelParam = url.searchParams.get('model');
    const { messages } = await req.json();

    // Get model from query parameter, default to current model if not provided
    const selectedModel = modelParam || 'z-ai/glm-4.5-air:free';

    const result = streamText({
      model: openrouter.chat(selectedModel),
      messages: convertToModelMessages(messages),
      // Optional: Add system message for better responses
      system: 'You are a helpful, friendly assistant. Provide clear and concise responses.',
      // Optional: Control response behavior
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}