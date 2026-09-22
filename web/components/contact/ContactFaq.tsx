'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

const FAQS = [
  {
    question: "Où se situe l'Espace Comédie ?",
    answer:
      "L'Espace Comédie se trouve au 136 rue Solférino, en plein cœur de Lille. La salle se trouve au sous-sol du Jager, l'entrée se fait directement par le Jager. Un parking est à proximité pour se garer facilement.",
  },
  {
    question: 'Faut-il réserver ?',
    answer:
      "Oui, on recommande de réserver en ligne sur notre billetterie sécurisée. Vous recevrez vos billets par e-mail, il suffira de les présenter à l'entrée (version papier ou sur téléphone). Il est parfois possible de payer sur place si des places restent disponibles.",
  },
  {
    question: 'Est-il possible de boire et/ou manger sur place ?',
    answer:
      "Oui ! A l'Espace Comédie vous pouvez profiter de boissons et de planches apéritives pendant, avant ou après les spectacles. Les boissons sont servies et facturées exclusivement par le Jager, titulaire de la licence IV.",
  },
  {
    question: "L'Espace Comédie est-il accessible aux personnes à mobilité réduite (PMR) ?",
    answer:
      "Notre salle se situe au sous-sol, sans ascenseur. L'accès peut donc être difficile pour certaines personnes à mobilité réduite. Nous avons déjà accueilli des spectateurs en fauteuil, aidés par notre équipe pour descendre les escaliers. Si vous êtes concerné, n'hésitez pas à nous contacter en amont afin que nous puissions vous accompagner dans les meilleures conditions possibles.",
  },
];

export default function ContactFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question} className={index < FAQS.length - 1 ? 'border-b border-gray-200 pb-4' : ''}>
            <button
              className="flex w-full items-center justify-between text-left text-lg font-medium"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              {faq.question}
              <ChevronDownIcon className={`text-accent transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <p className="mt-3 text-gray-600">{faq.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
