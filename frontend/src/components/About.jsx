import React from 'react';
import { motion } from 'framer-motion';

function About() {
  return (
    <div className="py-24 bg-white" id="a-propos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 transform rotate-3 rounded-2xl transition-transform duration-300 group-hover:rotate-6"></div>
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800"
              alt="Réunion d'équipe"
              className="relative rounded-2xl shadow-2xl transform -rotate-3 transition-all duration-300 group-hover:rotate-0 group-hover:scale-105"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-blue-600 font-semibold">À PROPOS DE NOUS</span>
            <h2 className="text-4xl font-serif leading-tight">
              NOTRE MISSION ET<br />NOTRE PASSION
            </h2>
            <div className="w-20 h-1 bg-blue-600"></div>
            <p className="text-gray-600 leading-relaxed">
              Chez Bibliothèque Numérique, nous croyons en l'accessibilité de la lecture pour tous. 
              Chaque membre est dévoué à créer une expérience exceptionnelle pour nos utilisateurs. 
              Avec des compétences diverses et une passion pour les livres, nous collaborons pour 
              rendre votre voyage littéraire numérique extraordinaire.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Innovation Continue</h3>
                  <p className="text-gray-600">Toujours à la pointe de la technologie</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Qualité Garantie</h3>
                  <p className="text-gray-600">Des contenus soigneusement sélectionnés</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <a href="#contact" className="btn-primary">
                REJOIGNEZ L'AVENTURE!
              </a>
              <a href="tel:1-800-555-LIVRES" className="btn-secondary">
                BESOIN D'AIDE? APPELEZ-NOUS
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default About;