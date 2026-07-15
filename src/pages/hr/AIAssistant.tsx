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
    'WCL1 processing guide',
    'Claim submission SLAs',
    'Compensation calculation rules',
    'Filing deadlines',
    'Status flow explanation',
];

const HRAIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'bot',
            text: 'Hello! I am your HR Benefits Assistant. Ask me anything about Workmen\'s Compensation (WCL1) workflows, SLAs, or employee claim processing.',
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
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: "I am currently scanning the DLRRD guidelines and the COIDA act. This playground is a simulation of the AI Benefits Assistant. In a live system, this assistant is plugged into your backend knowledge database to help you draft WCL responses, analyze claim delays, and look up compensation terms.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMsg]);
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
                text: 'Hello! I am your HR Benefits Assistant. Ask me anything about Workmen\'s Compensation (WCL1) workflows, SLAs, or employee claim processing.',
                timestamp: new Date(),
            },
        ]);
        setActiveConversation(null);
    };

    return (
        <DashboardLayout
            title="AI Benefits Assistant"
            description="Consult DLRRD Workmen's Compensation policies and process claim documentation."
            breadcrumbs={[{ label: 'HR Benefits', path: '/hr/dashboard' }, { label: 'AI Assistant' }]}
        >
            <div className="flex gap-4 h-[calc(100vh-160px)] min-h-[500px]">
                {/* Left Panel: AI Info + Recent Conversations */}
                <div className="w-80 shrink-0 flex flex-col gap-4">
                    {/* AI Bot Card */}
                    <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-600">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">AI Benefits Assistant</h3>
                                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-semibold">
                                    Trained on COIDA laws, WCL1 documentation workflows, and DLRRD benefit guidelines.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Conversations */}
                    <div className="bg-white rounded-xl border border-gray-150 p-5 flex-1 flex flex-col shadow-sm">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Conversations</h4>
                        <div className="flex-1 space-y-2 overflow-y-auto">
                            {RECENT_CONVERSATIONS.map((conv, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                        activeConversation === conv
                                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                                    }`}
                                >
                                    {conv}
                                </button>
                            ))}
                        </div>

                        {/* New Chat Button */}
                        <button
                            onClick={handleNewChat}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus size={14} />
                            <span>New Chat</span>
                        </button>
                    </div>
                </div>

                {/* Right Panel: Chat Area */}
                <div className="flex-1 bg-white rounded-xl border border-gray-150 flex flex-col overflow-hidden shadow-sm">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {msg.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100 text-indigo-600">
                                        <Bot size={16} />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                                        msg.role === 'bot'
                                            ? 'bg-gray-50 text-gray-700 border border-gray-100'
                                            : 'bg-indigo-600 text-white shadow-sm'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Type a message or ask about WCL1..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-gray-400"
                            />
                            <button
                                className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors shrink-0"
                                title="Voice input"
                            >
                                <Mic size={16} />
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                title="Send message"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRAIAssistant;
