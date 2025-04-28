import React from 'react';
import { motion } from 'framer-motion';

const services = [
  {
    title: "Bibliothèque Numérique",
    description: "Accédez à des milliers de livres numériques dans tous les genres, disponibles instantanément.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000"
  },
  {
    title: "Recherche Avancée",
    description: "Trouvez facilement vos prochaines lectures grâce à notre système de recherche intelligent.",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=2000"
  },
  {
    title: "Recommandations",
    description: "Recevez des suggestions personnalisées basées sur vos goûts et votre historique de lecture.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000"
  }
];

function Services() {
  return (
    <div className="py-24 bg-gray-50" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <span className="text-blue-600 font-semibold">NOS SERVICES</span>
            <h2 className="text-4xl font-serif">Services Exceptionnels</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre gamme complète de services conçus pour enrichir votre expérience de lecture numérique.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative h-96 rounded-2xl overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-2xl font-serif mb-4">{service.title}</h3>
                <p className="text-gray-200 transform translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;