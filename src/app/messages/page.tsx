"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Image,
  ShieldAlert,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  User,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { ReportModal } from "@/components/modals/ReportModal";

interface ConversationItem {
  id: string;
  isGroup: boolean;
  name: string;
  avatarUrl?: string | null;
  otherUser?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    city: string;
    isCollegeVerified: boolean;
  } | null;
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
    isMine: boolean;
  } | null;
  updatedAt: string;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Safety report modal
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch current user and conversations
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUserId(data.user.id);
          setIsVerified(!!data.user.isCollegeVerified);
        }
      })
      .catch(() => {});

    fetchConversations();

    // Listen to real-time events via SSE
    const sse = new EventSource("/api/chat/stream");
    sse.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === "NEW_MESSAGE") {
          const newMsg: MessageItem = event.payload;
          if (newMsg.conversationId === activeConvId) {
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          }
          fetchConversations();
        } else if (event.type === "MESSAGE_NOTIFICATION") {
          fetchConversations();
        }
      } catch {}
    };

    return () => {
      sse.close();
    };
  }, [activeConvId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!activeConvId && data.conversations.length > 0) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    fetch(`/api/chat/messages?conversationId=${activeConvId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
          setTimeout(scrollToBottom, 100);
        }
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || sending) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          content,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
        fetchConversations();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  if (isVerified === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase">
            Identity Verification Required
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Chat & Direct Messaging Locked
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            To ensure the absolute safety and authenticity of all members, you must have an approved Student or Employee ID to chat with roommates.
          </p>
        </div>
        <div>
          <a
            href="/profile"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
          >
            Check Verification Status in Profile →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex-1 grid grid-cols-1 md:grid-cols-12">
        {/* Left: Conversations List */}
        <div
          className={`md:col-span-5 lg:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
            activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>Messages</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">No active conversations</h4>
                <p className="text-[11px] text-slate-500">
                  When you mutually match with a roommate or show interest, your chat will appear here.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-4 flex items-center space-x-3 text-left transition ${
                      isActive
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-sm">
                        {conv.avatarUrl ? (
                          <img src={conv.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          conv.name.charAt(0)
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.name}
                        </span>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-400">
                            {formatRelativeTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {conv.lastMessage?.content || "Say hello to your matched roommate!"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Thread */}
        <div
          className={`md:col-span-7 lg:col-span-8 flex flex-col bg-slate-50/50 dark:bg-slate-950/30 ${
            !activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Active Header */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {activeConversation.avatarUrl ? (
                      <img
                        src={activeConversation.avatarUrl}
                        alt=""
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      activeConversation.name.charAt(0)
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {activeConversation.name}
                    </h3>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      Live Connection Active
                    </span>
                  </div>
                </div>

                {activeConversation.otherUser && (
                  <button
                    onClick={() =>
                      setReportTarget({
                        id: activeConversation.otherUser!.id,
                        name: activeConversation.otherUser!.fullName,
                      })
                    }
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Safety Report"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl text-xs shadow-sm leading-relaxed ${
                          isMine
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                      </div>

                      <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center space-x-1">
                        <span>{formatRelativeTime(msg.createdAt)}</span>
                        {isMine && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck className="w-3 h-3 text-indigo-500 inline" />
                            ) : (
                              <Check className="w-3 h-3 inline" />
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select a conversation to start messaging
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Real-time messages between mutual matches and roommate connections.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Safety Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetUserId={reportTarget.id}
          targetName={reportTarget.name}
        />
      )}
    </div>
  );
}
