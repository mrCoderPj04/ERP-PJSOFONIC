'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  User,
  Crown,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { fetchEmsEmployees, EmsUser } from '@/lib/ems';
import { useAuth } from '@/context/AuthContext';
import {
  getFilteredMessages,
  sendChatMessage,
  subscribeToChatUpdates,
  ChatMessage,
} from '@/lib/chatStore';

export default function CommunicationPage() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<'TEAM' | 'DIRECT'>('TEAM');
  const [emsStaff, setEmsStaff] = useState<EmsUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<EmsUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Load live EMS registered employees
  useEffect(() => {
    async function loadStaff() {
      setLoadingStaff(true);
      const employees = await fetchEmsEmployees();
      setEmsStaff(employees);

      // Default selected recipient to the first other employee in directory
      const otherEmp = employees.find((e) => e.employeeId !== user?.employeeId) || employees[0];
      if (otherEmp) {
        setSelectedRecipient(otherEmp);
      }
      setLoadingStaff(false);
    }
    loadStaff();
  }, [user?.employeeId]);

  // Sync messages from chatStore based on active channel and selected user
  const reloadMessages = () => {
    const list = getFilteredMessages(
      activeChannel,
      user?.id || user?.employeeId,
      selectedRecipient?.id || selectedRecipient?.employeeId
    );
    setMessages(list);
  };

  useEffect(() => {
    reloadMessages();
    const unsubscribe = subscribeToChatUpdates(() => {
      reloadMessages();
    });
    return () => unsubscribe();
  }, [activeChannel, selectedRecipient, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    sendChatMessage({
      senderId: user.id || user.employeeId,
      senderName: user.fullName || 'EMS Employee',
      senderRole: user.role || 'EMPLOYEE',
      senderAvatar: user.avatarUrl,
      recipientId: activeChannel === 'TEAM' ? 'ALL' : selectedRecipient?.id || selectedRecipient?.employeeId || 'ALL',
      recipientName: activeChannel === 'TEAM' ? 'All EMS Staff' : selectedRecipient?.fullName || 'EMS Staff',
      channel: activeChannel,
      content: inputText,
    });

    setInputText('');
    reloadMessages();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fadeIn">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Agency Real-Time EMS Communication Hub
            </h1>
            <p className="text-xs text-gray-400">
              Live Two-Way Real-Time Messaging between Verified EMS Employees
            </p>
          </div>
        </div>

        {/* Channel Switcher */}
        <div className="bg-gray-950 p-1 rounded-xl border border-gray-800 flex items-center gap-1">
          <button
            onClick={() => setActiveChannel('TEAM')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeChannel === 'TEAM'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Team Channel
          </button>
          <button
            onClick={() => setActiveChannel('DIRECT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeChannel === 'DIRECT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Direct DM Chat
          </button>
        </div>
      </div>

      {/* Chat Interface Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0">
        {/* Main Conversation Messages */}
        <div className="md:col-span-3 bg-gray-900/60 border border-gray-800/80 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
          {/* Active Conversation Banner */}
          <div className="p-3.5 px-6 border-b border-gray-800 bg-gray-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-semibold">Active Channel:</span>
              <span className="font-bold text-white uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[11px]">
                {activeChannel === 'TEAM' ? '📢 All Registered EMS Employees' : `💬 Direct Chat: ${selectedRecipient?.fullName}`}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Real-time Two-Way Sync Active
            </span>
          </div>

          {/* Message History List */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title={`No Messages in ${activeChannel === 'TEAM' ? 'Team Channel' : selectedRecipient?.fullName || 'Direct Chat'}`}
                description="Type a message below to start a live two-way conversation with EMS staff."
                actionLabel="Send First Message"
                onAction={() => setInputText('Hello team! Starting agency communication.')}
              />
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id || msg.senderId === user?.employeeId;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                      {msg.senderName.substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-xl text-xs space-y-1 ${
                        isMe
                          ? 'bg-indigo-600/90 text-white rounded-tr-none border border-indigo-500/40 shadow-lg'
                          : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className={`font-bold ${isMe ? 'text-indigo-100' : 'text-white'}`}>
                          {msg.senderName} <span className="text-[10px] opacity-75">({msg.senderRole})</span>
                        </span>
                        <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-950/80 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeChannel === 'TEAM'
                  ? 'Send a message to all registered EMS employees...'
                  : `Direct message ${selectedRecipient?.fullName || 'employee'}...`
              }
              className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>

        {/* Registered EMS Staff Directory Sidebar */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-4 flex flex-col backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> EMS Directory ({emsStaff.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {loadingStaff ? (
              <div className="p-4 text-center text-xs text-gray-500">Loading EMS Directory...</div>
            ) : emsStaff.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">No registered EMS staff found.</div>
            ) : (
              emsStaff.map((emp) => {
                const isSelected = selectedRecipient?.id === emp.id || selectedRecipient?.employeeId === emp.employeeId;
                const isCurrent = emp.employeeId === user?.employeeId;
                return (
                  <button
                    key={emp.id || emp.employeeId}
                    onClick={() => {
                      setSelectedRecipient(emp);
                      setActiveChannel('DIRECT');
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-white shadow-md'
                        : 'bg-gray-950/60 border-gray-800/80 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    {emp.avatarUrl ? (
                      <img
                        src={emp.avatarUrl}
                        alt={emp.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-indigo-500/30 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {emp.fullName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate flex items-center gap-1">
                        {emp.fullName}
                        {isCurrent && <span className="text-[9px] text-emerald-400 font-mono">(You)</span>}
                        {emp.role === 'TEAM_LEAD' && <Crown className="w-3 h-3 text-amber-400 inline" />}
                      </p>
                      <p className="text-[10px] text-indigo-400 font-mono font-bold">EMS ID: {emp.employeeId}</p>
                      <p className="text-[10px] text-gray-400 truncate">{emp.department}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
