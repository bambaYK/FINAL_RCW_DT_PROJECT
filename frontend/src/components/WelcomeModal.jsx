import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Pour le développement, on peut forcer la réinitialisation
    localStorage.removeItem('hasSeenWelcomeModal');
    
    const isAuthenticated = localStorage.getItem('accessToken');
    const hasSeenModal = localStorage.getItem('hasSeenWelcomeModal');

    // Si l'utilisateur n'est pas connecté et n'a pas vu le modal
    if (!isAuthenticated && !hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []); // Exécuté une seule fois au montage

  const handleClose = (action) => {
    setIsOpen(false);

    switch (action) {
      case 'login':
        localStorage.setItem('hasSeenWelcomeModal', 'true');
        setTimeout(() => {
          navigate('/login');
        }, 300);
        break;
      case 'signup':
        localStorage.setItem('hasSeenWelcomeModal', 'true');
        setTimeout(() => {
          navigate('/register');
        }, 300);
        break;
      case 'later':
      default:
        // Ne pas sauvegarder dans le localStorage pour que le modal réapparaisse
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => handleClose('later')}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Image de fond */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80" />
            </div>

            {/* Bouton de fermeture */}
            <button
              onClick={() => handleClose('later')}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative p-8 md:p-12 text-white z-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Contenu gauche */}
                <div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif mb-4 text-center md:text-left">
                    Bienvenue dans votre<br />Bibliothèque Numérique
                  </h2>
                  <p className="text-white/80 mb-6 text-center md:text-left">
                    Rejoignez notre communauté de lecteurs passionnés et découvrez une expérience de lecture unique.
                  </p>
                </div>

                {/* Contenu droit */}
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Bibliothèque Personnalisée</h3>
                        <p className="text-white/70 text-sm">Créez votre collection unique de livres</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Recommandations Sur Mesure</h3>
                        <p className="text-white/70 text-sm">Des suggestions adaptées à vos goûts</p>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleClose('login')}
                      className="w-full btn-primary py-3 bg-blue-500 hover:bg-blue-600"
                    >
                      Se Connecter
                    </button>
                    <button
                      onClick={() => handleClose('signup')}
                      className="w-full border-2 border-white/20 hover:border-white/40 text-white py-3 rounded-lg transition-all duration-300 hover:bg-white/10"
                    >
                      S'inscrire
                    </button>
                    <button
                      onClick={() => handleClose('later')}
                      className="w-full text-white/70 hover:text-white py-2 transition-colors text-sm"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WelcomeModal;