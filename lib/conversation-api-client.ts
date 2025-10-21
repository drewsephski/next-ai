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

interface ConversationResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  aiPersonality?: string;
  customPrompt?: string;
  messages?: Message[];
}

class ConversationAPIClient {
  private static baseUrl = '/api/conversations';

  static async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(this.baseUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();

      return data.conversations.map((conv: ConversationResponse) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages || [],
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async getConversation(id: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }

      const data = await response.json();

      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        messages: data.messages || [],
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  static async createConversation(data: {
    title: string;
    aiPersonality?: string;
    customPrompt?: string;
  }): Promise<Conversation> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const result = await response.json();

      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        messages: [],
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async updateConversation(
    id: string,
    data: {
      title?: string;
      aiPersonality?: string;
      customPrompt?: string;
    }
  ): Promise<Conversation> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update conversation: ${response.status}`);
      }

      const result = await response.json();

      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        messages: [],
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  static async deleteConversation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  static async saveMessage(
    conversationId: string,
    messageData: { role: string; content: string }
  ): Promise<Message> {
    try {
      const response = await fetch(`${this.baseUrl}/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.status}`);
      }

      const result = await response.json();

      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
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
}

export { ConversationAPIClient, type Conversation, type Message };
