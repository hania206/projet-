import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto p-10 grid md:grid-cols-3 gap-8">

        <div>
          <h2 className="text-green-400 text-2xl font-bold">GreenLife</h2>
          <p>Solution intelligente pour une maison écologique.</p>
        </div>

        <div>
          <h3 className="font-bold mb-3">Liens</h3>
          <ul>
            <li>Accueil</li>
            <li>Fonctionnalités</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Contact</h3>
          <p>contact@greenlife.com</p>
        </div>

      </div>

      <div className="text-center py-4 border-t border-gray-700">
        © 2026 GreenLife
      </div>
    </footer>
  );
}