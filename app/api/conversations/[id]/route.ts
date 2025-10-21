import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ConversationStorage } from '@/lib/conversation-storage';
import { headers } from 'next/headers';

// Force static generation for this API route
export const dynamic = 'force-static';

// GET /api/conversations/[id] - Get specific conversation
// PUT /api/conversations/[id] - Update conversation
// DELETE /api/conversations/[id] - Delete conversation
export async function GET(
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

    const conversation = await ConversationStorage.getConversations(session.user.id);
    const foundConversation = conversation.find(c => c.id === params.id);

    if (!foundConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: foundConversation.id,
      title: foundConversation.title,
      createdAt: foundConversation.createdAt,
      updatedAt: foundConversation.updatedAt,
      aiPersonality: foundConversation.aiPersonality,
      customPrompt: foundConversation.customPrompt,
      messages: foundConversation.messages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { title, aiPersonality, customPrompt } = body;

    const conversationData = {
      title,
      aiPersonality,
      customPrompt,
    };

    const updatedConversation = await ConversationStorage.updateConversation(
      params.id,
      conversationData,
      session.user.id
    );

    if (!updatedConversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updatedConversation.id,
      title: updatedConversation.title,
      createdAt: updatedConversation.createdAt,
      updatedAt: updatedConversation.updatedAt,
      aiPersonality: updatedConversation.aiPersonality,
      customPrompt: updatedConversation.customPrompt,
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const deleted = await ConversationStorage.deleteConversation(params.id, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
