// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Menu, Transition } from '@headlessui/react';
// import { UserCircle } from 'lucide-react';

// function Navbar() {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [username, setUsername] = useState('');
//   const [hasSubscription, setHasSubscription] = useState(false);

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem('accessToken');
//       const storedUsername = localStorage.getItem('username');
//       setIsAuthenticated(!!token);
//       setUsername(storedUsername || '');

//       // Check subscription status
//       if (token) {
//         fetch('http://localhost:8000/api/subscriptions/status/', {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         })
//         .then(res => res.json())
//         .then(data => setHasSubscription(data.is_active))
//         .catch(err => console.error('Error checking subscription:', err));
//       }
//     };

//     checkAuth();
//     window.addEventListener('storage', checkAuth);
//     return () => window.removeEventListener('storage', checkAuth);
//   }, []);

//   useEffect(() => {
//     const updateScrolled = () => {
//       setIsScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', updateScrolled);
//     return () => window.removeEventListener('scroll', updateScrolled);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('username');
//     localStorage.removeItem('email');
//     localStorage.removeItem('first_name');
//     localStorage.removeItem('last_name');
//     setIsAuthenticated(false);
//     navigate('/');
//   };

//   const navLinks = [
//     { href: "#accueil", label: "ACCUEIL" },
//     { href: "#a-propos", label: "À PROPOS" },
//     { href: "#services", label: "NOS SERVICES" },
//     { href: "#equipe", label: "NOTRE ÉQUIPE" }
//   ];

//   return (
//     <nav className={`fixed w-full z-50 transition-all duration-300 ${
//       isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
//     }`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-20">
//           <motion.a 
//             href="/" 
//             className={`text-2xl font-serif ${isScrolled ? 'gradient-text' : 'text-white'}`}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             E-Scrolls
//           </motion.a>

//           <div className="hidden lg:flex items-center space-x-8">
//             {navLinks.map((link, index) => (
//               <motion.a
//                 key={link.href}
//                 href={link.href}
//                 className={`text-sm font-medium transition-all duration-300 ${
//                   isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
//                 }`}
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 {link.label}
//               </motion.a>
//             ))}

//             {/* Subscription Link */}
//             <Link
//               to="/subscription"
//               className={`text-sm font-medium transition-all duration-300 ${
//                 isScrolled 
//                   ? 'text-blue-600 hover:text-blue-700' 
//                   : 'text-blue-400 hover:text-blue-300'
//               } flex items-center`}
//             >
//               ABONNEMENT
//               {!hasSubscription && (
//                 <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
//                   Nouveau
//                 </span>
//               )}
//             </Link>

//             {/* User Menu */}
//             <Menu as="div" className="relative">
//               <Menu.Button
//                 className={`flex items-center space-x-2 ${
//                   isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
//                 } transition-all duration-300`}
//               >
//                 <UserCircle className="w-8 h-8" />
//                 {isAuthenticated && (
//                   <span className="ml-2 text-sm font-medium">{username}</span>
//                 )}
//               </Menu.Button>

//               <Transition
//                 enter="transition duration-200 ease-out"
//                 enterFrom="transform scale-95 opacity-0"
//                 enterTo="transform scale-100 opacity-100"
//                 leave="transition duration-75 ease-in"
//                 leaveFrom="transform scale-100 opacity-100"
//                 leaveTo="transform scale-95 opacity-0"
//               >
//                 <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl shadow-lg overflow-hidden">
//                   <div className="p-2">
//                     {!isAuthenticated ? (
//                       <>
//                         <Menu.Item>
//                           {({ active }) => (
//                             <Link
//                               to="/login"
//                               className={`${
//                                 active ? 'bg-blue-500 text-white' : 'text-gray-700'
//                               } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200`}
//                             >
//                               <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//                               </svg>
//                               Se connecter
//                             </Link>
//                           )}
//                         </Menu.Item>
//                         <Menu.Item>
//                           {({ active }) => (
//                             <Link
//                               to="/register"
//                               className={`${
//                                 active ? 'bg-blue-500 text-white' : 'text-gray-700'
//                               } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200`}
//                             >
//                               <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//                               </svg>
//                               S'inscrire
//                             </Link>
//                           )}
//                         </Menu.Item>
//                       </>
//                     ) : (
//                       <>
//                         <Menu.Item>
//                           {({ active }) => (
//                             <Link
//                               to="/dashboard"
//                               className={`${
//                                 active ? 'bg-blue-500 text-white' : 'text-gray-700'
//                               } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200`}
//                             >
//                               <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                               </svg>
//                               Tableau de bord
//                             </Link>
//                           )}
//                         </Menu.Item>
//                         <Menu.Item>
//                           {({ active }) => (
//                             <Link
//                               to="/profile"
//                               className={`${
//                                 active ? 'bg-blue-500 text-white' : 'text-gray-700'
//                               } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200`}
//                             >
//                               <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                               </svg>
//                               Mon Profil
//                             </Link>
//                           )}
//                         </Menu.Item>
//                         <Menu.Item>
//                           {({ active }) => (
//                             <button
//                               onClick={handleLogout}
//                               className={`${
//                                 active ? 'bg-blue-500 text-white' : 'text-gray-700'
//                               } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200`}
//                             >
//                               <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                               </svg>
//                               Déconnexion
//                             </button>
//                           )}
//                         </Menu.Item>
//                       </>
//                     )}
//                   </div>
//                 </Menu.Items>
//               </Transition>
//             </Menu>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="lg:hidden">
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className={`p-2 rounded-md ${isScrolled ? 'text-gray-600' : 'text-white'}`}
//             >
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 {isMobileMenuOpen ? (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 ) : (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 )}
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         <motion.div
//           initial={false}
//           animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
//           className="lg:hidden overflow-hidden"
//         >
//           <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg mb-4">
//             {navLinks.map((link) => (
//               <a
//                 key={link.href}
//                 href={link.href}
//                 className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-300"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 {link.label}
//               </a>
//             ))}

//             {/* Mobile Subscription Link */}
//             <Link
//               to="/subscription"
//               className="block px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all duration-300 flex items-center"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               ABONNEMENT
//               {!hasSubscription && (
//                 <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
//                   Nouveau
//                 </span>
//               )}
//             </Link>

//             {!isAuthenticated ? (
//               <>
//                 <Link
//                   to="/login"
//                   className="block px-3 py-2 text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-md transition-all duration-300"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   Se connecter
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-300"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   S'inscrire
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to="/dashboard"
//                   className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-300"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   Tableau de bord
//                 </Link>
//                 <Link
//                   to="/profile"
//                   className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-300"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   Mon Profil
//                 </Link>
//                 <button
//                   onClick={() => {
//                     handleLogout();
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-300"
//                 >
//                   Déconnexion
//                 </button>
//               </>
//             )}
//           </div>
//         </motion.div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { UserCircle } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const storedUsername = localStorage.getItem('username');
      setIsAuthenticated(!!token);
      setUsername(storedUsername || '');

      if (token) {
        fetch('http://localhost:8000/api/subscriptions/status/', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setHasSubscription(data.is_active))
          .catch(err => console.error('Subscription error:', err));
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/');
  };

  const navLinks = [
    { href: '/', label: 'ACCUEIL' },
    { href: '#a-propos', label: 'À PROPOS' },
    { href: '#services', label: 'NOS SERVICES' },
    { href: '#equipe', label: 'NOTRE ÉQUIPE' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.a href="/" className={`text-2xl font-serif ${isScrolled ? 'gradient-text' : 'text-white'}`}>E-Scrolls</motion.a>

          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}
              >
                {link.label}
              </motion.a>
            ))}

            <Link to="/subscription" className={`text-sm font-medium flex items-center ${isScrolled ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
              ABONNEMENT
              {!hasSubscription && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">Nouveau</span>
              )}
            </Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-white bg-gradient-to-r from-blue-600 to-blue-800 px-3 py-2 rounded-md text-sm font-medium">Se connecter</Link>
                <Link to="/register" className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md">S'inscrire</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md">Library</Link>
                <Link to="/profile" className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md">Mon Profil</Link>
                <button onClick={handleLogout} className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md">Déconnexion</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
