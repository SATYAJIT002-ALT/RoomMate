"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  BadgeCheck,
  Check,
  X,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Search,
  Eye,
  FileText,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "STUDENT" | "EMPLOYEE" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  
  // Document preview modal state
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  
  // Reject reason modal state
  const [rejectItem, setRejectItem] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verifications");
      const data = await res.json();
      setVerifications(data.verifications || []);
    } catch (err) {
      console.error("Error loading verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (verificationId: string | null, userId: string, action: string, reason?: string) => {
    setActionLoading(true);
    try {
      await fetch("/api/admin/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          userId,
          action,
          reason,
        }),
      });
      setPreviewItem(null);
      setRejectItem(null);
      setRejectReason("");
      fetchVerifications();
    } catch (err) {
      console.error("Error executing moderation action:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = verifications.filter((v) => {
    const isStudentVerified = v.status === "VERIFIED" && v.type === "COLLEGE" && v.user?.isCollegeVerified;
    const isEmployeeVerified = v.status === "VERIFIED" && v.type === "COMPANY" && v.user?.isCollegeVerified;

    if (filter === "PENDING" && v.status !== "PENDING") return false;
    if (filter === "STUDENT" && !isStudentVerified) return false;
    if (filter === "EMPLOYEE" && !isEmployeeVerified) return false;
    if (filter === "REJECTED" && v.status !== "REJECTED") return false;
    
    if (search) {
      const q = search.toLowerCase();
      const name = v.user?.fullName?.toLowerCase() || "";
      const email = v.user?.email?.toLowerCase() || "";
      const inst = (v.instituteName || "").toLowerCase();
      return name.includes(q) || email.includes(q) || inst.includes(q);
    }
    return true;
  });

  const pendingCount = verifications.filter((v) => v.status === "PENDING").length;
  const studentCount = verifications.filter((v) => v.status === "VERIFIED" && v.type === "COLLEGE" && v.user?.isCollegeVerified).length;
  const employeeCount = verifications.filter((v) => v.status === "VERIFIED" && v.type === "COMPANY" && v.user?.isCollegeVerified).length;
  const rejectedCount = verifications.filter((v) => v.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-slate-950 flex text-white">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center space-x-2.5">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
              <span>Student & Employee ID Verifications</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Privately review submitted student & employee ID card photos to grant official trust badges
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>{studentCount} Verified Students</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30 flex items-center space-x-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{employeeCount} Verified Employees</span>
            </span>
            {pendingCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "ALL" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({verifications.length})
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "PENDING" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("STUDENT")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "STUDENT" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Students ({studentCount})
            </button>
            <button
              onClick={() => setFilter("EMPLOYEE")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "EMPLOYEE" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Employees ({employeeCount})
            </button>
            <button
              onClick={() => setFilter("REJECTED")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "REJECTED" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search student, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Verifications Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Applied As</th>
                  <th className="p-4">Institute / Company</th>
                  <th className="p-4">ID Proof Photo</th>
                  <th className="p-4">Badge Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Loading verification requests...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No verification records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => {
                    const isVerifiedStudent = v.status === "VERIFIED" && v.type === "COLLEGE" && v.user?.isCollegeVerified;
                    const isVerifiedEmployee = v.status === "VERIFIED" && v.type === "COMPANY" && v.user?.isCollegeVerified;

                    return (
                      <tr key={v.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white uppercase text-xs shrink-0">
                              {v.user?.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <span className="font-bold text-white block">
                                {v.user?.fullName}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {v.user?.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {v.type === "COMPANY" ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                              <Briefcase className="w-3 h-3" />
                              <span>Employee</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              <GraduationCap className="w-3 h-3" />
                              <span>Student</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-white block">
                            {v.instituteName || v.user?.profile?.collegeName || v.user?.profile?.companyName || "Organization"}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Submitted {formatRelativeTime(v.createdAt)}
                          </span>
                        </td>

                        <td className="p-4">
                          {v.documentUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewItem(v)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-xl text-[11px] font-bold text-indigo-300 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview ID Card</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">
                              No Document Attached
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {isVerifiedStudent ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                              <BadgeCheck className="w-3 h-3" />
                              <span>🎓 Student Verified</span>
                            </span>
                          ) : isVerifiedEmployee ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                              <BadgeCheck className="w-3 h-3" />
                              <span>💼 Employee Verified</span>
                            </span>
                          ) : v.status === "PENDING" ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                              <span>Pending Review</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isVerifiedStudent || isVerifiedEmployee ? (
                              <button
                                type="button"
                                onClick={() => handleAction(v.id, v.user.id, "REVOKE")}
                                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-xl font-bold text-[11px] transition cursor-pointer"
                              >
                                Revoke Badge
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction(v.id, v.user.id, "APPROVE_STUDENT")}
                                  title="Award Student Badge"
                                  className="px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>Student</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleAction(v.id, v.user.id, "APPROVE_EMPLOYEE")}
                                  title="Award Employee Badge"
                                  className="px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <Briefcase className="w-3.5 h-3.5" />
                                  <span>Employee</span>
                                </button>

                                {v.status === "PENDING" && (
                                  <button
                                    type="button"
                                    onClick={() => setRejectItem(v)}
                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 rounded-xl font-bold text-[11px] transition cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                )}
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAction(v.id, v.user.id, "DELETE")}
                              title="Delete this verification request"
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer rounded-lg hover:bg-slate-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 1. SECURE ID PHOTO PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>ID Document Verification Preview</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applicant: <span className="text-white font-semibold">{previewItem.user?.fullName}</span> ({previewItem.user?.email})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Institution / Company</span>
              <span className="text-white font-semibold">{previewItem.instituteName || "Not specified"}</span>
            </div>

            {/* Full ID Image Display */}
            <div className="rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center max-h-[380px] p-2">
              <img
                src={previewItem.documentUrl}
                alt="ID Card Photo Preview"
                className="max-h-[360px] w-auto max-w-full object-contain rounded-xl shadow-md"
              />
            </div>

            {/* Admin Decision Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectItem(previewItem)}
                className="w-full sm:w-auto px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Reject & Request Re-upload
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction(previewItem.id, previewItem.user.id, "APPROVE_STUDENT")}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Grant Student Badge</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction(previewItem.id, previewItem.user.id, "APPROVE_EMPLOYEE")}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Grant Employee Badge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECTION REASON MODAL */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Rejection Feedback</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide feedback for <strong className="text-white">{rejectItem.user?.fullName}</strong> explaining why their ID document was rejected:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., ID card photo is blurry, expired ID, or name does not match profile..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction(rejectItem.id, rejectItem.user.id, "REJECT", rejectReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
