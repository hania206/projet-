import React from "react";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080808] text-[#666666] py-12">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* LOGO & NOM */}
          <div className="flex items-center gap-2 text-white">
            <Leaf size={18} className="text-green-500" />
            <span className="text-md font-semibold tracking-tight">GreenLife</span>
          </div>

          {/* LIENS SIMPLES */}
          <nav className="flex gap-8 text-xs font-medium uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Accueil</a>
            <a href="#" className="hover:text-white transition-colors">Impact</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </nav>

          {/* TECH STACK */}
          <div className="text-[10px] text-[#333333] font-bold uppercase tracking-[0.2em]">
            MERN • IA
          </div>

        </div>

        {/* LIGNE DE COPYRIGHT ÉPURÉE */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em]">
            © 2026 GreenLife — Tous droits réservés
          </p>
        </div>
        
      </div>
    </footer>
  );
}