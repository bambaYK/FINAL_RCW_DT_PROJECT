import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, Loader2, Book, Clock, ChevronRight, BookOpen, History, Eye, CreditCard } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../Footer';

function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('borrowed');
  const [originalUsername, setOriginalUsername] = useState(localStorage.getItem('username') || '');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  
  const [userInfo, setUserInfo] = useState({
    username: localStorage.getItem('username') || '',
    email: localStorage.getItem('email') || '',
    first_name: localStorage.getItem('first_name') || '',
    last_name: localStorage.getItem('last_name') || ''
  });

  const [passwordInfo, setPasswordInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchBorrowedBooks(),
          fetchBorrowHistory(),
          fetchSubscription()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchSubscription = async () => {
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
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:8000/api/users/${originalUsername}/`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data) {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:8000/api/library/borrowed/',
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Borrowed books response:', response.data);
      
      const books = response.data?.results || response.data || [];
      setBorrowedBooks(Array.isArray(books) ? books : []);
    } catch (error) {
      console.error('Erreur lors du chargement des emprunts:', error);
      toast.error('Erreur lors du chargement des emprunts');
      setBorrowedBooks([]);
    }
  };

  const fetchBorrowHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:8000/api/library/full-history/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log("📘 Historique combiné récupéré:", response.data);
  
      const emprunts = response.data?.emprunts || [];
      const abonnements = response.data?.subscriptions || [];
  
      setBorrowHistory(Array.isArray(emprunts) ? emprunts : []);
      setSubscriptionHistory(Array.isArray(abonnements) ? abonnements : []);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique combiné:", error);
      toast.error("Erreur lors du chargement de l'historique", { duration: 5000 });
      setBorrowHistory([]);
      setSubscriptionHistory([]);
    }
  };
  

  const returnBook = async (borrowId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `http://localhost:8000/api/library/return/${borrowId}/`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      toast.success('Livre retourné avec succès');
      await Promise.all([
        fetchBorrowedBooks(),
        fetchBorrowHistory()
      ]);
    } catch (error) {
      console.error('Erreur lors du retour du livre:', error);
      toast.error('Erreur lors du retour du livre');
    }
  };

  const viewPDF = async (resourceId) => {
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
      const response = await fetch(`http://localhost:8000/api/library/${resourceId}/pdf/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
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
      toast.error('Erreur lors de l\'ouverture du PDF');
    }
  };

  const updateProfile = async () => {
    if (!userInfo.username.trim()) {
      toast.error('Le nom d\'utilisateur est requis');
      return;
    }

    if (!userInfo.email.trim()) {
      toast.error('L\'email est requis');
      return;
    }

    if (!userInfo.first_name.trim() || !userInfo.last_name.trim()) {
      toast.error('Le prénom et le nom sont requis');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      const response = await axios.patch(
        `http://localhost:8000/api/users/${originalUsername}/`,
        userInfo,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('first_name', response.data.first_name);
        localStorage.setItem('last_name', response.data.last_name);
        setOriginalUsername(response.data.username);
        
        toast.success('Profil mis à jour avec succès!');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        const errors = error.response.data;
        if (errors.username) {
          toast.error('Ce nom d\'utilisateur est déjà pris');
        } else if (errors.email) {
          toast.error('Cette adresse email est déjà utilisée');
        } else {
          toast.error('Erreur lors de la mise à jour du profil');
        }
      } else {
        toast.error('Erreur lors de la mise à jour du profil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!passwordInfo.oldPassword.trim()) {
      toast.error('L\'ancien mot de passe est requis');
      return;
    }

    if (!passwordInfo.newPassword.trim()) {
      toast.error('Le nouveau mot de passe est requis');
      return;
    }

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/users/${originalUsername}/change-password/`,
        {
          old_password: passwordInfo.oldPassword,
          new_password: passwordInfo.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setPasswordInfo({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Mot de passe mis à jour avec succès!');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        if (error.response.data.old_password) {
          toast.error('Ancien mot de passe incorrect');
        } else if (error.response.data.new_password) {
          toast.error('Le nouveau mot de passe est invalide');
        } else {
          toast.error('Erreur lors de la mise à jour du mot de passe');
        }
      } else {
        toast.error('Erreur lors de la mise à jour du mot de passe');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderBorrowedBooks = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white mb-6">Livres Empruntés</h3>
        {!borrowedBooks || borrowedBooks.length === 0 ? (
          <p className="text-blue-200">Aucun livre emprunté actuellement</p>
        ) : (
          <div className="grid gap-4">
            {borrowedBooks.map((borrow) => {
              console.log('Borrow item:', borrow);
              
              return (
                <div key={borrow.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {borrow.resource?.titre || 'Titre non disponible'}
                        </h4>
                        <p className="text-blue-200 text-sm">
                          {borrow.resource?.auteur || 'Auteur non disponible'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-blue-200 text-sm">À retourner le</p>
                        <p className="text-white">
                          {borrow.date_retour ? new Date(borrow.date_retour).toLocaleDateString() : 'Date non disponible'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewPDF(borrow.resource.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Lire</span>
                        </button>
                        <button
                          onClick={() => returnBook(borrow.id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Retourner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderBorrowHistory = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }
  
    return (
      <div className="space-y-10">
        {/* Historique des emprunts */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Historique des Emprunts</h3>
          {borrowHistory.length === 0 ? (
            <p className="text-blue-200">Aucun historique d'emprunt</p>
          ) : (
            <div className="grid gap-4">
              {borrowHistory.map((borrow) => (
                <div key={borrow.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <History className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{borrow.resource.titre}</h4>
                        <p className="text-blue-200 text-sm">{borrow.resource.auteur}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-200 text-sm">Emprunté le</p>
                      <p className="text-white">{new Date(borrow.date_emprunt).toLocaleDateString()}</p>
                      <p className="text-blue-200 text-sm">Retourné le</p>
                      <p className="text-white">{new Date(borrow.date_retour).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* Historique des abonnements */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Historique des Abonnements</h3>
          {subscriptionHistory.length === 0 ? (
            <p className="text-blue-200">Aucun abonnement précédent</p>
          ) : (
            <div className="grid gap-4">
              {subscriptionHistory.map((sub) => (
                <div key={sub.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">
                        {sub.type === '15_days'
                          ? '15 Jours'
                          : sub.type === '1_month'
                          ? '1 Mois'
                          : '1 An'}
                      </h4>
                      <p className="text-blue-200 text-sm">{sub.price}€</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-200 text-sm">Du</p>
                      <p className="text-white">{new Date(sub.start_date).toLocaleDateString()}</p>
                      <p className="text-blue-200 text-sm">Au</p>
                      <p className="text-white">{new Date(sub.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-blue-300">
                      Statut : {sub.status === 'cancelled' ? 'Annulé' : sub.status === 'active' ? 'Actif' : 'Expiré'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderSubscription = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }

    if (!subscription) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun abonnement actif</h3>
          <p className="text-blue-200 mb-6">
            Souscrivez à un abonnement pour accéder à notre bibliothèque numérique
          </p>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voir les abonnements
          </button>
        </div>
      );
    }

    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const totalDays = Math.ceil((endDate - new Date(subscription.start_date)) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    const progress = ((totalDays - remainingDays) / totalDays) * 100;

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white mb-6">Mon Abonnement</h3>
        <div className="bg-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-medium text-white">
                {subscription.type === '15_days' ? '15 Jours' :
                 subscription.type === '1_month' ? '1 Mois' :
                 subscription.type === '1_year' ? '1 An' : 'Abonnement'}
              </h4>
              <p className="text-blue-200">{subscription.price}€</p>
            </div>
            <div className="bg-green-500/20 px-4 py-2 rounded-full">
              <span className="text-green-400 font-medium">Actif</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-blue-200 mb-2">
                <span>Progression</span>
                <span>{remainingDays} jours restants</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-200">Date de début</p>
                <p className="text-white">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-blue-200">Date de fin</p>
                <p className="text-white">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right pt-6">
            <button
              onClick={cancelSubscription}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Annuler l'abonnement
            </button>
          </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  const cancelSubscription = async () => {
    const confirmCancel = window.confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?");
    if (!confirmCancel) return;
  
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/subscriptions/cancel/', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success("Abonnement annulé avec succès !");
      setSubscription(null); // Supprime l'affichage de l’abonnement
    } catch (error) {
      console.error('Erreur lors de l’annulation:', error);
      toast.error("Échec de l'annulation de l’abonnement.");
    }
  };
  

  const tabs = [
    {
      id: 'profile',
      label: 'Profil',
      icon: UserCircle,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={userInfo.first_name}
                onChange={(e) => setUserInfo({ ...userInfo, first_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre prénom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={userInfo.last_name}
                onChange={(e) => setUserInfo({ ...userInfo, last_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre nom"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={userInfo.username}
              onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez votre email"
              required
            />
          </div>

          <div className="pt-4">
            <button
              onClick={updateProfile}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mise à jour en cours...</span>
                </>
              ) : (
                <span>Mettre à jour le profil</span>
              )}
            </button>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Changer le mot de passe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Ancien mot de passe
                </label>
                <input
                  type="password"
                  value={passwordInfo.oldPassword}
                  onChange={(e) => setPasswordInfo({ ...passwordInfo, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordInfo.newPassword}
                  onChange={(e) => setPasswordInfo({ ...passwordInfo, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordInfo.confirmPassword}
                  onChange={(e) => setPasswordInfo({ ...passwordInfo, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                onClick={updatePassword}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mise à jour en cours...</span>
                  </>
                ) : (
                  <span>Changer le mot de passe</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'borrowed',
      label: 'Emprunts',
      icon: Book,
      content: renderBorrowedBooks()
    },
    {
      id: 'history',
      label: 'Historique',
      icon: Clock,
      content: renderBorrowHistory()
    },
    {
      id: 'subscription',
      label: 'Abonnement',
      icon: CreditCard,
      content: renderSubscription()
    }
  ];

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
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {userInfo.first_name?.[0]}{userInfo.last_name?.[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Mon Profil</h2>
                    <p className="text-blue-200">Gérez vos informations personnelles</p>
                  </div>
                </div>

                <div className="border-b border-white/10"> 
                  <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 pb-4 transition-colors relative ${
                          activeTab === tab.id
                            ? 'text-white'
                            : 'text-blue-200 hover:text-white'
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                          />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="pt-8">
                  {tabs.find(tab => tab.id === activeTab)?.content}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default Profile;






// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { UserCircle, Loader2, Book, Clock, ChevronRight, BookOpen, History, Eye, CreditCard } from 'lucide-react';
// import { toast, Toaster } from 'react-hot-toast';
// import axios from 'axios';
// import Navbar from '../Navbar';
// import Footer from '../Footer';

// function Profile() {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('borrowed');
//   const [originalUsername, setOriginalUsername] = useState(localStorage.getItem('username') || '');
//   const [borrowedBooks, setBorrowedBooks] = useState([]);
//   const [borrowHistory, setBorrowHistory] = useState([]);
//   const [subscription, setSubscription] = useState(null);
//   const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  
//   const [userInfo, setUserInfo] = useState({
//     username: localStorage.getItem('username') || '',
//     email: localStorage.getItem('email') || '',
//     first_name: localStorage.getItem('first_name') || '',
//     last_name: localStorage.getItem('last_name') || ''
//   });

//   const [passwordInfo, setPasswordInfo] = useState({
//     oldPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (!token) {
//       navigate('/login');
//       return;
//     }

//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         await Promise.all([
//           fetchUserData(),
//           fetchBorrowedBooks(),
//           fetchBorrowHistory(),
//           fetchSubscription()
//         ]);
//       } catch (error) {
//         console.error('Error loading data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const fetchSubscription = async () => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       const response = await axios.get(
//         'http://localhost:8000/api/subscriptions/status/',
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       setSubscription(response.data.subscription);
//     } catch (error) {
//       console.error('Error fetching subscription:', error);
//       setSubscription(null);
//     }
//   };

//   const fetchUserData = async () => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       const response = await axios.get(
//         `http://localhost:8000/api/users/${originalUsername}/`,
//         {
//           headers: { 'Authorization': `Bearer ${token}` }
//         }
//       );

//       if (response.data) {
//         setUserInfo(response.data);
//         localStorage.setItem('is_2fa_enabled', response.data.is_2fa_enabled);

//       }
//     } catch (error) {
//       console.error('Erreur lors du chargement des données:', error);
//       if (error.response?.status === 401) {
//         navigate('/login');
//       } else {
//         toast.error('Erreur lors du chargement des données');
//       }
//     }
//   };

//   const fetchBorrowedBooks = async () => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       const response = await axios.get(
//         'http://localhost:8000/api/library/borrowed/',
//         {
//           headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       console.log('Borrowed books response:', response.data);
      
//       const books = response.data?.results || response.data || [];
//       setBorrowedBooks(Array.isArray(books) ? books : []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des emprunts:', error);
//       toast.error('Erreur lors du chargement des emprunts');
//       setBorrowedBooks([]);
//     }
//   };

//   const fetchBorrowHistory = async () => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       const response = await axios.get(
//         'http://localhost:8000/api/library/full-history/',
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
  
//       console.log("📘 Historique combiné récupéré:", response.data);
  
//       const emprunts = response.data?.emprunts || [];
//       const abonnements = response.data?.subscriptions || [];
  
//       setBorrowHistory(Array.isArray(emprunts) ? emprunts : []);
//       setSubscriptionHistory(Array.isArray(abonnements) ? abonnements : []);
//     } catch (error) {
//       console.error("Erreur lors du chargement de l'historique combiné:", error);
//       toast.error("Erreur lors du chargement de l'historique", { duration: 5000 });
//       setBorrowHistory([]);
//       setSubscriptionHistory([]);
//     }
//   };
  

//   const returnBook = async (borrowId) => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       await axios.post(
//         `http://localhost:8000/api/library/return/${borrowId}/`,
//         {},
//         {
//           headers: { 'Authorization': `Bearer ${token}` }
//         }
//       );
      
//       toast.success('Livre retourné avec succès');
//       await Promise.all([
//         fetchBorrowedBooks(),
//         fetchBorrowHistory()
//       ]);
//     } catch (error) {
//       console.error('Erreur lors du retour du livre:', error);
//       toast.error('Erreur lors du retour du livre');
//     }
//   };

//   const viewPDF = async (resourceId) => {
//     try {
//       const token = localStorage.getItem('accessToken');
      
//       // Create a modal container
//       const modal = document.createElement('div');
//       modal.style.position = 'fixed';
//       modal.style.top = '0';
//       modal.style.left = '0';
//       modal.style.width = '100%';
//       modal.style.height = '100%';
//       modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
//       modal.style.zIndex = '9999';
//       modal.style.display = 'flex';
//       modal.style.flexDirection = 'column';
//       modal.style.padding = '20px';
      
//       // Add close button
//       const closeButton = document.createElement('button');
//       closeButton.innerHTML = '✕';
//       closeButton.style.position = 'absolute';
//       closeButton.style.right = '20px';
//       closeButton.style.top = '20px';
//       closeButton.style.backgroundColor = 'white';
//       closeButton.style.border = 'none';
//       closeButton.style.borderRadius = '50%';
//       closeButton.style.width = '40px';
//       closeButton.style.height = '40px';
//       closeButton.style.cursor = 'pointer';
//       closeButton.style.fontSize = '20px';
//       closeButton.onclick = () => document.body.removeChild(modal);
      
//       // Create object URL for PDF
//       const response = await fetch(`http://localhost:8000/api/library/${resourceId}/pdf/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to load PDF');
//       }
      
//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
      
//       // Create embed element for PDF
//       const embed = document.createElement('embed');
//       embed.src = url;
//       embed.type = 'application/pdf';
//       embed.style.width = '100%';
//       embed.style.height = '100%';
//       embed.style.border = 'none';
      
//       // Add elements to modal
//       modal.appendChild(closeButton);
//       modal.appendChild(embed);
      
//       // Add modal to body
//       document.body.appendChild(modal);
      
//       // Cleanup when modal is closed
//       closeButton.onclick = () => {
//         URL.revokeObjectURL(url);
//         document.body.removeChild(modal);
//       };
      
//     } catch (error) {
//       console.error('Erreur lors de l\'ouverture du PDF:', error);
//       toast.error('Erreur lors de l\'ouverture du PDF');
//     }
//   };

//   const updateProfile = async () => {
//     if (!userInfo.username.trim()) {
//       toast.error('Le nom d\'utilisateur est requis');
//       return;
//     }

//     if (!userInfo.email.trim()) {
//       toast.error('L\'email est requis');
//       return;
//     }

//     if (!userInfo.first_name.trim() || !userInfo.last_name.trim()) {
//       toast.error('Le prénom et le nom sont requis');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         toast.error('Session expirée. Veuillez vous reconnecter.');
//         navigate('/login');
//         return;
//       }

//       const response = await axios.patch(
//         `http://localhost:8000/api/users/${originalUsername}/`,
//         userInfo,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data) {
//         localStorage.setItem('username', response.data.username);
//         localStorage.setItem('email', response.data.email);
//         localStorage.setItem('first_name', response.data.first_name);
//         localStorage.setItem('last_name', response.data.last_name);
//         setOriginalUsername(response.data.username);
        
//         toast.success('Profil mis à jour avec succès!');
//       }
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour du profil:', error);
//       if (error.response?.status === 401) {
//         toast.error('Session expirée. Veuillez vous reconnecter.');
//         navigate('/login');
//       } else if (error.response?.status === 400) {
//         const errors = error.response.data;
//         if (errors.username) {
//           toast.error('Ce nom d\'utilisateur est déjà pris');
//         } else if (errors.email) {
//           toast.error('Cette adresse email est déjà utilisée');
//         } else {
//           toast.error('Erreur lors de la mise à jour du profil');
//         }
//       } else {
//         toast.error('Erreur lors de la mise à jour du profil');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updatePassword = async () => {
//     if (!passwordInfo.oldPassword.trim()) {
//       toast.error('L\'ancien mot de passe est requis');
//       return;
//     }

//     if (!passwordInfo.newPassword.trim()) {
//       toast.error('Le nouveau mot de passe est requis');
//       return;
//     }

//     if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
//       toast.error('Les mots de passe ne correspondent pas');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem('accessToken');
      
//       if (!token) {
//         toast.error('Session expirée. Veuillez vous reconnecter.');
//         navigate('/login');
//         return;
//       }

//       const response = await axios.post(
//         `http://localhost:8000/api/users/${originalUsername}/change-password/`,
//         {
//           old_password: passwordInfo.oldPassword,
//           new_password: passwordInfo.newPassword
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data) {
//         setPasswordInfo({
//           oldPassword: '',
//           newPassword: '',
//           confirmPassword: ''
//         });
//         toast.success('Mot de passe mis à jour avec succès!');
//       }
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour du mot de passe:', error);
//       if (error.response?.status === 401) {
//         toast.error('Session expirée. Veuillez vous reconnecter.');
//         navigate('/login');
//       } else if (error.response?.status === 400) {
//         if (error.response.data.old_password) {
//           toast.error('Ancien mot de passe incorrect');
//         } else if (error.response.data.new_password) {
//           toast.error('Le nouveau mot de passe est invalide');
//         } else {
//           toast.error('Erreur lors de la mise à jour du mot de passe');
//         }
//       } else {
//         toast.error('Erreur lors de la mise à jour du mot de passe');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderBorrowedBooks = () => {
//     if (isLoading) {
//       return (
//         <div className="flex items-center justify-center py-8">
//           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-6">
//         <h3 className="text-xl font-bold text-white mb-6">Livres Empruntés</h3>
//         {!borrowedBooks || borrowedBooks.length === 0 ? (
//           <p className="text-blue-200">Aucun livre emprunté actuellement</p>
//         ) : (
//           <div className="grid gap-4">
//             {borrowedBooks.map((borrow) => {
//               console.log('Borrow item:', borrow);
              
//               return (
//                 <div key={borrow.id} className="bg-white/10 rounded-lg p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
//                         <BookOpen className="w-6 h-6 text-blue-400" />
//                       </div>
//                       <div>
//                         <h4 className="text-white font-medium">
//                           {borrow.resource?.titre || 'Titre non disponible'}
//                         </h4>
//                         <p className="text-blue-200 text-sm">
//                           {borrow.resource?.auteur || 'Auteur non disponible'}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <div className="text-right">
//                         <p className="text-blue-200 text-sm">À retourner le</p>
//                         <p className="text-white">
//                           {borrow.date_retour ? new Date(borrow.date_retour).toLocaleDateString() : 'Date non disponible'}
//                         </p>
//                       </div>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => viewPDF(borrow.resource.id)}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
//                         >
//                           <Eye className="w-4 h-4" />
//                           <span>Lire</span>
//                         </button>
//                         <button
//                           onClick={() => returnBook(borrow.id)}
//                           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                         >
//                           Retourner
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderBorrowHistory = () => {
//     if (isLoading) {
//       return (
//         <div className="flex items-center justify-center py-8">
//           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//         </div>
//       );
//     }
  
//     return (
//       <div className="space-y-10">
//         {/* Historique des emprunts */}
//         <div>
//           <h3 className="text-xl font-bold text-white mb-4">Historique des Emprunts</h3>
//           {borrowHistory.length === 0 ? (
//             <p className="text-blue-200">Aucun historique d'emprunt</p>
//           ) : (
//             <div className="grid gap-4">
//               {borrowHistory.map((borrow) => (
//                 <div key={borrow.id} className="bg-white/10 rounded-lg p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
//                         <History className="w-6 h-6 text-blue-400" />
//                       </div>
//                       <div>
//                         <h4 className="text-white font-medium">{borrow.resource.titre}</h4>
//                         <p className="text-blue-200 text-sm">{borrow.resource.auteur}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-blue-200 text-sm">Emprunté le</p>
//                       <p className="text-white">{new Date(borrow.date_emprunt).toLocaleDateString()}</p>
//                       <p className="text-blue-200 text-sm">Retourné le</p>
//                       <p className="text-white">{new Date(borrow.date_retour).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
  
//         {/* Historique des abonnements */}
//         <div>
//           <h3 className="text-xl font-bold text-white mb-4">Historique des Abonnements</h3>
//           {subscriptionHistory.length === 0 ? (
//             <p className="text-blue-200">Aucun abonnement précédent</p>
//           ) : (
//             <div className="grid gap-4">
//               {subscriptionHistory.map((sub) => (
//                 <div key={sub.id} className="bg-white/10 rounded-lg p-4">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <h4 className="text-white font-medium">
//                         {sub.type === '15_days'
//                           ? '15 Jours'
//                           : sub.type === '1_month'
//                           ? '1 Mois'
//                           : '1 An'}
//                       </h4>
//                       <p className="text-blue-200 text-sm">{sub.price}€</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-blue-200 text-sm">Du</p>
//                       <p className="text-white">{new Date(sub.start_date).toLocaleDateString()}</p>
//                       <p className="text-blue-200 text-sm">Au</p>
//                       <p className="text-white">{new Date(sub.end_date).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                   <div className="mt-2">
//                     <span className="text-sm text-blue-300">
//                       Statut : {sub.status === 'cancelled' ? 'Annulé' : sub.status === 'active' ? 'Actif' : 'Expiré'}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };
  
//   const renderSubscription = () => {
//     if (isLoading) {
//       return (
//         <div className="flex items-center justify-center py-8">
//           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//         </div>
//       );
//     }

//     if (!subscription) {
//       return (
//         <div className="text-center py-8">
//           <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CreditCard className="w-8 h-8 text-blue-400" />
//           </div>
//           <h3 className="text-xl font-bold text-white mb-2">Aucun abonnement actif</h3>
//           <p className="text-blue-200 mb-6">
//             Souscrivez à un abonnement pour accéder à notre bibliothèque numérique
//           </p>
//           <button
//             onClick={() => navigate('/subscription')}
//             className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Voir les abonnements
//           </button>
//         </div>
//       );
//     }

//     const now = new Date();
//     const endDate = new Date(subscription.end_date);
//     const totalDays = Math.ceil((endDate - new Date(subscription.start_date)) / (1000 * 60 * 60 * 24));
//     const remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
//     const progress = ((totalDays - remainingDays) / totalDays) * 100;

//     return (
//       <div className="space-y-6">
//         <h3 className="text-xl font-bold text-white mb-6">Mon Abonnement</h3>
//         <div className="bg-white/10 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h4 className="text-lg font-medium text-white">
//                 {subscription.type === '15_days' ? '15 Jours' :
//                  subscription.type === '1_month' ? '1 Mois' :
//                  subscription.type === '1_year' ? '1 An' : 'Abonnement'}
//               </h4>
//               <p className="text-blue-200">{subscription.price}€</p>
//             </div>
//             <div className="bg-green-500/20 px-4 py-2 rounded-full">
//               <span className="text-green-400 font-medium">Actif</span>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-sm text-blue-200 mb-2">
//                 <span>Progression</span>
//                 <span>{remainingDays} jours restants</span>
//               </div>
//               <div className="h-2 bg-white/5 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-blue-500 rounded-full transition-all duration-300"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <p className="text-blue-200">Date de début</p>
//                 <p className="text-white">
//                   {new Date(subscription.start_date).toLocaleDateString()}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-blue-200">Date de fin</p>
//                 <p className="text-white">
//                   {new Date(subscription.end_date).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="text-right pt-6">
//             <button
//               onClick={cancelSubscription}
//               className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
//             >
//               Annuler l'abonnement
//             </button>
//           </div>

//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const cancelSubscription = async () => {
//     const confirmCancel = window.confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?");
//     if (!confirmCancel) return;
  
//     try {
//       const token = localStorage.getItem('accessToken');
//       await axios.post('http://localhost:8000/api/subscriptions/cancel/', {}, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       toast.success("Abonnement annulé avec succès !");
//       setSubscription(null); // Supprime l'affichage de l’abonnement
//     } catch (error) {
//       console.error('Erreur lors de l’annulation:', error);
//       toast.error("Échec de l'annulation de l’abonnement.");
//     }
//   };
  

//   const tabs = [
//     {
//       id: 'profile',
//       label: 'Profil',
//       icon: UserCircle,
//       content: (
//         <div className="space-y-6">
//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-blue-200 mb-2">
//                 Prénom
//               </label>
//               <input
//                 type="text"
//                 value={userInfo.first_name}
//                 onChange={(e) => setUserInfo({ ...userInfo, first_name: e.target.value })}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Entrez votre prénom"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-blue-200 mb-2">
//                 Nom
//               </label>
//               <input
//                 type="text"
//                 value={userInfo.last_name}
//                 onChange={(e) => setUserInfo({ ...userInfo, last_name: e.target.value })}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Entrez votre nom"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-blue-200 mb-2">
//               Nom d'utilisateur
//             </label>
//             <input
//               type="text"
//               value={userInfo.username}
//               onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Entrez votre nom d'utilisateur"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-blue-200 mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               value={userInfo.email}
//               onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Entrez votre email"
//               required
//             />
//           </div>

//           <div className="pt-4">
//             <button
//               onClick={updateProfile}
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   <span>Mise à jour en cours...</span>
//                 </>
//               ) : (
//                 <span>Mettre à jour le profil</span>
//               )}
//             </button>
//           </div>

//           <div className="border-t border-white/10 pt-6">
//             <h3 className="text-lg font-medium text-white mb-4">Changer le mot de passe</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-blue-200 mb-2">
//                   Ancien mot de passe
//                 </label>
//                 <input
//                   type="password"
//                   value={passwordInfo.oldPassword}
//                   onChange={(e) => setPasswordInfo({ ...passwordInfo, oldPassword: e.target.value })}
//                   className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-blue-200 mb-2">
//                   Nouveau mot de passe
//                 </label>
//                 <input
//                   type="password"
//                   value={passwordInfo.newPassword}
//                   onChange={(e) => setPasswordInfo({ ...passwordInfo, newPassword: e.target.value })}
//                   className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-blue-200 mb-2">
//                   Confirmer le nouveau mot de passe
//                 </label>
//                 <input
//                   type="password"
//                   value={passwordInfo.confirmPassword}
//                   onChange={(e) => setPasswordInfo({ ...passwordInfo, confirmPassword: e.target.value })}
//                   className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//               <button
//                 onClick={updatePassword}
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     <span>Mise à jour en cours...</span>
//                   </>
//                 ) : (
//                   <span>Changer le mot de passe</span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       id: 'borrowed',
//       label: 'Emprunts',
//       icon: Book,
//       content: renderBorrowedBooks()
//     },
//     {
//       id: 'history',
//       label: 'Historique',
//       icon: Clock,
//       content: renderBorrowHistory()
//     },
//     {
//       id: 'subscription',
//       label: 'Abonnement',
//       icon: CreditCard,
//       content: renderSubscription()
//     }
//   ];

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />
//       <div className="flex-grow relative">
//         <div 
//           className="absolute inset-0 bg-cover bg-center"
//           style={{
//             backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')`,
//           }}
//         >
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80" />
//         </div>

//         <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-4xl mx-auto">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
//             >
//               <div className="p-8">
//                 <div className="flex items-center space-x-4 mb-8">
//                   <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
//                     {userInfo.first_name?.[0]}{userInfo.last_name?.[0]}
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold text-white">Mon Profil</h2>
//                     <p className="text-blue-200">Gérez vos informations personnelles</p>
//                   </div>
//                 </div>


//                 <div className="mt-2">
//                     {userInfo.is_2fa_enabled ? (
//                       <span className="inline-block text-sm text-green-400 bg-green-500/10 px-4 py-1 rounded-full">
//                         Authentification à deux facteurs activée ✅
//                       </span>
//                     ) : (
//                       <div className="flex items-center space-x-2">
//                         <span className="inline-block text-sm text-yellow-300 bg-yellow-500/10 px-4 py-1 rounded-full">
//                           2FA non activée
//                         </span>
//                         <button
//                           onClick={() => window.location.href = 'http://localhost:8000/account/setup/'}
//                           className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
//                         >
//                           Activer maintenant
//                         </button>
//                       </div>
//                     )}
//                 </div>


//                 <div className="border-b border-white/10"> 
//                   <nav className="flex space-x-8">
//                     {tabs.map((tab) => (
//                       <button
//                         key={tab.id}
//                         onClick={() => setActiveTab(tab.id)}
//                         className={`flex items-center space-x-2 pb-4 transition-colors relative ${
//                           activeTab === tab.id
//                             ? 'text-white'
//                             : 'text-blue-200 hover:text-white'
//                         }`}
//                       >
//                         <tab.icon className="w-5 h-5" />
//                         <span>{tab.label}</span>
//                         {activeTab === tab.id && (
//                           <motion.div
//                             layoutId="activeTab"
//                             className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
//                           />
//                         )}
//                       </button>
//                     ))}
//                   </nav>
//                 </div>

//                 <div className="pt-8">
//                   {tabs.find(tab => tab.id === activeTab)?.content}
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//       <Toaster position="top-right" />
//     </div>
//   );
// }

// export default Profile;

