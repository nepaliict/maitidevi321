import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, RefreshCw, Search } from 'lucide-react';

export default function MessagesModule() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-muted-foreground">Chat with users in your hierarchy</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <ScrollArea className="h-[520px]">
              <div className="space-y-1">
                <p className="text-center text-sm text-muted-foreground py-8">
                  No conversations yet
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0 flex flex-col h-full">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-border">
                  <p className="font-semibold">Chat with user</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <p className="text-center text-muted-foreground">No messages</p>
                </ScrollArea>
                <div className="p-4 border-t border-border flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start messaging
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
