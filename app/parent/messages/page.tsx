'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Paperclip, Search, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  // Mock data - replace with actual API calls
  const conversations = [
    {
      id: '1',
      teacherName: 'Mrs. Smith',
      subject: 'English',
      lastMessage: 'Sarah did great on her essay!',
      lastMessageTime: '2 hours ago',
      unreadCount: 1,
      avatar: '👩‍🏫',
    },
    {
      id: '2',
      teacherName: 'Mr. Johnson',
      subject: 'Mathematics',
      lastMessage: 'We covered quadratic equations today',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      avatar: '👨‍🏫',
    },
    {
      id: '3',
      teacherName: 'Dr. Williams',
      subject: 'Science',
      lastMessage: 'The lab report was excellent',
      lastMessageTime: '3 days ago',
      unreadCount: 0,
      avatar: '👩‍🔬',
    },
    {
      id: '4',
      teacherName: 'Ms. Brown',
      subject: 'History',
      lastMessage: 'Please remind Sarah about the project',
      lastMessageTime: '1 week ago',
      unreadCount: 2,
      avatar: '👩‍🏫',
    },
    {
      id: '5',
      teacherName: 'Mr. Davis',
      subject: 'Geography',
      lastMessage: 'Great work on the map assignment',
      lastMessageTime: '2 weeks ago',
      unreadCount: 0,
      avatar: '👨‍🏫',
    },
  ];

  const messageHistory = [
    { id: 1, sender: 'teacher', name: 'Mrs. Smith', message: 'Hello! How is Sarah doing in the class?', time: '2024-06-07 10:30', avatar: '👩‍🏫' },
    { id: 2, sender: 'parent', name: 'You', message: 'She is doing well. She enjoys English class very much.', time: '2024-06-07 11:15', avatar: '👤' },
    { id: 3, sender: 'teacher', name: 'Mrs. Smith', message: 'That is wonderful to hear! Her essay on The Great Gatsby was excellent.', time: '2024-06-07 11:45', avatar: '👩‍🏫' },
    { id: 4, sender: 'teacher', name: 'Mrs. Smith', message: 'Sarah did great on her essay!', time: '2024-06-07 14:20', avatar: '👩‍🏫' },
  ];

  const selectedConversation = conversations.find(c => c.id === selectedChat);
  const filteredConversations = conversations.filter(c =>
    c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      // Handle message sending
      setMessageText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Messages" subtitle="Connect with your children's teachers" />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3 min-h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Conversations */}
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedChat === conversation.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{conversation.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {conversation.teacherName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white flex-shrink-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{conversation.subject}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {conversation.lastMessageTime}
                    </p>
                  </button>
                ))}
              </div>

              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No conversations found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Window */}
          {selectedChat ? (
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedConversation?.avatar}</span>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation?.teacherName}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedConversation?.subject}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 mb-4">
                {messageHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'teacher' && (
                      <span className="text-2xl flex-shrink-0">{msg.avatar}</span>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'parent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === 'parent'
                            ? 'text-blue-100'
                            : 'text-gray-600'
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button variant="outline" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="lg:col-span-2 flex flex-col items-center justify-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium mb-2">No conversation selected</p>
              <p className="text-sm text-gray-500">Choose a teacher to start messaging</p>
            </Card>
          )}
        </div>

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Messaging Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Keep messages professional and concise
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Teachers typically respond within 24 hours
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                For urgent matters, call the school directly
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                You can attach documents to support your message
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
