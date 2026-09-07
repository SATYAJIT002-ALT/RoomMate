"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  HeartHandshake,
  ShieldAlert,
  CheckCheck,
  MessageSquare,
  Trash2,
  AlertCircle,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface NotifItem {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      
      // Update global unread count
      if (typeof window !== "undefined" && typeof data.unreadCount === "number") {
        window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { unreadCount: data.unreadCount } }));
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    // 1. Instantly update UI and clear Bell red dot in real time without refresh
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { unreadCount: 0 } }));
    }

    // 2. Persist to database in background
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    const unreadRemaining = updated.filter((n) => !n.isRead).length;
    setNotifications(updated);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { unreadCount: unreadRemaining } }));
    }

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);

    const remaining = notifications.filter((n) => n.id !== id);
    const unreadRemaining = remaining.filter((n) => !n.isRead).length;
    setNotifications(remaining);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { unreadCount: unreadRemaining } }));
    }

    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    setNotifications([]);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { unreadCount: 0 } }));
    }

    try {
      await fetch("/api/notifications?all=true", {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "MUTUAL_MATCH":
        return <HeartHandshake className="w-5 h-5 text-emerald-500" />;
      case "INTEREST_RECEIVED":
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case "NEW_MESSAGE":
        return <MessageSquare className="w-5 h-5 text-violet-500" />;
      case "VERIFICATION_STATUS":
        return <GraduationCap className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center space-x-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates on mutual matches, incoming roommate interests, and messages
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-indigo-500" />
              <span>Mark all read</span>
            </button>

            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold pt-2">No notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When someone sends interest or you get a mutual match, you will receive alerts here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkSingleRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 group relative cursor-pointer ${
                notif.isRead
                  ? "bg-white/85 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  : "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-900/70"
              }`}
            >
              <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    {notif.message}
                  </p>

                  <div className="flex items-center space-x-3 pt-0.5">
                    {notif.linkUrl && (
                      <Link
                        href={notif.linkUrl}
                        onClick={() => handleMarkSingleRead(notif.id)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View Details →
                      </Link>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Delete Button */}
              <button
                type="button"
                onClick={(e) => handleDeleteNotification(notif.id, e)}
                disabled={deletingId === notif.id}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition cursor-pointer shrink-0"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
