import React from 'react';
import { motion } from 'framer-motion';

function Contact() {
  return (
    <div className="py-24 bg-gray-50" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12 space-y-4">
            <span className="text-blue-600 font-semibold">CONTACT</span>
            <h2 className="text-4xl font-serif">Contactez-Nous</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600">
              Des questions? Notre équipe est là pour vous aider à tout moment!
            </p>
          </div>

          <form className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Dupont"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="jean@exemple.fr"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows="4"
                className="input-field resize-none"
                placeholder="Comment pouvons-nous vous aider?"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full btn-primary"
            >
              Envoyer le Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact;