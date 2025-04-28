import React from 'react';
import { motion } from 'framer-motion';

function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=2000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent"></div>
      </motion.div>

      <div className="relative flex items-center justify-center min-h-screen">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight tracking-tight"
          >
            DÉCOUVREZ UN<br />
            MONDE DE<br />
            LIVRES NUMÉRIQUES!
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <a
              href="#explorer"
              className="btn-primary"
            >
              EXPLOREZ VOTRE BIBLIOTHÈQUE!
            </a>
            <a
              href="#contact"
              className="btn-outline-white"
            >
              COMMENCER MAINTENANT
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </div>
  );
}

export default Hero;