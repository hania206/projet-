// src/components/Header.j
import React from "react";
import { Link } from "react-router-dom";



  export default function Header() {
  return (

    <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-md fixed w-full z-50">
      <h1 className="text-2xl font-bold text-green-600">
        GreenLife
      </h1>

      <div className="space-x-8 hidden md:flex">
        <a href="#features" className="hover:text-green-600">
          Fonctionnalités
        </a>
        <a href="#impact" className="hover:text-green-600">
          Impact
        </a>
        <Link to="/login" className="hover:text-green-600">
          Connexion
        </Link>
      </div>

      <Link
        to="/register"
        className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
      >
        S'inscrire
      </Link>
    </nav>
  );
};




























