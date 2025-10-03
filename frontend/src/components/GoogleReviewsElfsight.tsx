import { useEffect } from 'react';

const GoogleReviewsElfsight = ({ appId }: { appId: string }) => {
  useEffect(() => {
    // Forcer la langue du widget Elfsight en français
    (window as any).eappsLanguage = 'fr';

    const existing = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://elfsightcdn.com/platform.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // Cacher uniquement le texte de branding "Free Google Reviews widget" sans impacter le reste
  useEffect(() => {
    const root = document.getElementById('google-reviews');
    if (!root) return;

    const hideBranding = () => {
      const container = root.querySelector(`[class^="elfsight-app-"]`);
      if (!container) return;
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const toHide: HTMLElement[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = (node.nodeValue || '').trim().toLowerCase();
        if (
          text.includes('free google reviews widget') ||
          text.includes('what our customers say')
        ) {
          const el = node.parentElement as HTMLElement | null;
          if (el) toHide.push(el);
        }
      }
      toHide.forEach((el) => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        el.style.opacity = '0';
      });
    };

    // Premier passage + observer pour changements dynamiques
    hideBranding();
    const observer = new MutationObserver(hideBranding);
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [appId]);

  return (
    <section id="google-reviews" className="bg-gray-950 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8">Avis Google</h2>
        {/* Conteneur du widget */}
        <div className={`elfsight-app-${appId}`} data-elfsight-app-lazy></div>
        {/* Masque uniquement les contrôles/CTA d'overlay qui réapparaissent au hover */}
        <style>{`
          #google-reviews [class^="elfsight-app-"] .eapps-widget-toolbar,
          #google-reviews [class^="elfsight-app-"] .eapps-review__cta {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
          }
        `}</style>
      </div>
    </section>
  );
};

export default GoogleReviewsElfsight;


