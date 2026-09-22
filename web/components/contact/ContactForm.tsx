'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!privacyAccepted) return;

    const form = event.currentTarget;
    const data = {
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value,
      lastName: (form.elements.namedItem('lastName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Une erreur est survenue');
      }
      setStatus('success');
      form.reset();
      setPrivacyAccepted(false);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">
          Sujet
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="spectacle">Spectacle</option>
          <option value="partenariat">Partenariat</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="flex items-start">
        <input
          id="privacy"
          type="checkbox"
          required
          checked={privacyAccepted}
          onChange={(e) => setPrivacyAccepted(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
          <span className="mr-1 text-accent">*</span>
          J&apos;accepte que mes données soient traitées conformément à la politique de confidentialité.
        </label>
      </div>

      {status === 'success' && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Message envoyé ! Merci, nous reviendrons vers vous rapidement.
        </p>
      )}
      {status === 'error' && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

      <div className="text-right">
        <button
          type="submit"
          disabled={!privacyAccepted || status === 'sending'}
          className={`rounded-md px-8 py-3 font-medium transition duration-300 ${
            privacyAccepted && status !== 'sending'
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
        >
          {status === 'sending' ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
}
