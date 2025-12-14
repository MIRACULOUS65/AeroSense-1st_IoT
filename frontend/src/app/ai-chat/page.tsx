'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: input }),
            });

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: `❌ Error: ${data.error || 'Failed to get response'}`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `❌ Network error: ${error.message}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="min-h-screen bg-white text-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white">
                <nav className="container mx-auto flex items-center justify-between px-6 py-4">
                    <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-70 transition-opacity">
                        AeroSense
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link href="/#about" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            About
                        </Link>
                        <Link href="/features" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            Features
                        </Link>
                        <Link href="/#contact" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            Contact
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-16 border-b border-black">
                    <div className="max-w-4xl">
                        <h1 className="font-playfair text-5xl md:text-6xl font-bold leading-tight mb-4">
                            AI-Powered Environmental Chat
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed font-light mb-6">
                            Ask about weather, air quality, forecasts, and environmental insights powered by GPT-2
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={clearChat}
                                disabled={messages.length === 0}
                                className="px-6 py-2 border border-black hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Clear Chat
                            </button>
                            <div className="text-sm font-light flex items-center">
                                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Chat Interface */}
                <section className="container mx-auto px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Chat Container */}
                        <div className="border border-black">
                            {/* Messages Area */}
                            <div
                                className="h-[60vh] overflow-y-auto p-6 bg-white"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-center">
                                        <div>
                                            <div className="text-6xl mb-4">💬</div>
                                            <h3 className="font-playfair text-2xl font-bold mb-2">Start a Conversation</h3>
                                            <p className="text-sm font-light max-w-md">
                                                Ask about weather forecasts, air quality, environmental trends, or any climate-related questions.
                                            </p>
                                            <div className="mt-6 text-xs font-light space-y-1">
                                                <p className="opacity-70">Try asking:</p>
                                                <p>• "What's the weather in Kolkata?"</p>
                                                <p>• "5-day forecast for Delhi"</p>
                                                <p>• "Why is pollution high today?"</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {messages.map((message, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] ${message.role === 'user'
                                                        ? 'bg-black text-white'
                                                        : 'border border-black bg-white'
                                                        } p-4`}
                                                >
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <span className="text-lg">
                                                            {message.role === 'user' ? '🔍' : '🤖'}
                                                        </span>
                                                        <span className="font-medium text-sm">
                                                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-light leading-relaxed" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                                        {message.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {loading && (
                                            <div className="flex justify-start">
                                                <div className="max-w-[80%] border border-black bg-white p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">🤖</span>
                                                        <span className="font-medium text-sm">AI Assistant</span>
                                                    </div>
                                                    <div className="text-sm font-light mt-2 flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                        </div>
                                                        <span className="opacity-70">Generating response...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-black p-4 bg-white">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about weather, air quality, forecasts..."
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!input.trim() || loading}
                                        className="px-8 py-3 bg-black text-white font-medium hover:opacity-90 transition-opacity border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                                <div className="mt-2 text-xs font-light opacity-70">
                                    Press Enter to send • Shift+Enter for new line
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="mt-8 border border-black p-6">
                            <h3 className="font-playfair text-xl font-bold mb-4">About This AI</h3>
                            <div className="space-y-2 text-sm font-light">
                                <p>• <strong>Model:</strong> Fine-tuned GPT-2 (124M parameters)</p>
                                <p>• <strong>Training:</strong> 18,360 environmental Q&A samples</p>
                                <p>• <strong>Features:</strong> Live weather data, AQI monitoring, internet search</p>
                                <p>• <strong>Cities:</strong> Kolkata, Delhi, Mumbai, Bangalore, Chennai, Hyderabad, and more</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-black bg-white py-12 mt-12">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm font-light">
                        © 2025 Environmental Analysis Project. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
