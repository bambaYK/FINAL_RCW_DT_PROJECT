import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

function Stats() {
  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const stats = [
    { number: 50000, suffix: "+", label: "Livres Disponibles" },
    { number: 100000, suffix: "+", label: "Lecteurs Actifs" },
    { number: 98, suffix: "%", label: "Clients Satisfaits" }
  ];

  return (
    <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              className="text-white"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {statsInView && (
                  <CountUp
                    end={stat.number}
                    duration={2.5}
                    separator=" "
                  />
                )}
                {stat.suffix}
              </div>
              <div className="text-blue-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stats;