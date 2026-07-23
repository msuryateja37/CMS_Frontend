import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Send, Mic, Plus, Bot } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'bot' | 'user';
    text: string;
    timestamp: Date;
}

const RECENT_CONVERSATIONS = [
    'New workload',
    'Double check the process',
    'Stage-by-stage walkthrough',
    'Suggested steps to take',
    'Analyze the awaiting processes',
];

const ChiefDirectorAIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'bot',
            text: 'Good morning! How can I help you today?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [activeConversation, setActiveConversation] = useState<string | null>(null);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: "I'm analyzing your request. This is a demonstration of the AI Operations Assistant interface. In production, this would be connected to an AI service for real-time assistance with executive OHS oversight, escalations, and strategic decisions.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
        }, 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        setMessages([
            {
                id: '1',
                role: 'bot',
                text: 'Good morning! How can I help you today?',
                timestamp: new Date(),
            },
        ]);
        setActiveConversation(null);
    };

    return (
        <DashboardLayout
            title="AI Assistant"
            description="DDG / Executive Management"
            breadcrumbs={[{ label: 'Dashboard', path: '/chief-director/dashboard' }, { label: 'AI Assistant' }]}
        >
            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-160px)] min-h-[500px]">
                {/* Left Panel */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-start gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-light-gold flex items-center justify-center shrink-0">
                                <Bot size={20} className="text-brown" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">AI Operations Assistant</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                                    Trained on your workflow, tasks and delegations. Grounded on DLRRD system data
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1 flex flex-col">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Recent Conversations</h4>
                        <div className="flex-1 space-y-2">
                            {RECENT_CONVERSATIONS.map((conv, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                                        activeConversation === conv
                                            ? 'bg-light-gold text-brown'
                                            : 'bg-subtle-grey text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {conv}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNewChat}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold text-white font-bold text-sm rounded-xl hover:bg-brown transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            New Chat
                        </button>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-lg bg-light-gold flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot size={16} className="text-brown" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'bot' ? 'bg-subtle-grey text-gray-700' : 'bg-brown text-white'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 px-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                            />
                            <button
                                className="w-10 h-10 rounded-xl bg-light-gold flex items-center justify-center text-brown hover:bg-gold/30 transition-colors shrink-0"
                                title="Voice input"
                            >
                                <Mic size={18} />
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-white hover:bg-brown transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Send message"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChiefDirectorAIAssistant;
