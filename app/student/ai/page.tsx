'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Send,
  MessageSquare,
  Sparkles,
  Book,
  HelpCircle,
  Plus,
  Clock,
  Loader,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const AIAssistantPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Quadratic Equations Help',
      messages: [],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Shakespeare Analysis',
      messages: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [selectedConversationId, setSelectedConversationId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I\'m your AI learning assistant. I can help you with homework, explain concepts, solve problems, and answer questions about any subject you\'re studying. What would you like help with today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateMockResponse = (userInput: string): string => {
    const responses: { [key: string]: string } = {
      math: 'To solve quadratic equations, we use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a. Would you like me to explain this step by step or help with a specific problem?',
      shakespeare:
        'Shakespeare\'s works are divided into three main categories: comedies, tragedies, and histories. Each category has distinct characteristics. Which play would you like to discuss?',
      physics:
        'Newton\'s laws of motion are fundamental to physics. The first law states that an object at rest stays at rest unless acted upon by an external force. Would you like examples?',
      chemistry: 'The periodic table is organized by atomic number and electron configuration. It helps us understand element properties and reactivity. What aspect interests you?',
      history:
        'The Renaissance was a cultural movement spanning the 14th to 17th centuries. It marked the transition from medieval to modern times. Would you like to know more about a specific period?',
      coding: 'Python is a versatile language great for beginners. It has simple syntax and powerful libraries. What programming concept can I help you understand?',
    };

    const lowerInput = userInput.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }

    return `That's an interesting question! Based on your query: "${userInput}". Could you provide more details about what you're studying? I can help with mathematics, literature, science, history, programming, and more.`;
  };

  const quickQuestions = [
    { icon: '📐', label: 'Math Help', query: 'Help me with mathematics' },
    { icon: '📚', label: 'Literature', query: 'Explain Shakespeare' },
    { icon: '🔬', label: 'Science', query: 'Physics concepts' },
    { icon: '💻', label: 'Coding', query: 'Python programming help' },
    { icon: '🌍', label: 'History', query: 'Historical events' },
    { icon: '✏️', label: 'Assignment', query: 'Help with my assignment' },
  ];

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="AI Assistant" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Conversations */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversations
                  </CardTitle>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversationId === conv.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-sm font-medium line-clamp-1">{conv.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(conv.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-xs gap-2">
                  <Book className="w-4 h-4" />
                  Study Notes
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Q&A Forum
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs gap-2">
                  <Sparkles className="w-4 h-4" />
                  Practice Quiz
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col h-screen lg:h-[600px]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      {selectedConversation?.title || 'New Chat'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-powered learning assistant available 24/7
                    </p>
                  </div>
                  <Badge>Active</Badge>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-600 mb-4">Start a conversation with the AI Assistant</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-600'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="px-4 py-3 border-t bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Quick questions:</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(q.query);
                          setTimeout(() => {
                            const input = q.query;
                            const userMessage: Message = {
                              id: Date.now().toString(),
                              role: 'user',
                              content: input,
                              timestamp: new Date(),
                            };
                            setMessages((prev) => [...prev, userMessage]);
                            setIsLoading(true);
                            setTimeout(() => {
                              const assistantMessage: Message = {
                                id: (Date.now() + 1).toString(),
                                role: 'assistant',
                                content: generateMockResponse(input),
                                timestamp: new Date(),
                              };
                              setMessages((prev) => [...prev, assistantMessage]);
                              setIsLoading(false);
                            }, 1000);
                          }, 0);
                        }}
                        className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded text-xs hover:bg-blue-50 transition-colors"
                      >
                        <span>{q.icon}</span>
                        <span>{q.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send. AI can help with homework, explain concepts, and answer questions.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export default AIAssistantPage;
