import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  aiPersonality?: string;
  customPrompt?: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
  metadata?: string;
}

class ConversationStorage {
  static async saveConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Conversation> {
    try {
      const id = uuidv4();
      const [newConversation] = await db.insert(conversation).values({
        id,
        title: conversationData.title,
        userId,
        aiPersonality: conversationData.aiPersonality || 'casual',
        customPrompt: conversationData.customPrompt,
      }).returning();

      return {
        ...conversationData,
        id: newConversation.id,
        createdAt: newConversation.createdAt,
        updatedAt: newConversation.updatedAt,
        messages: [],
      };
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  static async getConversations(userId?: string): Promise<Conversation[]> {
    if (!userId) return [];

    try {
      const conversations = await db
        .select()
        .from(conversation)
        .where(eq(conversation.userId, userId))
        .orderBy(desc(conversation.updatedAt));

      // Get messages for each conversation
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conv) => {
          const messages = await this.getMessages(conv.id);
          return {
            ...conv,
            messages,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            aiPersonality: conv.aiPersonality || undefined,
            customPrompt: conv.customPrompt || undefined,
          };
        })
      );

      return conversationsWithMessages;
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  static async updateConversation(id: string, updates: Partial<Conversation>, userId: string): Promise<Conversation | null> {
    try {
      const [updatedConversation] = await db
        .update(conversation)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(conversation.id, id), eq(conversation.userId, userId)))
        .returning();

      if (!updatedConversation) return null;

      const messages = await this.getMessages(id);
      return {
        ...updatedConversation,
        messages,
        createdAt: updatedConversation.createdAt,
        updatedAt: updatedConversation.updatedAt,
        aiPersonality: updatedConversation.aiPersonality || undefined,
        customPrompt: updatedConversation.customPrompt || undefined,
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      return null;
    }
  }

  static async deleteConversation(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(conversation)
        .where(and(eq(conversation.id, id), eq(conversation.userId, userId)));

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const dbMessages = await db
        .select()
        .from(message)
        .where(eq(message.conversationId, conversationId))
        .orderBy(message.createdAt);

      return dbMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        conversationId: msg.conversationId,
        metadata: msg.metadata || undefined,
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  static async saveMessage(conversationId: string, messageData: { role: string; content: string }): Promise<Message> {
    try {
      const id = uuidv4();
      const [newMessage] = await db.insert(message).values({
        id,
        conversationId,
        role: messageData.role,
        content: messageData.content,
      }).returning();

      return {
        id: newMessage.id,
        role: newMessage.role,
        content: newMessage.content,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
        conversationId: newMessage.conversationId,
        metadata: newMessage.metadata || undefined,
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  static generateTitle(messages: Message[]): string {
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'New Conversation';

    return firstUserMessage.content.length > 50
      ? firstUserMessage.content.substring(0, 50) + '...'
      : firstUserMessage.content || 'New Conversation';
  }

  static async clearUserConversations(userId: string) {
    try {
      await db.delete(conversation).where(eq(conversation.userId, userId));
    } catch (error) {
      console.error('Error clearing conversations:', error);
    }
  }
}

export { ConversationStorage, type Conversation, type Message };
