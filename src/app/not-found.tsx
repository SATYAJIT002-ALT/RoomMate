import React from "react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-4 max-w-md">
        <h1 className="text-7xl font-black text-slate-300 dark:text-slate-800 tracking-widest">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
