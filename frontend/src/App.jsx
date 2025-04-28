import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Services from './components/Services';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/dashboard/Dashboard';
import BorrowPage from './components/borrow/BorrowPage';
import Profile from './components/proflie/Profile';
import SubscriptionPage from './components/subscription/SubscriptionPage';
import Chatbot from './components/Chatbot';
import Success from './components/Success';

function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <About />
      <Services />
      <Chatbot />
      <Team />
      <Contact />
      <Footer />
      <WelcomeModal />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/borrow/:id" element={<BorrowPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;