import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BookOpen, FileText, Calendar, Clock, AlertCircle, CheckCircle, Eye, X } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

function BorrowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowDuration, setBorrowDuration] = useState(7);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [message, setMessage] = useState(null);

  // Message display helper functions
  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    checkSubscription();
    fetchResource();
  }, [id]);

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:8000/api/subscriptions/status/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setHasSubscription(response.data.is_active);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      setHasSubscription(false);
    }
  };

  const fetchResource = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:8000/api/library/${id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      setResource(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la ressource:', error);
      showMessage('Erreur lors du chargement de la ressource');
    } finally {
      setLoading(false);
    }
  };

  const viewPDF = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Create a modal container
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      modal.style.zIndex = '9999';
      modal.style.display = 'flex';
      modal.style.flexDirection = 'column';
      modal.style.padding = '20px';
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '✕';
      closeButton.style.position = 'absolute';
      closeButton.style.right = '20px';
      closeButton.style.top = '20px';
      closeButton.style.backgroundColor = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '50%';
      closeButton.style.width = '40px';
      closeButton.style.height = '40px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.fontSize = '20px';
      closeButton.onclick = () => document.body.removeChild(modal);
      
      // Create object URL for PDF
      const response = await fetch(`http://localhost:8000/api/library/${id}/pdf/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          showMessage('Un abonnement actif est requis pour accéder aux documents');
          setTimeout(() => navigate('/subscription'), 1500);
          return;
        }
        throw new Error('Failed to load PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create embed element for PDF
      const embed = document.createElement('embed');
      embed.src = url;
      embed.type = 'application/pdf';
      embed.style.width = '100%';
      embed.style.height = '100%';
      embed.style.border = 'none';
      
      // Add elements to modal
      modal.appendChild(closeButton);
      modal.appendChild(embed);
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Cleanup when modal is closed
      closeButton.onclick = () => {
        URL.revokeObjectURL(url);
        document.body.removeChild(modal);
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du PDF:', error);
      showMessage('Erreur lors de l\'ouverture du PDF');
    }
  };

  const handleBorrow = async () => {
    if (!acceptTerms) {
      showMessage('Veuillez accepter les conditions d\'emprunt');
      return;
    }

    setBorrowing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://localhost:8000/api/library/${id}/borrow/`,
        { duration: borrowDuration },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        showMessage('Emprunt effectué avec succès!', 'success');
        // Open PDF viewer
        await viewPDF();
      }
    } catch (error) {
      console.error('Erreur lors de l\'emprunt:', error);
      if (error.response?.status === 403) {
        showMessage('Un abonnement actif est requis pour emprunter');
        setTimeout(() => navigate('/subscription'), 1500);
      } else if (error.response?.status === 400) {
        showMessage(error.response.data.detail || 'Vous avez déjà emprunté cette ressource');
      } else if (error.response?.status === 401) {
        showMessage('Veuillez vous connecter pour emprunter');
        navigate('/login');
      } else {
        showMessage('Une erreur est survenue lors de l\'emprunt');
      }
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80" />
          </div>
          <div className="relative flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80" />
          </div>
          <div className="relative flex items-center justify-center h-full">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Ressource non trouvée</h2>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80" />
        </div>

        <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="relative h-64">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(resource.titre)}&background=random&size=800`}
                  alt={resource.titre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    resource.type === 'book' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {resource.type === 'book' ? 'Livre' : 'Document'}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {resource.titre}
                </h1>
                <div className="flex items-center text-blue-200 mb-4">
                  {resource.type === 'book' ? (
                    <BookOpen className="w-5 h-5 mr-2" />
                  ) : (
                    <FileText className="w-5 h-5 mr-2" />
                  )}
                  <span>{resource.auteur}</span>
                </div>
                <p className="text-white/80 mb-6">
                  {resource.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 className="font-semibold text-white mb-2">Catégorie</h3>
                    <p className="text-blue-200">{resource.categorie}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 className="font-semibold text-white mb-2">Langue</h3>
                    <p className="text-blue-200">{resource.langue === 'fr' ? 'Français' : 'Anglais'}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Durée d'emprunt
                  </h3>
                  <div className="flex space-x-4">
                    {[7, 14, 30].map(days => (
                      <button
                        key={days}
                        onClick={() => setBorrowDuration(days)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          borrowDuration === days
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-white/20 text-white/80 hover:border-white/40'
                        }`}
                      >
                        {days} jours
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-yellow-300 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Conditions d'emprunt
                  </h3>
                  <ul className="text-yellow-200/90 text-sm space-y-2">
                    <li>• Maximum 5 emprunts simultanés autorisés</li>
                    <li>• Durée maximale d'emprunt : 30 jours</li>
                    <li>• Pénalités en cas de retard : accès suspendu</li>
                    <li>• Les documents empruntés sont à usage personnel uniquement</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-white/80">
                      J'accepte les conditions d'emprunt
                    </span>
                  </label>

                  <button
                    onClick={handleBorrow}
                    disabled={!acceptTerms || borrowing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {borrowing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Traitement en cours...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5" />
                        <span>Emprunter et lire ({borrowDuration} jours)</span>
                      </>
                    )}
                  </button>

                  {/* Message display */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`p-4 rounded-lg flex items-center justify-between ${
                          message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-200'
                            : 'bg-red-500/10 border border-red-500/20 text-red-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">
                            {message.type === 'success' ? '✓' : '✕'}
                          </span>
                          <span>{message.text}</span>
                        </div>
                        <button
                          onClick={() => setMessage(null)}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BorrowPage;