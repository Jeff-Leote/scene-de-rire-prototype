'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

type CalendarSpectacle = {
  id: number;
  title: string;
  dateSpectacle: Date;
  heureSpectacle: Date;
};

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function isSpectacleExpired(spectacle: CalendarSpectacle) {
  const [hours, minutes] = formatTime(spectacle.heureSpectacle).split(':').map(Number);
  const dateTime = new Date(spectacle.dateSpectacle);
  dateTime.setHours(hours, minutes, 0, 0);
  return dateTime < new Date();
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function ShowsCalendar({ spectacles }: { spectacles: CalendarSpectacle[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = Number(format(monthEnd, 'd'));
  const firstWeekday = (Number(format(monthStart, 'i')) + 6) % 7;

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(<div key={`pad-start-${i}`} className="h-5 sm:h-6 md:h-8" />);
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateObj = new Date(monthStart);
    dateObj.setDate(d);
    const isPast = isBefore(dateObj, new Date(new Date().toDateString()));

    const spectaclesForDay = spectacles.filter((s) => isSameDay(s.dateSpectacle, dateObj));
    const allExpired = spectaclesForDay.length > 0 && spectaclesForDay.every(isSpectacleExpired);

    const content =
      spectaclesForDay.length > 0 ? (
        <div className={`relative ${allExpired ? '' : 'group'}`}>
          {allExpired || spectaclesForDay.length > 1 ? (
            <div
              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white sm:h-6 sm:w-6 sm:text-xs md:h-8 md:w-8 md:text-sm ${
                allExpired ? 'bg-gray-600' : 'bg-accent'
              }`}
            >
              {d}
            </div>
          ) : (
            <Link
              href={`/programmation/${spectaclesForDay[0].id}`}
              className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-white transition-transform duration-200 hover:scale-110 sm:h-6 sm:w-6 sm:text-xs md:h-8 md:w-8 md:text-sm"
            >
              {d}
            </Link>
          )}
          {!allExpired && (
            <div className="absolute bottom-full left-1/2 z-10 hidden min-w-max -translate-x-1/2 rounded bg-gray-800 p-2 text-[10px] leading-5 text-white group-hover:block sm:p-3 sm:text-xs sm:leading-6">
              <div className="space-y-1 sm:space-y-2">
                {spectaclesForDay.map((s) => (
                  <Link
                    key={s.id}
                    href={`/programmation/${s.id}`}
                    className="block rounded p-1.5 text-center transition-colors duration-200 hover:bg-gray-700 sm:p-2"
                  >
                    <div className="font-semibold text-accent">{s.title}</div>
                    <div className="text-gray-300">{formatTime(s.heureSpectacle)}</div>
                  </Link>
                ))}
              </div>
              <div className="mt-1 text-center text-[10px] text-gray-400 sm:mt-2 sm:text-xs">
                {spectaclesForDay.length > 1 ? 'Choisissez un spectacle ci-dessus' : 'Cliquez pour voir les détails'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-[10px] sm:text-xs md:text-sm">{d}</div>
      );

    cells.push(
      <div
        key={`day-${d}`}
        className={`rounded px-1 py-1 text-center sm:px-2 sm:py-2 md:py-3 ${isPast ? 'text-gray-500' : 'text-white'}`}
      >
        {content}
      </div>
    );
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i += 1) {
      cells.push(<div key={`pad-end-${i}`} className="h-5 sm:h-6 md:h-8" />);
    }
  }

  const rows: React.ReactNode[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(
      <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3" key={`row-${i}`}>
        {cells.slice(i, i + 7)}
      </div>
    );
  }

  return (
    <section className="py-12 text-[11px] sm:text-[13px] md:py-16 md:text-base">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <h2 className="mb-6 text-2xl font-bold text-white md:mb-8 md:text-3xl">Calendrier des spectacles</h2>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 shadow-2xl sm:p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white md:text-xl">
              {format(currentDate, 'LLLL yyyy', { locale: fr })}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentDate((d) => subMonths(d, 1))}
                className="rounded-full bg-gray-800 p-1.5 text-white transition duration-300 hover:bg-gray-700 md:p-2"
                aria-label="Mois précédent"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentDate((d) => addMonths(d, 1))}
                className="rounded-full bg-gray-800 p-1.5 text-white transition duration-300 hover:bg-gray-700 md:p-2"
                aria-label="Mois suivant"
              >
                ›
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2 md:mb-3 md:gap-3">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-gray-500 sm:text-xs md:text-base">
                {day}
              </div>
            ))}
          </div>

          {rows}
        </div>
      </div>
    </section>
  );
}
