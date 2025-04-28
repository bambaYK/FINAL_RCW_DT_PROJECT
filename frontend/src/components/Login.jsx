import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setIsLoading(true);

    try {
      // First, try to get the token
      const loginResponse = await axios.post(
        'http://localhost:8000/api/token/', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (loginResponse.data.access) {
        // Store tokens
        localStorage.setItem('accessToken', loginResponse.data.access);
        localStorage.setItem('refreshToken', loginResponse.data.refresh);

        // Get user details
        try {
          const userResponse = await axios.get(
            `http://localhost:8000/api/users/${formData.username}/`,
            {
              headers: {
                'Authorization': `Bearer ${loginResponse.data.access}`,
                'Content-Type': 'application/json'
              }
            }
          );

          // Store user info
          localStorage.setItem('username', userResponse.data.username);
          localStorage.setItem('email', userResponse.data.email);
          localStorage.setItem('first_name', userResponse.data.first_name || '');
          localStorage.setItem('last_name', userResponse.data.last_name || '');

          setMessage('Connexion réussie');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } catch (userError) {
          console.error('Erreur lors de la récupération des détails utilisateur:', userError);
          // Even if we can't get user details, we can still proceed with basic auth
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage('Identifiants invalides');
        } else {
          setErrorMessage(error.response.data.detail || 'Une erreur est survenue');
        }
      } else if (error.request) {
        setErrorMessage('Impossible de contacter le serveur');
      } else {
        setErrorMessage('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

        <div className="relative pt-20 pb-32 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-white mb-2">Bon retour parmi nous!</h2>
                <p className="text-blue-200">Connectez-vous pour accéder à votre bibliothèque</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-blue-200 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Entrez votre nom d'utilisateur"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg text-sm"
                  >
                    {message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>

                <div className="text-center text-sm text-blue-200">
                  Pas encore de compte?{' '}
                  <Link to="/register" className="text-white hover:text-blue-300 font-medium transition duration-150">
                    Inscrivez-vous ici
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;


// import React from 'react';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import Navbar from './Navbar';
// import Footer from './Footer';

// const Login = () => {
//   const redirectToSecureLogin = () => {
//     window.location.href = "http://localhost:8000/account/login/";
//   };

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

//         <div className="relative pt-20 pb-32 flex items-center justify-center px-4 sm:px-6 lg:px-8">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-md w-full space-y-8"
//           >
//             <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
//               <div className="text-center mb-8">
//                 <h2 className="text-3xl font-serif text-white mb-2">Connexion sécurisée</h2>
//                 <p className="text-blue-200">Authentification à deux facteurs avec Google Authenticator</p>
//               </div>

//               <button
//                 onClick={redirectToSecureLogin}
//                 className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 text-lg"
//               >
//                 <span>🔐 Connexion via Django 2FA</span>
//               </button>

//               <div className="text-center text-sm text-blue-200 mt-6">
//                 Pas encore de compte ?{' '}
//                 <Link to="/register" className="text-white hover:text-blue-300 font-medium transition duration-150">
//                   Inscrivez-vous ici
//                 </Link>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Login;
