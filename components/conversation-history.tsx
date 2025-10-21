"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Trash2, Plus } from 'lucide-react';
import { Conversation, ConversationAPIClient } from '@/lib/conversation-api-client';
import { cn } from '@/lib/utils';

import { useAuth } from '@/hooks/use-auth'; // Import auth hook

interface ConversationHistoryProps {
  currentConversationId?: string;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'overlay' | 'sidebar'; // Add variant prop
}

export function ConversationHistory({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isOpen,
  onClose,
  variant = 'overlay'
}: ConversationHistoryProps) {
  const { user } = useAuth(); // Get current user
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
      if (user?.id) {
        const conversations = await ConversationAPIClient.getConversations();
        setConversations(conversations);
      }
    };

    loadConversations();
  }, [user?.id]);

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const deleted = await ConversationAPIClient.deleteConversation(id);
    if (deleted) {
      setConversations(prev => prev.filter(conv => conv.id !== id));
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen && variant === 'overlay') return null;

  const isOverlay = variant === 'overlay';

  return (
    <div className={isOverlay ? "fixed inset-0 bg-black/50 z-50 md:relative md:inset-auto md:bg-transparent md:z-auto" : ""}>
      <div className={isOverlay ? "absolute left-0 top-0 h-full w-80 bg-background border-r md:relative md:h-auto md:w-full" : "h-full w-full bg-background border-r"}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your Conversations</h2>
              {user?.email && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
            {isOverlay && (
              <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
                ×
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className={isOverlay ? "h-[calc(100vh-80px)] md:h-96" : "flex-1"}>
          <div className="p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={onNewConversation}
            >
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>

            {!user ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Please sign in</p>
                <p className="text-sm">Sign in to view your conversations</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new conversation to get started</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative p-3 rounded-lg border cursor-pointer transition-colors",
                    currentConversationId === conversation.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {conversation.messages.length} messages
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conversation.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
