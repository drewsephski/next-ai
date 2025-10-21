"use client";
import { Input } from "@/components/ui/input";
import { Bot, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import { TextShimmer } from "@/components/ui/text-shimmer";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat();
  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-99">
      <div
        className="rounded-full bg-black/10 cursor-pointer border p-3 hover:bg-black/20 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Bot className="w-6 h-6 transition-transform hover:scale-125 hover:rotate-12 duration-300 ease-in-out" />
      </div>

      {open && (
        <div className="absolute bottom-12 right-12 w-80 h-96 bg-white dark:bg-gray-900 border rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div>
              <h3 className="text-sm font-semibold">AI Assistant</h3>
              <p className="text-xs text-gray-500">Ask me anything</p>
            </div>
            <X
              className="w-4 h-4 hover:cursor-pointer hover:text-gray-600"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-xs mt-8">
                <p className="font-medium">Start a conversation</p>
                <p className="text-xs mt-1">Ask me anything about your project!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-2 py-1 text-xs rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <div className="prose prose-xs max-w-none">
                    <Markdown>
                      {message.parts?.map((part) =>
                        part.type === 'text' ? part.text : ''
                      ).join('') || ''}
                    </Markdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
                  <TextShimmer className="text-xs font-mono" duration={1.5}>
                    AI is thinking...
                  </TextShimmer>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="flex justify-center">
                <div className="max-w-[85%] px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg">
                  <p className="font-medium">Error:</p>
                  <p className="text-xs mt-0.5">{error.message}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                className="flex-1 text-xs h-8"
                value={input}
                placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
              />
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
