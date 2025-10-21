import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ConversationStorage } from '@/lib/conversation-storage';
import { headers } from 'next/headers';

// Force static generation for this API route
export const dynamic = 'force-static';

// GET /api/conversations - List user's conversations
// POST /api/conversations - Create new conversation
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await ConversationStorage.getConversations(session.user.id);

    return NextResponse.json({
      conversations: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        aiPersonality: conv.aiPersonality,
        customPrompt: conv.customPrompt,
      }))
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, aiPersonality, customPrompt } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const conversationData = {
      title,
      messages: [], // Empty messages array for new conversation
      userId: session.user.id,
      aiPersonality,
      customPrompt,
    };

    const conversation = await ConversationStorage.saveConversation(conversationData, session.user.id);

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      aiPersonality: conversation.aiPersonality,
      customPrompt: conversation.customPrompt,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
