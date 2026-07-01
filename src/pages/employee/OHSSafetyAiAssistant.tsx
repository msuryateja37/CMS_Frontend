import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Send, Bot, User, ShieldAlert, Sparkles, ChevronRight, HelpCircle, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

const OHSSafetyAiAssistant: React.FC = () => {
    const { user } = useAuthStore();
    const firstName = user?.fullName?.split(' ')[0] || 'Employee';
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'ai',
            text: `Hello ${firstName}, how can I help? Ask me anything about workplace safety, incident reporting procedures, or the OHS Act.`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const quickActions = [
        { text: 'What do I do right after a workplace injury?', query: 'injury_steps' },
        { text: 'How do I log a near-miss incident?', query: 'near_miss' },
        { text: 'What information will HR need for a WCL claim?', query: 'wcl_info' },
        { text: 'What PPE is required for site visits?', query: 'ppe_reqs' }
    ];

    const safetyKnowledge: Record<string, string> = {
        injury_steps: `If a workplace injury occurs, take these immediate actions:
1. **Seek first aid or medical attention** immediately. Notify the designated First Aider at your office.
2. **Secure the area** if there is an ongoing hazard, to prevent further injury.
3. **Report the incident** to your supervisor and log it in this OHS portal within 24 hours.
4. **Collect evidence**: Take photos of the scene and note details of any witnesses.`,
        
        near_miss: `To log a near-miss incident:
1. Navigate to the **Report Incident** page.
2. Select the **Safety** or **Other** category depending on the nature of the hazard.
3. In the description, clearly state that this was a "near-miss" (an event that could have caused injury or damage but did not).
4. Outline the preventative actions taken to avoid it happening again. Near-miss logs help OHS practitioners implement controls before an accident occurs.`,
        
        wcl_info: `For an Injury on Duty (IOD) Workmen's Compensation (COIDA) claim, HR Benefits will require:
1. Completed **WCL2 Form** (Employer's Report of an Accident).
2. Certified copy of the employee's **ID document**.
3. **First Medical Report** (WCL4) completed by the treating medical practitioner.
4. **Annexure 1** recording (logged by the OHS practitioner).
5. Detailed witness statements and employee statements.`,
        
        ppe_reqs: `Minimum PPE required for DLRRD site visits/inspections:
1. **Head Protection**: Hard hat (for active construction or structural assessment sites).
2. **Footwear**: Steel-toe safety boots or sturdy closed shoes.
3. **High-Visibility**: Reflective safety vest.
4. **Eye/Face Protection**: Safety goggles (if dust, flying debris, or chemicals are present).
5. Confirm specific site safety requirements with the on-site Safety Officer before entering.`
    };

    const getGeneralResponse = (input: string): string => {
        const text = input.toLowerCase();
        if (text.includes('iod') || text.includes('compensation') || text.includes('wcl') || text.includes('coida')) {
            return `Injury on Duty (IOD) claims are managed jointly by OHS and HR Benefits. If you suffer an IOD:
1. Log the case as a **Health** incident.
2. Your local **First Aider** will attend to you and refer you to medical treatment.
3. Once referred, **HR Benefits** will automatically be notified to issue a **WCL2 Claim Form** within the statutory timeline.`;
        }
        if (text.includes('first aid') || text.includes('aider') || text.includes('doctor')) {
            return `Every office at the Department has a designated First Aider. When you submit a **Health** incident:
1. An in-app alert is dispatched to the First Aider within 60 seconds.
2. They are required to accept and attend to the ticket within 2 hours.
3. They will administer first aid and log the treatment record here, or refer you to medical care if needed.`;
        }
        if (text.includes('section 8') || text.includes('act') || text.includes('law')) {
            return `**Section 8 of the OHS Act (Act 85 of 1993)** outlines the general duties of employers to their employees:
- Provide and maintain a safe, hazard-free working environment.
- Eliminate or mitigate hazards before relying on Personal Protective Equipment (PPE).
- Provide necessary information, training, instruction, and supervision.
- Ensure safety in the handling, storage, and transport of tools and materials.`;
        }
        if (text.includes('power') || text.includes('water') || text.includes('outage') || text.includes('infrastructure')) {
            return `Power and water outages are logged under the **Other** category (Sub-type: Power Outage / Water Outage). 
These incidents are auto-reported directly to the **Deputy Director-General (DDG) CSS** to trigger emergency infrastructure response and facility management escalation.`;
        }
        return `I can help guide you on OHS procedures. For specific compliance documents, please refer to the OHS Audit Checklist or consult your provincial OHS practitioner. If this is a medical emergency, please contact first aid or dial 10177 immediately.`;
    };

    const handleSendMessage = (textToSend: string) => {
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Math.random().toString(),
            sender: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking and response delay
        setTimeout(() => {
            let aiText = '';
            // Check if it matches a quick query
            const matchedAction = quickActions.find(q => q.text === textToSend);
            if (matchedAction && safetyKnowledge[matchedAction.query]) {
                aiText = safetyKnowledge[matchedAction.query];
            } else {
                aiText = getGeneralResponse(textToSend);
            }

            const aiMsg: Message = {
                id: Math.random().toString(),
                sender: 'ai',
                text: aiText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <DashboardLayout
            title="OHS Safety Assistant"
            description="AI Assistant"
            breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "AI Assistant" }]}
        >
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
                {/* Main Chat Interface */}
                <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
                    {/* Chat Messages Panel */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 max-w-[85%] ${
                                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                                    msg.sender === 'user'
                                        ? 'bg-gold-50 border-gold/15 text-gold'
                                        : 'bg-gray-50 border-gray-100 text-gray-600'
                                }`}>
                                    {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                                </div>
                                <div>
                                    <div className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                                        msg.sender === 'user'
                                            ? 'bg-[#884616] text-white rounded-tr-none'
                                            : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-gray-300 mt-1 block px-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3 max-w-[85%] mr-auto">
                                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                                    <Bot size={15} />
                                </div>
                                <div className="bg-gray-50 text-gray-800 border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick prompts helper if chat is empty or contains only greeting */}
                    {messages.length === 1 && !isTyping && (
                        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Sparkles size={11} className="text-gold" />
                                Suggested Questions
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {quickActions.map((qa, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(qa.text)}
                                        className="bg-white hover:bg-gold-50/20 text-left border border-gray-150 p-3 rounded-xl text-xs font-semibold text-gray-700 transition hover:border-gold/30 hover:shadow-sm"
                                    >
                                        {qa.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage(inputValue);
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about safety procedures, incident reporting..."
                                className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#884616] text-xs sm:text-[13px] bg-gray-50 focus:bg-white transition"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="bg-[#884616] text-white p-3 rounded-xl hover:bg-opacity-95 disabled:opacity-50 transition shrink-0 shadow-sm"
                            >
                                <Send size={15} />
                            </button>
                        </form>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-2 text-center leading-tight">
                            AI-generated guidance. For emergencies call 10177. Confirm policy details with your OHS Practitioner.
                        </p>
                    </div>
                </div>

                {/* Sidebar Resource Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm h-full flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                            <Shield size={18} className="text-gold" />
                            <h3 className="font-bold text-xs sm:text-sm text-gray-800">Quick Resources</h3>
                        </div>

                        <div className="space-y-2">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gold/20 transition cursor-pointer">
                                <h4 className="font-bold text-[11px] text-gray-700">OHS Act 85 of 1993</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">Statutory duties and framework guidelines</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gold/20 transition cursor-pointer">
                                <h4 className="font-bold text-[11px] text-gray-700">COID Act (Act 130 of 1993)</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">Workmen's compensation guidelines for injuries</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gold/20 transition cursor-pointer">
                                <h4 className="font-bold text-[11px] text-gray-700">Incident Flow Protocol</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">Step-by-step reporting guide for employees</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#884616]/5 border border-[#884616]/10 p-3.5 rounded-2xl mt-4">
                        <div className="flex items-start gap-2">
                            <ShieldAlert className="text-[#884616] shrink-0 mt-0.5" size={15} />
                            <div>
                                <h4 className="font-bold text-[11px] text-[#884616]">Need Urgent Help?</h4>
                                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                    If this is a severe injury or critical emergency, contact first aid responders immediately or visit the nearest medical center.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OHSSafetyAiAssistant;
