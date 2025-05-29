export interface Spectacle {
  id: number;
  title: string;
  img: string;
  description: string;
  date: string;
  lieu: string;
  artiste_id: number;
}

export const spectacles: Spectacle[] = [
  {
    id: 1,
    title: "Le Rire en Scène",
    img: "/images/spectacles/rire-en-scene.jpg",
    description: "Un spectacle hilarant qui explore les différentes facettes de l'humour contemporain. Nos artistes vous emmènent dans un voyage comique inoubliable.",
    date: "2024-04-15T20:00:00",
    lieu: "L'espace comédie",
    artiste_id: 1
  },
  {
    id: 2,
    title: "Comédie à la Française",
    img: "/images/spectacles/comedie-francaise.jpg",
    description: "Une soirée de stand-up à la française, où l'humour subtil et l'esprit caustique se rencontrent pour créer des moments de pur bonheur.",
    date: "2024-04-20T20:30:00",
    lieu: "L'espace comédie",
    artiste_id: 2
  },
  {
    id: 3,
    title: "Les Improvisateurs",
    img: "/images/spectacles/improvisateurs.jpg",
    description: "Un spectacle d'improvisation unique où nos comédiens créent des scènes hilarantes sur le moment, guidés par vos suggestions.",
    date: "2024-04-25T21:00:00",
    lieu: "L'espace comédie",
    artiste_id: 3
  },
  {
    id: 4,
    title: "Soirée One-Man Show",
    img: "/images/spectacles/one-man-show.jpg",
    description: "Un one-man-show exceptionnel qui vous fera rire aux éclats avec des anecdotes de la vie quotidienne revisitées avec humour et finesse.",
    date: "2024-05-01T20:00:00",
    lieu: "L'espace comédie",
    artiste_id: 4
  }
]; 