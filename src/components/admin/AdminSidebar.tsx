"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  ShieldAlert,
  BadgeCheck,
  ArrowRightLeft,
  LogOut,
  ExternalLink,
  Shield,
} from "lucide-react";
import { AccountSwitchModal } from "@/components/modals/AccountSwitchModal";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email?: string; fullName?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setAdminUser(data.user);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/admin", label: "Overview & Analytics", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Moderation", icon: Users },
    { href: "/admin/listings", label: "Room Listings", icon: Home },
    { href: "/admin/reports", label: "Safety Reports", icon: ShieldAlert },
    { href: "/admin/verifications", label: "Verifications", icon: BadgeCheck },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 text-white shrink-0 min-h-screen">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight block">RoomMate</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Admin Governance
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Account Management */}
        <div className="pt-4 border-t border-slate-800 space-y-1.5">
          <button
            onClick={() => setIsSwitchModalOpen(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-indigo-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Switch to User Account</span>
          </button>

          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Go to User App</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      <AccountSwitchModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        currentRole="ADMIN"
        currentEmail={adminUser?.email || "satyajitsasmal022@gmail.com"}
      />
    </>
  );
}
