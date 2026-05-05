"use client";
import React from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
    id: string | number;
    title: string;
    date: Date;
    type: string;
    color?: string;
}

interface CalendarGridProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    events: CalendarEvent[];
    onDayClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

const typeColors: Record<string, string> = {
    viral: 'bg-purple-500',
    conversion: 'bg-green-500',
    educational: 'bg-blue-500',
    default: 'bg-gray-400',
};

export default function CalendarGrid({ currentMonth, onMonthChange, events, onDayClick, onEventClick }: CalendarGridProps) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
        days.push(day);
        day = addDays(day, 1);
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="bg-white rounded-lg shadow border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <div className="flex gap-1">
                    <button onClick={() => onMonthChange(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button onClick={() => onMonthChange(new Date())} className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                        Hoje
                    </button>
                    <button onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 border-b">
                {weekDays.map((d) => (
                    <div key={d} className="p-2 text-center text-xs font-medium text-gray-500 uppercase">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
                {days.map((date, idx) => {
                    const isCurrentMonth = isSameMonth(date, monthStart);
                    const isToday = isSameDay(date, new Date());
                    const dayEvents = events.filter((e) => isSameDay(new Date(e.date), date));

                    return (
                        <div
                            key={idx}
                            onClick={() => onDayClick(date)}
                            className={`min-h-[100px] p-2 border-b border-r cursor-pointer transition-colors hover:bg-gray-50 ${
                                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'text-gray-900'
                            } ${isToday ? 'bg-primary-50' : ''}`}
                        >
                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600' : ''}`}>
                                {format(date, 'd')}
                            </div>
                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate ${typeColors[event.type] || typeColors.default}`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[10px] text-gray-500 pl-1">+{dayEvents.length - 3} mais</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
