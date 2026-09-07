"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Home,
  MessageSquare,
  Bookmark,
  Bell,
  User,
  LogOut,
  ArrowRightLeft,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  AlertTriangle,
  Sparkles,
  Menu,
  X,
  Sliders,
  Moon,
  Sun,
  Trash2,
} from "lucide-react";
import { AccountSwitchModal } from "../modals/AccountSwitchModal";
import { DeleteAccountModal } from "../modals/DeleteAccountModal";

interface NavbarUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
  city?: string;
  isCollegeVerified?: boolean;
  verificationStatus?: "APPROVED" | "PENDING" | "REJECTED" | "UNSUBMITTED";
}

interface NavbarProps {
  initialUser?: NavbarUser | null;
}

export function Navbar({ initialUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<NavbarUser | null>(initialUser || null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";
  const isAdmin = user?.role === "ADMIN" && pathname.startsWith("/admin");

  useEffect(() => {
    // Check auth status on mount or route changes
    const checkAuth = () => {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        })
        .catch(() => {});
    };

    checkAuth();

    // Check notifications
    if (!isAdmin && !isAuthPage) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.unreadCount === "number") setUnreadNotifCount(data.unreadCount);
        })
        .catch(() => {});
    }

    const handleNotificationsUpdated = (e: any) => {
      if (typeof e?.detail?.unreadCount === "number") {
        setUnreadNotifCount(e.detail.unreadCount);
      } else {
        fetch("/api/notifications")
          .then((res) => res.json())
          .then((data) => {
            if (typeof data.unreadCount === "number") setUnreadNotifCount(data.unreadCount);
          })
          .catch(() => {});
      }
    };

    const handleUserUpdated = () => {
      checkAuth();
    };

    window.addEventListener("user-updated", handleUserUpdated);
    window.addEventListener("notifications-updated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, [pathname, isAuthPage]);

  useEffect(() => {
    // Listen to real-time events via SSE for users (only when logged in)
    if (isAdmin || isAuthPage || !user) return;

    let sse: EventSource | null = null;
    try {
      sse = new EventSource("/api/chat/stream");
      sse.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "NEW_MESSAGE" || event.type === "MESSAGE_NOTIFICATION") {
            setUnreadMsgCount((prev) => prev + 1);
          } else if (event.type === "MUTUAL_MATCH" || event.type === "INTEREST_RECEIVED") {
            setUnreadNotifCount((prev) => prev + 1);
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (sse) sse.close();
    };
  }, [user?.id, isAdmin, isAuthPage]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  // 1. ON AUTH PAGES: Always render a clean, completely unauthenticated header with no user profiles or admin tools
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                Room<span className="text-indigo-600 dark:text-indigo-400">Mate</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                Living Compatibility
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {pathname === "/login" ? (
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition"
              >
                Sign Up
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Regular Consumer Links
  const userNavLinks = [
    { href: "/discover", label: "Find Roommates", icon: Users },
    { href: "/rooms", label: "Find Rooms", icon: Home },
    { href: "/groups", label: "Groups", icon: Sparkles },
    { href: "/saved", label: "Saved", icon: Bookmark },
  ];

  // Dedicated Admin Navigation Links
  const adminNavLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/listings", label: "Listings", icon: Home },
    { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
    { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
  ];

  const activeNavLinks = isAdmin ? adminNavLinks : userNavLinks;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href={isAdmin ? "/admin" : "/"} className="flex items-center space-x-2.5 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition ${
                isAdmin
                  ? "bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 shadow-purple-500/25"
                  : "bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-indigo-500/25"
              }`}>
                {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                  Room<span className={isAdmin ? "text-purple-600 dark:text-purple-400" : "text-indigo-600 dark:text-indigo-400"}>Mate</span>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                  {isAdmin ? "Admin Platform" : "Living Compatibility"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {activeNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? isAdmin
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                          : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {/* Standard User Navigation Icons (Only for regular users) */}
                {!isAdmin && (
                  <>
                    <Link
                      href="/messages"
                      className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Messages"
                    >
                      <MessageSquare className="w-5 h-5" />
                      {unreadMsgCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                      )}
                    </Link>

                    <Link
                      href="/notifications"
                      className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </Link>

                    <Link
                      href="/rooms/new"
                      className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>List a Room</span>
                    </Link>
                  </>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition relative cursor-pointer"
                  >
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                        isAdmin
                          ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                          : "bg-gradient-to-tr from-indigo-500 to-violet-500"
                      }`}>
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          user.fullName?.charAt(0) || (isAdmin ? "A" : "U")
                        )}
                      </div>

                      {/* Top-Right Verification Status Dot for Users */}
                      {!isAdmin && (
                        user.verificationStatus === "APPROVED" || user.isCollegeVerified ? (
                          <span
                            title="Verification Status: Approved (Green)"
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-sm"
                          />
                        ) : user.verificationStatus === "REJECTED" ? (
                          <span
                            title="Verification Status: Rejected (Red)"
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 shadow-sm"
                          />
                        ) : (
                          <span
                            title="Verification Status: Pending Review (Yellow)"
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse"
                          />
                        )
                      )}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                      {user.fullName}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Header Info */}
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user.fullName}
                          </p>
                          {isAdmin && (
                            <ShieldAlert className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isAdmin
                                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800"
                                : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {isAdmin ? "🛡️ ADMIN" : `Role: ${user.role}`}
                          </span>

                          {/* Verification Status Pill inside dropdown */}
                          {!isAdmin && (
                            user.verificationStatus === "APPROVED" || user.isCollegeVerified ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Verified</span>
                              </span>
                            ) : user.verificationStatus === "REJECTED" ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Under Review</span>
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* ADMIN-SPECIFIC MENU OPTIONS */}
                      {isAdmin ? (
                        <div className="py-1">
                          <Link
                            href="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-2.5 text-purple-500" />
                            Admin Console
                          </Link>
                          <Link
                            href="/admin/users"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Users className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                            Manage All Users
                          </Link>
                          <Link
                            href="/admin/listings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Home className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                            Manage Listings
                          </Link>
                          <Link
                            href="/admin/verifications"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-2.5 text-emerald-500" />
                            ID Verifications
                          </Link>
                          <Link
                            href="/admin/reports"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-2.5 text-rose-500" />
                            Safety & Reports
                          </Link>

                          {/* Switch Account Option for Admin */}
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsSwitchModalOpen(true);
                            }}
                            className="w-full flex items-center px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 mr-2.5 text-indigo-500" />
                            <span>Switch to User Account</span>
                          </button>
                        </div>
                      ) : (
                        /* REGULAR USER MENU OPTIONS */
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <User className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                            My Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Sliders className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                            Lifestyle & Preferences
                          </Link>
                          <Link
                            href="/saved"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Bookmark className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                            Saved Items
                          </Link>

                          {/* Switch Account (Only for Owner) */}
                          {user.email?.toLowerCase() === "satyajitsasmal780@gmail.com" && (
                            <button
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setIsSwitchModalOpen(true);
                              }}
                              className="w-full flex items-center px-4 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 mr-2.5 text-purple-500" />
                              <span>Switch to Admin</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                          Logout
                        </button>
                        {!isAdmin && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2.5 text-rose-500" />
                            Delete Account
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 space-y-1">
            {activeNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Account Switching Security Modal */}
      <AccountSwitchModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        currentRole={user?.role}
        currentEmail={user?.email}
      />

      {/* Permanent Account Deletion Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userEmail={user?.email}
      />
    </>
  );
}
