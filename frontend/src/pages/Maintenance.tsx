import React from 'react';
import Header from '@/components/Header';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header activeItem="" />
      <main className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <div className="text-5xl mb-6">🚧</div>
          <h1 className="text-3xl font-bold mb-3">Site en maintenance</h1>
          <p className="text-gray-400 mb-6 max-w-xl">
            Nous effectuons actuellement une maintenance. Le site sera de retour très bientôt. Merci de votre compréhension.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Maintenance;




