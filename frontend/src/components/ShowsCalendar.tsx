import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  isSameMonth,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale/fr";

type Spectacle = {
  id: number;
  date_spectacle: string;
  heure_spectacle: string;
  title: string;
  artiste_name: string;
};

const ShowsCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpectacles = async () => {
      try {
        const res = await fetch("https://scene-de-rire-prototype.onrender.com/api/spectacles/all");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setSpectacles(data);
        } else {
          console.error("Les données reçues ne sont pas un tableau:", data);
          setError("Format de données invalide");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des spectacles", err);
        setError("Erreur lors du chargement des spectacles");
      }
    };

    fetchSpectacles();
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const formatHeure = (heure: string) => {
    // Si l'heure est au format HH:mm:ss, on ne garde que HH:mm
    return heure.split(':').slice(0, 2).join(':');
  };

  const isSpectacleExpired = (date: string, heure: string) => {
    const now = new Date();
    const spectacleDateTime = new Date(`${date.split('T')[0]}T${heure}`);
    return spectacleDateTime < now;
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const now = new Date();
        const isPast = isBefore(day, new Date(format(now, "yyyy-MM-dd")));
        const isInCurrentMonth = isSameMonth(day, monthStart);

        const spectaclesForDay = spectacles.filter((s) =>
          isSameDay(parseISO(s.date_spectacle), day)
        );

        let classes = "text-center p-2 rounded ";
        if (!isInCurrentMonth) {
          classes += "text-gray-600 ";
        } else if (isPast) {
          classes += "text-gray-500 ";
        } else {
          classes += "text-white ";
        }

        const content =
          spectaclesForDay.length > 0 ? (
            <div className="relative group">
              <div className={`${spectaclesForDay.some(s => isSpectacleExpired(s.date_spectacle, s.heure_spectacle)) ? 'bg-yellow-200' : 'bg-yellow-400'} text-black rounded-full h-8 w-8 flex items-center justify-center mx-auto cursor-pointer`}>
                {format(day, "d")}
              </div>
              <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap">
                {spectaclesForDay
                  .map(
                    (s) =>
                      `${s.artiste_name} - ${formatHeure(s.heure_spectacle)}`
                  )
                  .join("\n")}
              </div>
            </div>
          ) : (
            <div>{format(day, "d")}</div>
          );

        days.push(
          <div key={day.toString()} className={classes}>
            {content}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl text-white font-bold">
        {format(currentDate, "LLLL yyyy", { locale: fr })}
      </h3>
      <div className="flex space-x-2">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition duration-300"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition duration-300"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <section id="calendrier-spectacles" className="py-16">
        <div className="container mx-auto px-6">
          <div className="bg-red-500 text-white p-4 rounded-lg">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="calendrier-spectacles" className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8">
          Calendrier des spectacles
        </h2>
        <div className="bg-gray-900 rounded-lg p-6">
          {renderHeader()}

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div
                key={day}
                className="text-center text-gray-500 text-sm font-semibold"
              >
                {day}
              </div>
            ))}
          </div>

          {renderDays()}
        </div>
      </div>
    </section>
  );
};

export default ShowsCalendar;
