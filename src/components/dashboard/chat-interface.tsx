'use client';

import { useChat } from 'ai/react';
import { Bot, User, Send, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "How can I improve my financial health score?",
  "Am I saving enough for emergencies?",
  "Are my investments well-diversified?",
  "When will I reach my emergency fund goal?",
];

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: '/api/chat',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const clearChat = () => setMessages([]);

  const handleSuggestedClick = (q: string) => {
    // Manually trigger submit with suggested question
    handleInputChange({ target: { value: q } } as any);
    // Use timeout to allow state to update before submitting
    setTimeout(() => {
      const form = document.getElementById('chat-form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 10);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-card border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Financial Advisor</h3>
            <p className="text-xs text-muted-foreground">Powered by MoneyMatrix Engine</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} title="Clear conversation">
          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="bg-primary/5 p-4 rounded-full">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">How can I help you today?</h4>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                I can analyze your financial data, review your goals, and provide personalized insights.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-[300px]">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSuggestedClick(q)}
                  className="text-xs bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground px-3 py-1.5 rounded-full transition-colors border text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  m.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none prose prose-sm dark:prose-invert"
                )}>
                  {m.role === 'user' ? (
                    m.content
                  ) : (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-muted text-foreground flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4" />
                <p>Failed to get response. Please try again.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <form id="chat-form" onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your finances..."
            className="flex-1 rounded-full px-4"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full shrink-0"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          AI advice is informational and not licensed financial advice.
        </p>
      </div>
    </div>
  );
}
