"use client";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format, addMonths, subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const tipoColors: Record<string, string> = {
  porque: "bg-danger",
  o_que: "bg-warning",
  como: "bg-success",
  oque: "bg-warning",
};

const tipoLabels: Record<string, string> = {
  porque: "P",
  o_que: "Q",
  como: "C",
  oque: "Q",
};

interface CalendarEvent {
  id: number | string;
  title: string;
  date: Date;
  type: string;
}

interface Props {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarGrid({
  currentMonth,
  onMonthChange,
  events,
  onDayClick,
  onEventClick,
}: Props) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-canvas rounded-md border border-hairline shadow-airbnb overflow-hidden">
      {/* Header com navegação de mês */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline-soft">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-md hover:bg-surface-soft text-muted hover:text-ink transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-title-sm font-cereal text-ink capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-md hover:bg-surface-soft text-muted hover:text-ink transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-caption text-muted py-2 uppercase font-medium">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(e.date, day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDayClick(day)}
                className={`min-h-[80px] border rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-surface-soft ${
                  !isCurrentMonth ? "bg-surface-soft/50 opacity-50" : "bg-canvas"
                } ${isToday ? "ring-2 ring-rausch ring-offset-1" : ""}`}
              >
                <span className={`text-sm font-medium ${isToday ? "text-rausch" : "text-ink"}`}>
                  {format(day, "d")}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayEvents.map((e) => (
                    <button
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick(e);
                      }}
                      className={`w-5 h-5 rounded-full text-[10px] font-bold text-on-primary flex items-center justify-center ${
                        tipoColors[e.type] || "bg-muted"
                      }`}
                      title={`${e.title} (${tipoLabels[e.type] || e.type})`}
                    >
                      {tipoLabels[e.type] || "?"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
