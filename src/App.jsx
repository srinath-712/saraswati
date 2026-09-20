import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileFloatingButtons from './components/MobileFloatingButtons';
import Home from './pages/Home';
import Offers from './pages/Offers';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { fetchOffersFromSupabase, fetchSiteSettingsFromSupabase, isSupabaseConfigured } from './lib/supabase';

// Default mock offers (empty by default so user/admin populates actual store deals)
const getDefaultOffers = () => [];

const DEFAULT_BANNER = {
  show: true,
  text: '🌾 Store Discounts & Weekly Specials! Visit our store in Gingee for special prices! 🌾'
};

function App() {
  const [activePage, setActivePage] = useState('home');
  const [offers, setOffers] = useState([]);
  const [bannerSettings, setBannerSettings] = useState(DEFAULT_BANNER);

  // Load initial state from localStorage, then sync from Supabase if connected
  useEffect(() => {
    // 1. Initial Local Cache
    const localOffers = localStorage.getItem('saraswati_offers');
    if (localOffers) {
      try {
        const parsed = JSON.parse(localOffers);
        // Clear mock seeded offers if present (e.g. Fortune Sunflower Oil from old seed)
        if (Array.isArray(parsed) && parsed.some(o => o.name === 'Fortune Sunflower Oil 1L Pouches')) {
          setOffers([]);
          localStorage.setItem('saraswati_offers', JSON.stringify([]));
        } else {
          setOffers(parsed);
        }
      } catch (e) {
        console.error("Error parsing offers data", e);
        setOffers([]);
      }
    } else {
      setOffers([]);
      localStorage.setItem('saraswati_offers', JSON.stringify([]));
    }

    const localBanner = localStorage.getItem('saraswati_banner_settings');
    if (localBanner) {
      try {
        setBannerSettings(JSON.parse(localBanner));
      } catch (e) {
        console.error("Error parsing banner settings", e);
      }
    } else {
      localStorage.setItem('saraswati_banner_settings', JSON.stringify(DEFAULT_BANNER));
    }

    // 2. Fetch fresh data from Supabase Cloud DB if configured
    if (isSupabaseConfigured()) {
      fetchOffersFromSupabase().then((dbOffers) => {
        if (dbOffers && dbOffers.length > 0) {
          setOffers(dbOffers);
          localStorage.setItem('saraswati_offers', JSON.stringify(dbOffers));
        }
      });

      fetchSiteSettingsFromSupabase().then((dbBanner) => {
        if (dbBanner) {
          setBannerSettings(dbBanner);
          localStorage.setItem('saraswati_banner_settings', JSON.stringify(dbBanner));
        }
      });
    }
  }, []);

  // Router switcher mapping
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home offers={offers} setActivePage={setActivePage} />;
      case 'offers':
        return <Offers offers={offers} />;
      case 'products':
        return <Products setActivePage={setActivePage} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return (
          <Admin 
            offers={offers} 
            setOffers={setOffers} 
            bannerSettings={bannerSettings} 
            setBannerSettings={setBannerSettings}
          />
        );
      default:
        return <Home offers={offers} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      
      {/* Global Festival Banner Alert */}
      {bannerSettings.show && (
        <div className="festival-banner">
          <span>🔔</span>
          <strong>{bannerSettings.text}</strong>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Page Body Viewport */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Navigation Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Mobile Floating Action Buttons */}
      <MobileFloatingButtons />
    </div>
  );
}

export default App;
