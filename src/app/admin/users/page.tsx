"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Check,
  RefreshCw,
  UserPlus,
  Shield,
  X,
  GraduationCap,
  Briefcase,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  gender: string;
  city: string;
  isEmailVerified: boolean;
  isCollegeVerified: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  createdAt: string;
  profile?: {
    profileCompletion: number;
    occupationStatus: string;
    collegeName?: string | null;
    companyName?: string | null;
  } | null;
  verifications?: {
    type: string;
    status: string;
  }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Create Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState("");
  const [addAdminSuccess, setAddAdminSuccess] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("query", search);
      if (roleFilter) query.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleUpdateStatus = async (userId: string, updates: Partial<AdminUserItem>) => {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminLoading(true);
    setAddAdminError("");
    setAddAdminSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create administrator");

      setAddAdminSuccess("New Administrator created successfully!");
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      fetchUsers();
      setTimeout(() => {
        setShowAddAdminModal(false);
        setAddAdminSuccess("");
      }, 1500);
    } catch (err: unknown) {
      setAddAdminError(err instanceof Error ? err.message : "Error creating admin");
    } finally {
      setAddAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-white">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">User Moderation & Governance</h1>
            <p className="text-xs text-slate-400 mt-1">
              Inspect registered users, manage roles, and grant administrator privileges
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Administrator</span>
            </button>

            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white"
            >
              <option value="">All Roles</option>
              <option value="USER">Standard Users</option>
              <option value="ADMIN">Admins Only</option>
            </select>
            <button
              onClick={fetchUsers}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role & City</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions & Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading user records...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs uppercase">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{u.fullName}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          u.role === "ADMIN" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-slate-800 text-slate-300"
                        }`}>
                          {u.role}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{u.city}</span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {u.isCollegeVerified ? (
                            u.verifications?.[0]?.type === "COMPANY" || u.profile?.occupationStatus === "WORKING_PROFESSIONAL" ? (
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                <Briefcase className="w-3 h-3 mr-1" />
                                <span>Employee Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                <span>Student Verified</span>
                              </span>
                            )
                          ) : u.verifications?.[0]?.status === "PENDING" ? (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Pending Review</span>
                            </span>
                          ) : u.verifications?.[0]?.status === "REJECTED" ? (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              <span>Unverified</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {u.isBanned ? (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            Banned
                          </span>
                        ) : u.isSuspended ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            Suspended
                          </span>
                        ) : u.role === "ADMIN" || u.isCollegeVerified ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-1.5">
                        {/* Promote or Demote Admin Button */}
                        {u.role === "ADMIN" ? (
                          <button
                            onClick={() => handleUpdateStatus(u.id, { role: "USER" })}
                            className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-[11px] rounded-lg font-semibold cursor-pointer"
                            title="Demote this admin to standard user"
                          >
                            Demote to User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(u.id, { role: "ADMIN" })}
                            className="px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-[11px] rounded-lg font-semibold cursor-pointer"
                            title="Promote this user to platform admin"
                          >
                            Promote to Admin
                          </button>
                        )}

                        <button
                          onClick={() => handleUpdateStatus(u.id, { isSuspended: !u.isSuspended })}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            u.isSuspended ? "bg-emerald-600 text-white" : "bg-amber-600/20 text-amber-300 hover:bg-amber-600/30"
                          }`}
                        >
                          {u.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add New Administrator Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Add Trusted Administrator</h3>
              </div>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Only platform administrators can add new authorized staff or co-administrators.
            </p>

            {addAdminError && (
              <div className="p-3 bg-rose-950/50 border border-rose-900 rounded-xl text-xs text-rose-300">
                {addAdminError}
              </div>
            )}

            {addAdminSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-900 rounded-xl text-xs text-emerald-300">
                {addAdminSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Co-Administrator Name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="staff@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Admin Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Secure password for this admin"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 text-slate-400 font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addAdminLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {addAdminLoading ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
