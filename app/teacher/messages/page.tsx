'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Search, Clock, Check, CheckCheck, MessageCircle } from 'lucide-react';

const messagesData = [
  {
    id: 1,
    sender: 'Rajesh Sharma',
    recipient: 'Parent of Aarav Sharma',
    class: 'Class 10-A',
    message: 'Hi, Aarav has been performing well in mathematics. He scored 85 in the recent midterm exam.',
    timestamp: '2024-12-10 10:30 AM',
    status: 'read',
    direction: 'sent',
  },
  {
    id: 2,
    sender: 'Priya Gupta',
    recipient: 'Parent of Diya Patel',
    class: 'Class 10-A',
    message: 'Thank you for the update on Diya. We appreciate your guidance. She will submit the science project by the deadline.',
    timestamp: '2024-12-10 11:15 AM',
    status: 'read',
    direction: 'received',
  },
  {
    id: 3,
    sender: 'Vikram Singh',
    recipient: 'Parent of Esha Gupta',
    class: 'Class 10-A',
    message: 'Could you please help arrange extra classes for Esha? She wants to improve her English.',
    timestamp: '2024-12-09 3:45 PM',
    status: 'unread',
    direction: 'received',
  },
  {
    id: 4,
    sender: 'Anjali Kumar',
    recipient: 'Parent of Gina Desai',
    class: 'Class 10-B',
    message: 'Great work! Gina received excellent marks in the chemistry assignment. Keep up the good work.',
    timestamp: '2024-12-09 2:20 PM',
    status: 'read',
    direction: 'sent',
  },
  {
    id: 5,
    sender: 'Ramesh Verma',
    recipient: 'Parent of Harsh Verma',
    class: 'Class 10-A',
    message: 'I am concerned about Harsh\'s performance. Can we discuss his study plan?',
    timestamp: '2024-12-08 5:30 PM',
    status: 'unread',
    direction: 'received',
  },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(messagesData);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(messages[0]?.id);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'sent'>('all');

  const handleSendReply = () => {
    if (replyText.trim() && selectedMessage) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        recipient: messages.find((m) => m.id === selectedMessage)?.sender || '',
        class: messages.find((m) => m.id === selectedMessage)?.class || '',
        message: replyText,
        timestamp: new Date().toLocaleString(),
        status: 'sent' as const,
        direction: 'sent' as const,
      };
      setMessages([newMessage, ...messages]);
      setReplyText('');
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || message.status === filterType || (filterType === 'sent' && message.direction === 'sent');
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const sentCount = messages.filter((m) => m.direction === 'sent').length;

  const selectedMsg = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Messages" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">Unread</p>
              <p className="text-3xl font-bold text-red-900">{unreadCount}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700">Sent</p>
              <p className="text-3xl font-bold text-blue-900">{sentCount}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">Received</p>
              <p className="text-3xl font-bold text-green-900">{messages.filter((m) => m.direction === 'received').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Messages View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Messages</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Search */}
                <div className="px-6 pb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFilterType('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterType === 'unread' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFilterType('unread')}
                    >
                      Unread
                    </Button>
                    <Button
                      variant={filterType === 'sent' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFilterType('sent')}
                    >
                      Sent
                    </Button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="border-t max-h-96 overflow-y-auto">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message.id)}
                      className={`p-4 border-b cursor-pointer transition ${
                        selectedMessage === message.id
                          ? 'bg-blue-50 border-blue-200'
                          : message.status === 'unread'
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{message.sender}</h4>
                        {message.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{message.class}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {message.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMsg ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedMsg.sender}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{selectedMsg.class}</p>
                    </div>
                    <Badge variant={selectedMsg.direction === 'sent' ? 'default' : 'secondary'}>
                      {selectedMsg.direction === 'sent' ? 'Sent' : 'Received'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto pb-4">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-900 leading-relaxed">{selectedMsg.message}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{selectedMsg.timestamp}</span>
                      <div className="flex items-center gap-1">
                        {selectedMsg.direction === 'sent' && selectedMsg.status === 'read' && (
                          <>
                            <CheckCheck className="w-4 h-4" />
                            Read
                          </>
                        )}
                        {selectedMsg.direction === 'sent' && selectedMsg.status === 'sent' && (
                          <>
                            <Check className="w-4 h-4" />
                            Sent
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <div className="border-t p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                  <div className="flex gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleSendReply} className="mt-2 w-full gap-2">
                    <Send className="w-4 h-4" />
                    Send Reply
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-full">
                <CardContent className="text-center text-gray-600">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>Select a message to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
