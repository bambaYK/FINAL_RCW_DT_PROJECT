import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../Navbar';
import Footer from '../Footer';
import SubscribeButton from '../SubscribeButton';

const plans = [
  {
    id: '15_days',
    name: '15 Jours',
    price: 9.99,
    features: [
      'Accès à tous les livres et les documents',
      'Lecture en ligne',
      '5 emprunts simultanés',
      'Téléchargement hors-ligne',
      'Support',
      'Accès anticipé aux nouveautés'
    ],
    notIncluded: []
  },
  {
    id: '1_month',
    name: '1 Mois',
    price: 19.99,
    popular: true,
    features: [
      'Accès à tous les livres et les documents',
      'Lecture en ligne',
      '5 emprunts simultanés',
      'Téléchargement hors-ligne',
      'Support',
      'Accès anticipé aux nouveautés'
    ],
    notIncluded: []
  },
  {
    id: '1_year',
    name: '1 An',
    price: 199.99,
    features: [
      'Accès à tous les livres et les documents',
      'Lecture en ligne',
      '5 emprunts simultanés',
      'Téléchargement hors-ligne',
      'Support',
      'Accès anticipé aux nouveautés'
    ],
    notIncluded: []
  }
];

function SubscriptionPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Veuillez vous connecter pour souscrire à un abonnement');
      setTimeout(() => navigate('/login'), 1500);
    }
  }, []);

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
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-serif text-white mb-4"
              >
                Choisissez votre plan
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-blue-200 max-w-2xl mx-auto"
              >
                Accédez à notre bibliothèque complète avec le plan qui vous convient le mieux.
                Tous nos abonnements incluent un accès illimité à notre catalogue.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border ${
                    plan.popular ? 'border-blue-500' : 'border-white/20'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                      Populaire
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-8">
                      <span className="text-4xl font-bold text-white">{plan.price}€</span>
                      <span className="text-blue-200 ml-2">
                        {plan.id === '1_year' ? '/an' : '/mois'}
                      </span>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-white">
                          <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature, i) => (
                        <div key={i} className="flex items-center text-white/50">
                          <X className="w-5 h-5 text-red-400/50 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <SubscribeButton planId={plan.id} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-blue-200">
                Des questions ? Contactez notre équipe de support disponible 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default SubscriptionPage;
