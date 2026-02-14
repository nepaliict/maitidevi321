import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, RefreshCw, Search, MessageSquare, Paperclip, Image } from 'lucide-react';

export default function MessagesModule() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Messages</h2>
            <p className="text-muted-foreground text-sm">Chat with users in your hierarchy</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Chat hierarchy info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3 text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4 inline mr-2 text-primary" />
          You can only chat with users directly in your hierarchy (parent ↔ children).
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[550px]">
        {/* Chat List */}
        <Card className="lg:col-span-1 border-border/50">
          <CardContent className="p-3 h-full flex flex-col">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Click "Refresh" to load chats</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-0 flex flex-col h-full">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      <span className="text-xs font-bold">U</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">User</p>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <p className="text-center text-muted-foreground text-sm">No messages yet</p>
                </ScrollArea>
                <div className="p-3 border-t border-border flex gap-2">
                  <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="shrink-0"><Image className="w-4 h-4" /></Button>
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && message.trim() && setMessage('')}
                  />
                  <Button size="icon" className="shrink-0"><Send className="w-4 h-4" /></Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
