"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-canvas rounded-md border border-hairline shadow-airbnb p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-muted">{label}</p>
          <p className="text-display-sm font-cereal text-ink mt-1">{value}</p>
          {trend && (
            <p className={`text-caption mt-1 ${trendUp ? "text-success" : "text-danger"}`}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-md bg-rausch/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-rausch" />
        </div>
      </div>
    </div>
  );
}
