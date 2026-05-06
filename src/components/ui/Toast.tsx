"use client";
import React, { useEffect } from "react";
import { X, Bell } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink text-white px-4 py-3 rounded-md shadow-airbnb animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm">
      <Bell className="h-5 w-5 text-rausch shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-canvas/10 rounded shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
