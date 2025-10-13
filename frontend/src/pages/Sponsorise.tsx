import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/sonner";

interface SponsoriseData {
  title: string;
  img: string;
  description: string;
  schedule: string;
  lieu: string;
  lien_spectacle: string;
}

const Sponsorise = () => {
  const { slug } = useParams();
  const [data, setData] = useState<SponsoriseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données des spectacles sponsorisés
  const sponsoriseData: Record<string, SponsoriseData> = {
    'tchatcheur-comedy-club': {
      title: 'Tchatcheur Comedy Club',
      img: '/assets/img/spectacles/Tchatcheur comedy club.webp',
      description: 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet...\n\nVéritable révélateur de talents, depuis sa création en 2017, le Tchatcheur comedy club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. A chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats !.\n\nIls ont déjà joué au Tchatcheur comedy club : Paul Mirabel, Inès Reg, Ilyes Djadel, Fanny Ruwet, David Voinson, Lilia Benchabane, Nordine Ganso, Tareek, Amine Radi, Mahé etc. .\n\nÀ savoir :\n- Le billet comporte une consommation incluse. \n- Durée du spectcale : 70 minutes. \n- Toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle.\n- Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J.\n- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n- Vous avez la possibilité de consommer des planches apéritives sur place, pendant, avant ou après le spectacle.',
      schedule: 'Le lundi, mardi, mercredi et vendredi à 20h00',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/tchatcheur-comedy-club1'
    },
    'un-ado-peut-en-cacher-un-autre': {
      title: 'Un Ado peut en cacher un autre',
      img: '/assets/img/spectacles/Un Ado peut en cacher un autre.webp',
      description: 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.\nMarina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...\n\nSauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait...\n\nAttention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.\n\nA savoir :\n . Durée du spectcale : 70 minutes\n . A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n . La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.',
      schedule: 'Le dimanche à 17h00',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/un-ado-peut-en-cacher-un-autre18'
    },
    'cheri-je-tai-trompe': {
      title: 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)',
      img: '/assets/img/spectacles/Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp',
      description: 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers...\nÉric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. \n\nRésultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables. \n\nLe saviez-vous ?\nUne comédie qui a déjà cumulé plus de 500 000 spectateurs. \nChéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. \nGrand succès au Festival d\'Avignon.\n\nA savoir : \n. Durée du spectcale : 75 minutes \n. A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n. La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.',
      schedule: 'Le dimanche à 18h30',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'
    },
    'kaci-dans-la-connerie-humaine': {
      title: 'Kaci dans La connerie humaine',
      img: '/assets/img/spectacles/Kaci dans la connerie humaine.webp',
      description: 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.\nAvec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue.\n\nRenversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !\n\nLe Saviez-vous ?\nOn a pu apercevoir Kaci en première partie d\'Ahmed Sylla. Kaci est actuellement en tournée dans toute la France et chaque année au festival d\'Avignon.\n\nA savoir :\n.  Durée du spectcale : 70 minutes\n . A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.',
      schedule: 'Le dimanche à 20h00',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine'
    }
  };

  useEffect(() => {
    if (!slug) {
      setError('Page non trouvée');
      setLoading(false);
      return;
    }

    const spectacleData = sponsoriseData[slug];
    if (!spectacleData) {
      setError('Spectacle non trouvé');
      setLoading(false);
      return;
    }

    setData(spectacleData);
    setLoading(false);
  }, [slug]);

  const handleReserve = () => {
    if (!data) return;
    
    if (data.lien_spectacle) {
      window.location.href = data.lien_spectacle;
      return;
    }
    
    toast.error("Lien de billetterie indisponible pour ce spectacle.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6 text-center">
            <p className="text-red-500">{error || "Spectacle non trouvé"}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6">
            {/* Hero Section */}
            <div className="relative h-[700px] rounded-xl overflow-hidden mb-8 shadow-2xl">
              <img
                src={buildImgSrc('spectacles', (data.img || '').replace(/\.(jpe?g)$/i, '.webp')) || "/assets/placeholder.jpg"}
                alt={data.title}
                className="w-full h-full object-cover object-center"
                onError={onImgErrorSwap}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center mb-6">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                    SPECTACLE RÉCURRENT
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                  {data.title}
                </h1>
                <div className="flex items-center text-white/90 text-lg">
                  <i className="fa-solid fa-calendar-days mr-3 text-red-400"></i>
                  <span className="font-medium">{data.schedule}</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">
                {/* Informations pratiques */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <i className="fa-regular fa-calendar mr-3 text-red-500 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Programmation</p>
                        <p className="text-white">{data.schedule}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-solid fa-location-dot mr-3 text-red-500 text-xl"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Lieu</p>
                        <p className="text-white">{data.lieu}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                  <p className="text-gray-300 whitespace-pre-line">{data.description}</p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-white mb-4">Réserver</h2>
                  <p className="text-gray-300 mb-6">
                    Ne manquez pas ce spectacle exceptionnel ! Réservez vos places dès maintenant.
                  </p>
                  <button
                    onClick={handleReserve}
                    className="w-full font-bold py-3 px-6 rounded transition duration-300 flex items-center justify-center bg-red-500 text-white hover:bg-red-600"
                  >
                    <i className="fa-solid fa-ticket-alt mr-2"></i>
                    Réserver maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsorise;
