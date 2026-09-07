import React from "react";
import { CompatibilityCategoryScores } from "@/types";
import { getScoreColor } from "@/lib/utils";

interface CategoryBreakdownProps {
  scores: CompatibilityCategoryScores;
}

export function CategoryBreakdown({ scores }: CategoryBreakdownProps) {
  const categories = [
    { label: "Lifestyle Rhythms", weight: "25%", score: scores.lifestyle },
    { label: "Budget & Location", weight: "20%", score: scores.budgetLocation },
    { label: "Personality & Nature", weight: "15%", score: scores.personality },
    { label: "Habits, Food & Guests", weight: "15%", score: scores.habitsFood },
    { label: "Housing Requirements", weight: "15%", score: scores.housing },
    { label: "Hobbies & Interests", weight: "10%", score: scores.hobbies },
  ];

  return (
    <div className="space-y-2.5">
      {categories.map((cat) => {
        const colors = getScoreColor(cat.score);
        return (
          <div key={cat.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {cat.label}{" "}
                <span className="text-[10px] text-slate-400 font-normal">({cat.weight})</span>
              </span>
              <span className={`font-bold ${colors.text}`}>{cat.score}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${Math.max(5, cat.score)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
