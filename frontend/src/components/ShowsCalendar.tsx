import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpectacles = async () => {
      try {
        const { api } = await import('@/services/api');
        const data = await api.get('/api/spectacles/all');
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

  const handleDateClick = (spectaclesForDay: Spectacle[]) => {
    // Si il y a plusieurs spectacles, ne pas permettre le clic direct sur la date
    if (spectaclesForDay.length === 1) {
      navigate(`/spectacles/${spectaclesForDay[0].id}`);
    }
    // Si il y a plusieurs spectacles, ne rien faire - l'utilisateur doit choisir via le hover
  };

  const handleSpectacleClick = (spectacleId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêcher le clic sur la date
    navigate(`/spectacles/${spectacleId}`);
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);

    const daysInMonth = Number(format(monthEnd, "d"));
    const firstWeekday = ((Number(format(monthStart, "i")) + 6) % 7); // 0=Lun … 6=Dim (aligné sur notre header)

    const cells: JSX.Element[] = [];

    // Padding avant le 1er jour du mois
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(
        <div key={`pad-start-${i}`} className="text-center py-1 sm:py-2 md:py-3 px-1 sm:px-2 rounded text-gray-600">
          <div className="h-5 sm:h-6 md:h-8" />
        </div>
      );
    }

    // Jours du mois 1..N
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateObj = new Date(monthStart);
      dateObj.setDate(d);

      const now = new Date();
      const isPast = isBefore(dateObj, new Date(format(now, "yyyy-MM-dd")));

      const spectaclesForDay = spectacles.filter((s) =>
        isSameDay(parseISO(s.date_spectacle), dateObj)
      );

      let classes = "text-center py-1 sm:py-2 md:py-3 px-1 sm:px-2 rounded ";
      if (isPast) classes += "text-gray-500 "; else classes += "text-white ";

      const content = (
        spectaclesForDay.length > 0 ? (
          <div className="relative group">
            <div 
              className={`${spectaclesForDay.some(s => isSpectacleExpired(s.date_spectacle, s.heure_spectacle)) ? 'bg-red-200' : 'bg-red-500'} text-white rounded-full h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 flex items-center justify-center mx-auto ${spectaclesForDay.length === 1 ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200 text-[10px] sm:text-xs md:text-sm`}
              onClick={() => handleDateClick(spectaclesForDay)}
            >
              {d}
            </div>
            <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] sm:text-xs p-2 sm:p-3 rounded whitespace-nowrap leading-5 sm:leading-6 min-w-max">
              <div className="space-y-1 sm:space-y-2">
                {spectaclesForDay.map((s, index) => (
                  <div 
                    key={index} 
                    className="text-center cursor-pointer hover:bg-gray-700 p-1.5 sm:p-2 rounded transition-colors duration-200"
                    onClick={(e) => handleSpectacleClick(s.id, e)}
                  >
                    <div className="font-semibold text-red-400 hover:text-red-300">{s.title}</div>
                    <div className="text-gray-300">{formatHeure(s.heure_spectacle)}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-1 sm:mt-2 text-gray-400 text-[10px] sm:text-xs">
                {spectaclesForDay.length > 1 ? "Choisissez un spectacle ci-dessus" : "Cliquez pour voir les détails"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[10px] sm:text-xs md:text-sm">{d}</div>
        )
      );

      cells.push(
        <div key={`day-${d}`} className={classes}>
          {content}
        </div>
      );
    }

    // Padding de fin pour compléter la dernière semaine
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < (7 - remainder); i += 1) {
        cells.push(
          <div key={`pad-end-${i}`} className="text-center py-1 sm:py-2 md:py-3 px-1 sm:px-2 rounded text-gray-600">
            <div className="h-5 sm:h-6 md:h-8" />
          </div>
        );
      }
    }

    // Regrouper en lignes de 7
    const rows: JSX.Element[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3" key={`row-${i}`}>
          {cells.slice(i, i + 7)}
        </div>
      );
    }

    return rows;
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg md:text-xl text-white font-bold">
        {format(currentDate, "LLLL yyyy", { locale: fr })}
      </h3>
      <div className="flex space-x-2">
        <button
          onClick={prevMonth}
          className="p-1.5 md:p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition duration-300"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          onClick={nextMonth}
          className="p-1.5 md:p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition duration-300"
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
    <section id="calendrier-spectacles" className="py-12 md:py-16 text-[11px] sm:text-[13px] md:text-base">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
          Calendrier des spectacles
        </h2>
        <div className="bg-gray-900 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-800 shadow-2xl">
          {renderHeader()}

          <div>
            <div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 mb-2 md:mb-3">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-gray-500 text-[10px] sm:text-xs md:text-base font-semibold"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {renderDays()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowsCalendar;
