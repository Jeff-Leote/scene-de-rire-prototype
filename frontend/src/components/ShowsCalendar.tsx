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

        let classes = "text-center py-3 px-2 rounded ";
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
              <div 
                className={`${spectaclesForDay.some(s => isSpectacleExpired(s.date_spectacle, s.heure_spectacle)) ? 'bg-red-200' : 'bg-red-500'} text-white rounded-full h-8 w-8 flex items-center justify-center mx-auto ${spectaclesForDay.length === 1 ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
                onClick={() => handleDateClick(spectaclesForDay)}
              >
                {format(day, "d")}
              </div>
              <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-3 rounded whitespace-nowrap leading-6 min-w-max">
                <div className="space-y-2">
                  {spectaclesForDay.map((s, index) => (
                    <div 
                      key={index} 
                      className="text-center cursor-pointer hover:bg-gray-700 p-2 rounded transition-colors duration-200"
                      onClick={(e) => handleSpectacleClick(s.id, e)}
                    >
                      <div className="font-semibold text-red-400 hover:text-red-300">{s.title}</div>
                      <div className="text-gray-300">{formatHeure(s.heure_spectacle)}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-2 text-gray-400 text-xs">
                  {spectaclesForDay.length > 1 ? "Choisissez un spectacle ci-dessus" : "Cliquez pour voir les détails"}
                </div>
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
        <div className="grid grid-cols-7 gap-3" key={day.toString()}>
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
    <section id="calendrier-spectacles" className="py-16 min-h-[10vh] text-lg">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8">
          Calendrier des spectacles
        </h2>
        <div className="bg-gray-900 rounded-xl p-8 md:p-10 min-h-[40vh] border border-gray-800 shadow-2xl">
          {renderHeader()}

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div
                key={day}
                className="text-center text-gray-500 text-base font-semibold"
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
