// import React from 'react';
// import axios from 'axios';

// function SubscribeButton({ planId = "1_month" }) {
//   const handleSubscribe = async () => {
//     try {
//       const res = await axios.post(
//         'http://localhost:8000/api/create-subscription/',
//         { plan: planId },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//           }
//         }
//       );
//       window.location.href = res.data.session_url;
//     } catch (err) {
//       console.error(err);
//       alert("Erreur lors de l'abonnement");
//     }
//   };

//   return (
//     <button onClick={handleSubscribe} className="bg-blue-600 text-white py-2 px-4 rounded-lg">
//       S'abonner - {planId === '15_days' ? '9,99€' : planId === '1_year' ? '199,99€' : '19,99€'}
//     </button>
//   );
// }

// export default SubscribeButton;


import axios from 'axios';
import { toast } from 'react-hot-toast';

const SubscribeButton = ({ planId }) => {
  const handleSubscribe = async () => {
    const token = localStorage.getItem('accessToken');

    try {
      // Vérifie d'abord s’il y a déjà un abonnement actif
      const statusRes = await axios.get(
        'http://localhost:8000/api/subscriptions/status/',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (statusRes.data.is_active) {
        toast.error("Vous avez déjà un abonnement actif.", { duration: 1000 });

        return;
      }

      // Sinon, créer la souscription via PayPal
      const res = await axios.post(
        'http://localhost:8000/api/paypal/create-subscription/',
        { plan: planId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'abonnement.");
    }
  };

  return (
    <button onClick={handleSubscribe} className="btn-primary w-full">
      Souscrire
    </button>
  );
};

export default SubscribeButton;

