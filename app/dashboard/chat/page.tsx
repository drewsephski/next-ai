"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Copy, Edit, MoreVertical, RefreshCw, Trash2, MessageCircle, Menu, PanelLeftOpen, PanelLeftClose, Settings } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Components } from "react-markdown";
import { codeToHtml } from "shiki";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { TextShimmer } from "@/components/ui/text-shimmer";

// Custom CodeBlock component with Shiki highlighting
function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const language = className?.replace("language-", "") || "text";

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const html = await codeToHtml(children, {
          lang: language,
          theme: "github-dark",
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error("Error highlighting code:", error);
        setHighlightedCode(`<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-700"><code class="text-sm font-mono">${children}</code></pre>`);
      }
    };

    highlightCode();
  }, [children, language]);

  return (
    <div
      className="my-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-700"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}

// Custom components for markdown rendering
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface PreProps {
  children?: React.ReactNode;
}

const markdownComponents: Components = {
  code(props: CodeProps) {
    const { inline, className, children } = props;
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <CodeBlock className={className}>
        {String(children).replace(/\n$/, "")}
      </CodeBlock>
    ) : (
      <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  },
  pre(props: PreProps) {
    const { children } = props;
    return <>{children}</>;
  },
};
import { Conversation, ConversationAPIClient } from '@/lib/conversation-api-client'
import { ConversationHistory } from '@/components/conversation-history';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { ModelSelector } from "@/components/model-selector";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth'

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-20b:free");
  const { messages, sendMessage, status, error } = useChat();
  const { user } = useAuth()
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [input, setInput] = useState("");
  const [aiPersonality, setAiPersonality] = useState<"formal" | "casual" | "expert">("casual");
  const [customPrompt, setCustomPrompt] = useState("");
  const [externalData, setExternalData] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'streaming' || status === 'submitted';

  // Load existing conversation or create new one
  useEffect(() => {
    const loadConversation = async () => {
      if (!user?.id) return;

      if (currentConversationId) {
        // Load existing conversation
        try {
          const conversation = await ConversationAPIClient.getConversation(currentConversationId);
          if (conversation) {
            setAiPersonality(conversation.aiPersonality as "formal" | "casual" | "expert" || "casual");
            setCustomPrompt(conversation.customPrompt || "");
            // TODO: Load messages into chat state - this would require loading from localStorage for now
            // or implementing a way to restore messages from the conversation
            const storedMessages = localStorage.getItem('temp_messages');
            if (storedMessages) {
              // Update the chat state with the loaded messages
              // For now, we'll just update the local state
              // In a real app, you'd want to persist this change
            }
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
        }
      }
    };

    loadConversation();
  }, [currentConversationId, user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoadingExternalDataRef = useRef(false);

  // Detect and fetch external data based on user messages
  useEffect(() => {
    const fetchExternalData = async () => {
      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== 'user') return;

      const userMessage = lastMessage.parts?.find(part => part.type === 'text')?.text || '';
      if (!userMessage) return;

      // Check for external data keywords
      const shouldFetchData = /\b(weather|temperature|news|crypto|bitcoin|ethereum|exchange|rate|stock|price)\b/i.test(userMessage);

      if (shouldFetchData && !isLoadingExternalDataRef.current) {
        isLoadingExternalDataRef.current = true;

        try {
          const { ExternalAPIClient } = await import('@/lib/external-api-client');
          const results = await ExternalAPIClient.searchData(userMessage);

          if (Object.keys(results).length > 0) {
            const formattedData = ExternalAPIClient.formatSearchResults(results);
            setExternalData(formattedData);
          }
        } catch (error) {
          console.error('Error fetching external data:', error);
        } finally {
          isLoadingExternalDataRef.current = false;
        }
      }
    };

    fetchExternalData();
  }, [messages]);

  // Save messages to database as they arrive
  useEffect(() => {
    const saveMessages = async () => {
      if (messages.length > 0 && user?.id && currentConversationId) {
        try {
          // Save each new message
          for (const message of messages) {
            const messageData = {
              role: message.role,
              content: message.parts?.map(part => part.type === 'text' ? part.text : '').join('') || '',
            };

            await ConversationAPIClient.saveMessage(currentConversationId, messageData);
          }
        } catch (error) {
          console.error('Error saving messages:', error);
        }
      }
    };

    saveMessages();
  }, [messages, currentConversationId, user?.id]);

  const handleEdit = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
    toast.info("Entering edit mode...");
  };

  const handleEditSubmit = () => {
    if (editingMessageId && editingText.trim()) {
      // For now, we'll just update the local state
      // In a real app, you'd want to persist this change
      setEditingMessageId(null);
      setEditingText("");
      toast.success("Message edited successfully!");
    } else {
      toast.error("Edit failed - message cannot be empty");
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingText("");
    toast.info("Edit cancelled");
  };

  const handleDelete = (messageId: string) => {
    // For now, we'll just remove from local state
    // In a real app, you'd want to persist this change
    console.log('Deleting message:', messageId)
    // Note: This is a simplified approach - you'd need proper state management
    toast.success("Message deleted");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy message");
    }
  };

  const handleRegenerate = (messageId: string) => {
    // Find the user message that led to this AI response
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0 && messages[messageIndex - 1].role === 'user') {
      const userMessage = messages[messageIndex - 1]
      // Remove the current AI response and regenerate
      sendMessage({ text: userMessage.parts?.find(part => part.type === 'text')?.text || '' })
      toast.info("Regenerating response...");
    } else {
      toast.error("Could not regenerate response");
    }
  };

  const handleNewConversation = async () => {
    setCurrentConversationId(null)
    // Reset the chat by using the useChat hook's reload mechanism
    window.location.reload() // Simple reset for now
    setInput("")
    setShowHistory(false)
    setAiPersonality("casual");
    setCustomPrompt("");
    toast.info("Started new conversation");
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id)
    setAiPersonality(conversation.aiPersonality as "formal" | "casual" | "expert" || "casual");
    setCustomPrompt(conversation.customPrompt || "");
    // For now, we'll use localStorage to temporarily store and restore messages
    localStorage.setItem('temp_messages', JSON.stringify(conversation.messages))
    window.location.reload() // Reload to restore messages
    setShowHistory(false)
    toast.info(`Switched to conversation: ${conversation.title || 'Untitled'}`);
  }

  const handleSaveConversation = async () => {
    if (!user?.id || messages.length === 0) return;

    try {
      const title = ConversationAPIClient.generateTitle(messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.parts?.map(part => part.type === 'text' ? part.text : '').join('') || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        conversationId: '',
        metadata: undefined,
      })));

      if (currentConversationId) {
        await ConversationAPIClient.updateConversation(currentConversationId, {
          title,
          aiPersonality,
          customPrompt,
        });
      } else {
        const savedConversation = await ConversationAPIClient.createConversation({
          title,
          aiPersonality,
          customPrompt,
        });
        setCurrentConversationId(savedConversation.id);
      }

      toast.success("Conversation saved!");
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error("Failed to save conversation");
    }
  };

  const conversationStarters = [
    "Design a database schema for an e-commerce site",
    "Implement real-time chat with WebSockets",
    "Create a REST API for a blog application",
    "Create a custom hook for API calls",
    "Explain AI model fine-tuning techniques",
    "Build a recommendation system using ML",
    "Create responsive CSS Grid layouts",
    "Explain state management in React apps"
  ];

  const handleStarterClick = (starter: string) => {
    setInput(starter);
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Main Chat Area - First */}
        <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 75}>
          <div className="flex flex-col h-full">
            {/* Header with collapse button */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="md:hidden"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div className="hidden md:flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">
                      {currentConversationId ? 'Current Conversation' : 'New Conversation'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewConversation}
                    className="hidden md:flex"
                  >
                    New Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveConversation}
                    className="hidden md:flex"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelSelect={setSelectedModel}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden md:flex"
                  >
                    {sidebarCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </Button>

                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col gap-6 p-4 md:p-6">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto py-8 md:py-32">
                  <div className="w-full max-w-xl mx-auto px-2 md:px-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-gray-500 mt-12">
                        <p className="text-lg font-medium">Start a conversation</p>
                        <p className="text-sm mt-2">Ask me anything!</p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex transition-all duration-300 ease-in-out",
                          message.role === "user" ? "justify-end" : "justify-start",
                        )}
                      >
                        <div className="relative group">
                          <div
                            className={cn(
                              "max-w-[min(85%,90ch)] px-3 py-3 text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-2xl",
                              message.role === "user"
                                ? "bg-[#0B93F6] text-white rounded-br-md ml-auto"
                                : "bg-muted text-foreground rounded-bl-md",
                            )}
                            style={{
                              maxWidth: "clamp(320px, min(85%, 700px), 90ch)",
                            }}
                          >
                            {editingMessageId === message.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full p-2 text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleEditSubmit}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleEditCancel}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                  <Markdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                  >
                                    {message.parts?.map((part) =>
                                      part.type === 'text' ? part.text : ''
                                    ).join('') || ''}
                                  </Markdown>
                                </div>
                                {/* Message Actions Dropdown */}
                                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                          "h-8 w-8 p-0 rounded-full shadow-sm border transition-all duration-200 hover:scale-105",
                                          message.role === "user"
                                            ? "text-white/80 hover:bg-white/20 hover:text-white border-white/30"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-gray-300"
                                        )}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 p-2 shadow-lg border rounded-lg">
                                      <DropdownMenuItem
                                        onClick={() => handleCopy(message.parts?.find(part => part.type === 'text')?.text || '')}
                                        className="flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer"
                                      >
                                        <Copy className="mr-2 h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Copy message</span>
                                      </DropdownMenuItem>
                                      {message.role === "assistant" && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => handleRegenerate(message.id)}
                                            className="flex items-center gap-2 p-2 hover:bg-green-50 cursor-pointer"
                                          >
                                            <RefreshCw className="mr-2 h-4 w-4 text-green-600" />
                                            <span className="text-sm">Regenerate</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="my-1" />
                                        </>
                                      )}
                                      <DropdownMenuItem
                                        onClick={() => handleEdit(message.id, message.parts?.find(part => part.type === 'text')?.text || '')}
                                        className="flex items-center gap-2 p-2 hover:bg-orange-50 cursor-pointer"
                                      >
                                        <Edit className="mr-2 h-4 w-4 text-orange-600" />
                                        <span className="text-sm">Edit message</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="my-1" />
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(message.id)}
                                        className="flex items-center gap-2 p-2 hover:bg-red-50 cursor-pointer text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span className="text-sm">Delete message</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Loading indicator - only show when actually streaming */}
                    {isLoading && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div
                          className="max-w-[min(85%,90ch)] px-3 py-3 text-sm shadow-sm bg-muted text-foreground rounded-2xl rounded-bl-md"
                          style={{
                            maxWidth: "clamp(320px, min(85%, 700px), 90ch)",
                          }}
                        >
                          <TextShimmer className="font-mono text-sm" duration={1.5}>
                            AI is generating a response...
                          </TextShimmer>
                        </div>
                      </div>
                    )}

                    {/* Error display */}
                    {error && (
                      <div className="flex justify-center">
                        <div className="max-w-[75%] px-4 py-2 text-sm shadow-sm bg-destructive/10 text-destructive rounded-lg">
                          <p className="font-medium">Error:</p>
                          <p className="text-xs mt-1">{String(error)}</p>
                        </div>
                      </div>
                    )}

                    {/* External Data Display */}
                    {externalData && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div
                          className="max-w-[min(85%,90ch)] px-3 py-3 text-sm shadow-sm bg-blue-50 text-blue-900 rounded-2xl rounded-bl-md border border-blue-200"
                          style={{
                            maxWidth: "clamp(320px, min(85%, 700px), 90ch)",
                          }}
                        >
                          <div className="prose prose-sm max-w-none">
                            <Markdown remarkPlugins={[remarkGfm]}>
                              {externalData}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                <div className="max-w-xl mx-auto px-2 md:px-4 w-full">
                  {/* AI Personality and Custom Prompt Settings */}
                  <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-sm font-medium">AI Style:</span>
                      {["formal", "casual", "expert"].map((style) => (
                        <Button
                          key={style}
                          variant={aiPersonality === style ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAiPersonality(style as "formal" | "casual" | "expert")}
                          className="capitalize"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Custom Instructions (optional):</label>
                      <Input
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., Always be helpful and concise..."
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Conversation Starters */}
                  {messages.length === 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {conversationStarters.map((starter, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-left h-auto py-2 px-3 text-xs justify-start whitespace-normal hover:bg-muted/50 hover:text-foreground transition-colors"
                            onClick={() => handleStarterClick(starter)}
                          >
                            {starter}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 p-3 border rounded-xl bg-background shadow-lg">
                    <Input
                      className="w-full border-0 shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={input}
                      placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      disabled={isLoading}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {input.length > 0 && `${input.length} characters`}
                      </span>
                      <Button
                        size="sm"
                        className="text-xs px-4"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                      >
                        {isLoading ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                  {/* Mobile-optimized Send Button */}
                  <div className="flex justify-center md:hidden mt-4">
                    <Button
                      size="lg"
                      className="w-full max-w-xs"
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                    >
                      {isLoading ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        {/* Conditionally render sidebar panel - put it AFTER main panel */}
        {!sidebarCollapsed && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={25}
              minSize={20}
              maxSize={40}
              className="hidden md:block"
            >
              <div className="h-full border-l">
                <ConversationHistory
                  currentConversationId={currentConversationId || undefined}
                  onConversationSelect={handleConversationSelect}
                  onNewConversation={handleNewConversation}
                  isOpen={true}
                  onClose={() => { }}
                  variant="sidebar"
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Floating button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarCollapsed(false)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex shadow-lg"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Mobile Conversation History Overlay */}
      {showHistory && (
        <ConversationHistory
          currentConversationId={currentConversationId || undefined}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          variant="overlay"
        />
      )}
    </div>
  )
    ;
}