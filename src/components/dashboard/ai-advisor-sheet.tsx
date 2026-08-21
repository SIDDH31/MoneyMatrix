'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { BotMessageSquare } from 'lucide-react';
import { ChatInterface } from './chat-interface';

export function AIAdvisorSheet() {
  return (
    <Sheet>
      <SheetTrigger>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 rounded-full shadow-lg gap-2 pr-6 z-50 animate-in fade-in slide-in-from-bottom-5"
        >
          <BotMessageSquare className="w-6 h-6" />
          <span className="font-medium">Ask AI Advisor</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 border-l bg-background">
        <SheetHeader className="p-4 border-b sr-only">
          <SheetTitle>AI Financial Advisor</SheetTitle>
        </SheetHeader>
        {/* We use h-full to make the chat interface stretch exactly to the sheet bounds */}
        <div className="h-full pt-10">
          <div className="h-full pb-10">
            <ChatInterface />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
