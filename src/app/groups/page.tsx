"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Sparkles, MapPin, Building, ShieldCheck, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface GroupItem {
  id: string;
  name: string;
  description?: string | null;
  city: string;
  locality?: string | null;
  targetBudgetTotal?: number | null;
  housingType: string;
  requiredBedrooms: number;
  creator: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    isCollegeVerified: boolean;
  };
  members: {
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
      isCollegeVerified: boolean;
    };
  }[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    city: "Kolkata",
    locality: "Salt Lake",
    targetBudgetTotal: 25000,
    housingType: "APARTMENT",
    requiredBedrooms: 3,
  });

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchGroups();
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Group Flat Hunting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Roommate Groups</h1>
          <p className="text-xs sm:text-sm text-indigo-100/80">
            Form a group with matched roommates to rent full 2BHK/3BHK flats together and split combined rent budgets.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Roommate Group</span>
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No roommate groups active yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a group with your matched friends or classmates to search for larger multi-bedroom flats together!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {group.requiredBedrooms} BHK • {group.housingType}
                  </span>
                  {group.targetBudgetTotal && (
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Target {formatINR(group.targetBudgetTotal)}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{group.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    <span>{group.locality ? `${group.locality}, ` : ""}{group.city}</span>
                  </p>
                </div>

                {group.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {group.description}
                  </p>
                )}

                {/* Member avatars */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Members ({group.members.length})
                  </span>
                  <div className="flex items-center -space-x-2">
                    {group.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center text-[10px] font-bold uppercase"
                        title={m.user.fullName}
                      >
                        {m.user.avatarUrl ? (
                          <img src={m.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          m.user.fullName.charAt(0)
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert("Invite or Join request sent to group creator!")}
                className="w-full py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl hover:bg-indigo-100 transition"
              >
                Request to Join Group
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Roommate Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 CSE Students seeking 3BHK Salt Lake"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your group habits and target rent per person..."
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={newGroup.city}
                    onChange={(e) => setNewGroup({ ...newGroup, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Locality</label>
                  <input
                    type="text"
                    value={newGroup.locality}
                    onChange={(e) => setNewGroup({ ...newGroup, locality: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Bedrooms Required</label>
                  <input
                    type="number"
                    value={newGroup.requiredBedrooms}
                    onChange={(e) => setNewGroup({ ...newGroup, requiredBedrooms: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Combined Budget (₹)</label>
                  <input
                    type="number"
                    value={newGroup.targetBudgetTotal}
                    onChange={(e) => setNewGroup({ ...newGroup, targetBudgetTotal: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
