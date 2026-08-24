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
  Code2,
  ShieldAlert,
  Search,
  RefreshCw,
} from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { fetchEmsEmployees, EmsUser } from '../../lib/ems';
import { useAuth } from '../../context/AuthContext';
import {
  getFilteredMessages,
  sendChatMessage,
  subscribeToChatUpdates,
  syncChatMessagesFromBackend,
  normalizeChatId,
  ChatMessage,
} from '../../lib/chatStore';
import { addSystemNotification } from '../../lib/notificationStore';

export default function CommunicationPage() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<'TEAM' | 'DIRECT'>('TEAM');
  const [emsStaff, setEmsStaff] = useState<EmsUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<EmsUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = user?.role || 'EMPLOYEE';
  const userDesig = (user?.designation || '').toUpperCase();
  const userDept = (user?.department || '').toUpperCase();

  const isAdmin =
    userRole === 'ADMIN' ||
    userDesig.includes('ADMIN') ||
    userDept.includes('ADMIN') ||
    userDesig.includes('DIRECTOR');

  const isTeamLead =
    userRole === 'TEAM_LEAD' ||
    (!isAdmin && (userDesig.includes('LEAD') || userDesig.includes('MANAGER') || userDesig.includes('TL')));

  // Helper to check if employee is Team Leader
  const checkIsTeamLeader = (emp: EmsUser): boolean => {
    const d = (emp.designation || '').toUpperCase();
    const dept = (emp.department || '').toUpperCase();
    const r = (emp.role || '').toUpperCase();

    return (
      r === 'TEAM_LEAD' ||
      r.includes('LEAD') ||
      r.includes('TL') ||
      r.includes('MANAGER') ||
      d.includes('LEAD') ||
      d.includes('LEADER') ||
      d.includes('TL') ||
      d.includes('MANAGER') ||
      d.includes('HEAD') ||
      dept.includes('LEAD') ||
      dept.includes('LEADER') ||
      dept.includes('TL') ||
      dept.includes('TEAM LEAD') ||
      dept.includes('TEAM LEADER') ||
      dept.includes('MANAGEMENT')
    );
  };

  // Helper to check if employee is Quality / QA
  const checkIsQuality = (emp: EmsUser): boolean => {
    const d = (emp.designation || '').toUpperCase();
    const dept = (emp.department || '').toUpperCase();
    const r = (emp.role || '').toUpperCase();

    return (
      r === 'QA' ||
      r.includes('QA') ||
      r.includes('QUALITY') ||
      d.includes('QA') ||
      d.includes('QUALITY') ||
      d.includes('TEST') ||
      d.includes('QC') ||
      d.includes('AUDIT') ||
      dept.includes('QUALITY') ||
      dept.includes('QA') ||
      dept.includes('TESTING') ||
      dept.includes('QC')
    );
  };

  // Helper to check if employee is Full Stack Engineer / Developer
  const checkIsFullStack = (emp: EmsUser): boolean => {
    const isTl = checkIsTeamLeader(emp);
    const isQa = checkIsQuality(emp);
    const isEmpAdmin =
      emp.role === 'ADMIN' ||
      (emp.designation || '').toUpperCase().includes('ADMIN') ||
      (emp.department || '').toUpperCase().includes('ADMIN');

    if (isTl || isQa || isEmpAdmin) return false;

    const d = (emp.designation || '').toUpperCase();
    const dept = (emp.department || '').toUpperCase();
    const r = (emp.role || '').toUpperCase();

    return (
      r === 'EMPLOYEE' ||
      d.includes('FULL STACK') ||
      d.includes('DEVELOPER') ||
      d.includes('ENGINEER') ||
      d.includes('SOFTWARE') ||
      d.includes('FRONTEND') ||
      d.includes('BACKEND') ||
      dept.includes('SOFTWARE') ||
      dept.includes('ENGINEERING') ||
      dept.includes('DEVELOPMENT')
    );
  };

  // Load live registered EMS employees
  const loadStaff = async () => {
    setLoadingStaff(true);
    const employees = await fetchEmsEmployees();
    setEmsStaff(employees);

    // Set default recipient
    const otherEmp = employees.find((e) => e.employeeId !== user?.employeeId) || employees[0];
    if (otherEmp && !selectedRecipient) {
      setSelectedRecipient(otherEmp);
    }
    setLoadingStaff(false);
  };

  useEffect(() => {
    loadStaff();
    syncChatMessagesFromBackend();
  }, [user?.employeeId]);

  // Sync messages from chatStore based on active channel and selected user
  const reloadMessages = () => {
    const list = getFilteredMessages(
      activeChannel,
      user?.employeeId || user?.id,
      selectedRecipient?.employeeId || selectedRecipient?.id
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

    const myEmpId = user.employeeId || user.id;
    const recipientEmpId =
      activeChannel === 'TEAM' ? 'ALL' : selectedRecipient?.employeeId || selectedRecipient?.id || 'ALL';

    sendChatMessage({
      senderId: myEmpId,
      senderName: user.fullName || 'EMS Employee',
      senderRole: user.role || 'EMPLOYEE',
      senderAvatar: user.avatarUrl,
      recipientId: recipientEmpId,
      recipientName: activeChannel === 'TEAM' ? 'Team Channel' : selectedRecipient?.fullName || 'EMS Staff',
      channel: activeChannel,
      content: inputText,
    });

    // Trigger dynamic System Notification with sender's name
    if (activeChannel === 'DIRECT' && selectedRecipient) {
      addSystemNotification({
        type: 'CHAT_MESSAGE',
        title: 'New Direct Message',
        message: `${user.fullName} sent you a message: "${inputText.length > 50 ? inputText.slice(0, 50) + '...' : inputText}"`,
        senderId: myEmpId,
        senderName: user.fullName || 'EMS Employee',
        recipientId: recipientEmpId,
        recipientName: selectedRecipient.fullName,
        link: '/communication',
      });
    } else if (activeChannel === 'TEAM') {
      addSystemNotification({
        type: 'CHAT_MESSAGE',
        title: 'Team Channel Message',
        message: `${user.fullName} posted in Team Channel: "${inputText.length > 50 ? inputText.slice(0, 50) + '...' : inputText}"`,
        senderId: myEmpId,
        senderName: user.fullName || 'EMS Employee',
        recipientId: 'ALL',
        link: '/communication',
      });
    }

    setInputText('');
    reloadMessages();
  };

  // =========================================================================
  // 1. TEAM CHANNEL DIRECTORY RULE:
  // For Team Leader Login: ONLY Full Stack and Quality (QA) Staff
  // For Admin Login: Team Leaders and Quality (QA) Staff
  // =========================================================================
  const teamChannelDirectory = emsStaff.filter((emp) => {
    const isTl = checkIsTeamLeader(emp);
    const isQa = checkIsQuality(emp);
    const isFs = checkIsFullStack(emp);

    if (isTeamLead) {
      // Team leader k liye Team Channel directory mai ONLY Full stack and Quality ka naam and id
      return isFs || isQa;
    }

    if (isAdmin) {
      // Admin k liye Team Channel directory mai ONLY Team leader and Quality
      return isTl || isQa;
    }

    return isTl || isQa || isFs;
  });

  // =========================================================================
  // 2. DIRECT DM CHAT DIRECTORY RULE:
  // ALL Registered EMS Employees from https://erp-backend-1-02lc.onrender.com/api
  // =========================================================================
  const directDmDirectory = emsStaff;

  const currentDisplayDirectory = (activeChannel === 'TEAM' ? teamChannelDirectory : directDmDirectory).filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      (emp.fullName || '').toLowerCase().includes(q) ||
      (emp.employeeId || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q) ||
      (emp.designation || '').toLowerCase().includes(q)
    );
  });

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
              Live Two-Way Messaging for Registered EMS Staff (Backend: <span className="font-mono text-indigo-400">https://erp-backend-1-02lc.onrender.com/api</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={loadStaff}
            disabled={loadingStaff}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-all"
            title="Refresh Live EMS Staff"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStaff ? 'animate-spin' : ''}`} />
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
              <span className="text-gray-400 font-semibold">Active Room:</span>
              <span className="font-bold text-white uppercase bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 text-[11px] flex items-center gap-1.5">
                {activeChannel === 'TEAM' ? (
                  <>
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {isTeamLead
                        ? 'Team Channel (Full Stack & Quality Staff)'
                        : isAdmin
                        ? 'Team Channel (Team Leaders & Quality Staff)'
                        : 'Team Channel (EMS Project Team)'}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Direct DM: [{selectedRecipient?.employeeId}] {selectedRecipient?.fullName}</span>
                  </>
                )}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Real-Time EMS Sync
            </span>
          </div>

          {/* Message History List */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title={
                  activeChannel === 'TEAM'
                    ? 'No Messages in Team Channel'
                    : `No Messages with [${selectedRecipient?.employeeId}] ${selectedRecipient?.fullName}`
                }
                description="Type a message below to communicate in real-time with verified EMS registered employees."
                actionLabel="Send First Message"
                onAction={() => setInputText('Hello team! Starting real-time EMS discussion.')}
              />
            ) : (
              messages.map((msg) => {
                const myNormId = normalizeChatId(user?.employeeId || user?.id);
                const msgNormId = normalizeChatId(msg.senderId);
                const isMe =
                  msgNormId === myNormId ||
                  (!!user?.fullName && msg.senderName.toLowerCase().includes(user.fullName.toLowerCase()));

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
                          [{msg.senderId}] {msg.senderName} <span className="text-[10px] opacity-75">({msg.senderRole})</span>
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
                  ? 'Send a message to team channel...'
                  : `Direct message to [${selectedRecipient?.employeeId}] ${selectedRecipient?.fullName || 'employee'}...`
              }
              className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        {/* Directory Sidebar */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-4 flex flex-col backdrop-blur-md overflow-hidden">
          <div className="pb-3 border-b border-gray-800 mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                {activeChannel === 'TEAM' ? (
                  <>
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>
                      {isTeamLead ? 'Full Stack & Quality' : isAdmin ? 'Team Leaders & Quality' : 'Team Directory'} ({currentDisplayDirectory.length})
                    </span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>All EMS Employees ({currentDisplayDirectory.length})</span>
                  </>
                )}
              </h2>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {loadingStaff ? (
              <div className="p-4 text-center text-xs text-gray-500">Loading EMS directory...</div>
            ) : currentDisplayDirectory.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">No matching employees found.</div>
            ) : (
              currentDisplayDirectory.map((emp) => {
                const isSelected = selectedRecipient?.employeeId === emp.employeeId;
                const isCurrent = emp.employeeId === user?.employeeId;
                const isTl = checkIsTeamLeader(emp);
                const isQa = checkIsQuality(emp);
                const isFs = checkIsFullStack(emp);

                return (
                  <button
                    key={emp.id || emp.employeeId}
                    onClick={() => {
                      setSelectedRecipient(emp);
                      if (activeChannel === 'TEAM') {
                        setActiveChannel('DIRECT');
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-white shadow-md'
                        : 'bg-gray-950/60 border-gray-800/80 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                      {emp.fullName.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate flex items-center gap-1 text-white">
                        <span>{emp.fullName}</span>
                        {isCurrent && <span className="text-[9px] text-emerald-400 font-mono">(You)</span>}
                        {isTl && <Crown className="w-3 h-3 text-amber-400 inline" />}
                        {isQa && <ShieldAlert className="w-3 h-3 text-rose-400 inline" />}
                        {isFs && <Code2 className="w-3 h-3 text-cyan-400 inline" />}
                      </p>
                      <p className="text-[10px] text-indigo-400 font-mono font-bold">
                        ID: {emp.employeeId}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {emp.department} • {emp.designation}
                      </p>
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
