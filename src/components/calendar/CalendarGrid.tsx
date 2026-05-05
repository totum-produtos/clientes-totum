"use client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const circuloDouradoColors: Record<string, string> = {
  porque: 'bg-amber-500',
  oque: 'bg-emerald-500',
  como: 'bg-sky-500',
};

const circuloDouradoLabels: Record<string, string> = {
  porque: 'P',
  oque: 'Q',
  como: 'C',
};

type Post = {
  id: number;
  subject: string;
  tipo: string;
  published_at: string;
};

interface Props {
  month: Date;
  posts: Post[];
  onDayClick: (date: Date) => void;
  onPostClick: (post: Post) => void;
}

export default function CalendarGrid({ month, posts, onDayClick, onPostClick }: Props) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
        <div key={d} className="text-center text-xs font-medium text-gray-500 py-2 uppercase">
          {d}
        </div>
      ))}
      {days.map((day) => {
        const dayPosts = posts.filter((p) => isSameDay(new Date(p.published_at), day));
        return (
          <div
            key={day.toISOString()}
            onClick={() => onDayClick(day)}
            className={`min-h-[80px] border rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-gray-50 ${
              !isSameMonth(day, month) ? 'bg-gray-50/50 opacity-50' : 'bg-white'
            } ${isSameDay(day, new Date()) ? 'ring-2 ring-[#d81220] ring-offset-1' : ''}`}
          >
            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'text-[#d81220]' : 'text-gray-700'}`}>
              {format(day, 'd')}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {dayPosts.map((p) => (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPostClick(p);
                  }}
                  className={`w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${
                    circuloDouradoColors[p.tipo] || 'bg-gray-400'
                  }`}
                  title={`${p.subject} (${circuloDouradoLabels[p.tipo] || p.tipo})`}
                >
                  {circuloDouradoLabels[p.tipo] || '?'}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
