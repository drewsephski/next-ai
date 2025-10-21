import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ConversationStorage } from '@/lib/conversation-storage';
import { headers } from 'next/headers';

// Force static generation for this API route
export const dynamic = 'force-static';

// Generate static params for known conversation IDs
export async function generateStaticParams() {
  try {
    // For static export, we need to provide some fallback parameters
    return [
      { id: 'new' }, // Fallback parameter for new conversations
    ];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [{ id: 'new' }];
  }
}

// POST /api/conversations/[id]/messages - Add message to conversation
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle the 'new' fallback case - this shouldn't happen for POST requests
    if (params.id === 'new') {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role, content } = body;

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      );
    }

    const message = await ConversationStorage.saveMessage(params.id, {
      role,
      content,
    });

    return NextResponse.json({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      conversationId: message.conversationId,
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
