import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("🎉 Abonnement activé avec succès !");
    
    // Déclenche un rafraîchissement forcé
    setTimeout(() => {
      navigate('/profile?refresh=1');
    },5000);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-blue-900 text-white text-2xl">
      Redirection vers votre profil...
    </div>
  );
}

export default Success;
