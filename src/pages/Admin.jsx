import React, { useState, useEffect } from 'react';
import {
  isSupabaseConfigured,
  signInWithSupabase,
  signUpWithSupabase,
  signOutFromSupabase,
  getSupabaseSession,
  onSupabaseAuthStateChange,
  saveOfferToSupabase,
  deleteOfferFromSupabase,
  saveSiteSettingToSupabase
} from '../lib/supabase';

export default function Admin({ offers, setOffers, bannerSettings, setBannerSettings }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('fallback'); // 'supabase' | 'fallback'
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add/Edit Offer
  const [editingId, setEditingId] = useState(null);
  const [offerName, setOfferName] = useState('');
  const [offerImage, setOfferImage] = useState('');
  const [offerCategory, setOfferCategory] = useState('Groceries');
  const [offerBrand, setOfferBrand] = useState('');
  const [offerType, setOfferType] = useState('price'); // price, pct, save
  const [offerValue, setOfferValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [festivalTag, setFestivalTag] = useState('');
  
  // Banner state inputs
  const [bannerShow, setBannerShow] = useState(bannerSettings.show);
  const [bannerText, setBannerText] = useState(bannerSettings.text);

  const hasSupabaseConfig = isSupabaseConfigured();

  // Keep bannerShow and bannerText updated if bannerSettings prop updates
  useEffect(() => {
    setBannerShow(bannerSettings.show);
    setBannerText(bannerSettings.text);
  }, [bannerSettings]);

  // Check Supabase session on mount & auto-logout when leaving Admin page
  useEffect(() => {
    let unsubscribe = () => {};

    if (hasSupabaseConfig) {
      // Listen to Auth State Changes in Supabase
      unsubscribe = onSupabaseAuthStateChange((_event, session) => {
        if (session && session.user) {
          setIsLoggedIn(true);
          setAuthMode('supabase');
          setCurrentUserEmail(session.user.email || '');
        } else {
          setIsLoggedIn(false);
          setAuthMode('fallback');
          setCurrentUserEmail('');
        }
      });
    }

    // Cleanup: When admin leaves the Admin section (navigates to Home, Offers, etc.),
    // automatically log out so returning to Admin requires logging in again.
    return () => {
      unsubscribe();
      sessionStorage.removeItem('saraswati_admin_logged');
      if (hasSupabaseConfig) {
        signOutFromSupabase().catch(() => {});
      }
    };
  }, [hasSupabaseConfig]);

  // Handle Supabase Auth Login / Register
  const handleSupabaseAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const data = await signUpWithSupabase(email, password);
        if (data.session) {
          setIsLoggedIn(true);
          setAuthMode('supabase');
          setCurrentUserEmail(data.user?.email || email);
          setLoginSuccess('Account created and authenticated successfully!');
        } else {
          setLoginSuccess('Registration successful! Check your email inbox to confirm your account.');
        }
      } else {
        const data = await signInWithSupabase(email, password);
        if (data.session) {
          setIsLoggedIn(true);
          setAuthMode('supabase');
          setCurrentUserEmail(data.user?.email || email);
          setLoginSuccess('Logged in successfully via Supabase!');
        }
      }
    } catch (err) {
      console.error('Supabase Auth error:', err);
      setLoginError(err.message || 'Authentication failed. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Fallback Local Admin Login
  const handleFallbackLogin = (e) => {
    e.preventDefault();
    const validUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const validPass = import.meta.env.VITE_ADMIN_PASSWORD || 'saraswati2026';

    if (username.trim() === validUser && password === validPass) {
      setIsLoggedIn(true);
      setAuthMode('fallback');
      sessionStorage.setItem('saraswati_admin_logged', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  const handleLogout = async () => {
    if (authMode === 'supabase') {
      await signOutFromSupabase();
    }
    sessionStorage.removeItem('saraswati_admin_logged');
    setIsLoggedIn(false);
    setAuthMode('fallback');
    setCurrentUserEmail('');
  };

  // Helper date for checking offer expiry
  const today = new Date().toISOString().split('T')[0];

  // Quick preset images for grocery items
  const presetImages = [
    { label: "Oils / Cooking", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300" },
    { label: "Rice / Provisions", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300" },
    { label: "Produce / Fruits", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300" },
    { label: "Spices / Powders", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300" },
    { label: "Beverages / Snacks", url: "https://images.unsplash.com/photo-1599490659273-e3b6900d1487?auto=format&fit=crop&q=80&w=300" }
  ];

  // Validate URL scheme to prevent javascript: or data: injection
  const isValidImageUrl = (url) => {
    if (!url) return true;
    const cleanUrl = url.trim().toLowerCase();
    return cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('/');
  };

  // Add or Update offer
  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerName || !offerValue) {
      alert("Please fill in Name and Value fields.");
      return;
    }

    if (offerImage && !isValidImageUrl(offerImage)) {
      alert("Please enter a valid image URL starting with http://, https://, or /");
      return;
    }

    const newOffer = {
      id: editingId || Date.now().toString(),
      name: offerName,
      image_url: offerImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
      category: offerCategory,
      brand: offerBrand,
      offer_type: offerType,
      value: offerValue,
      expiry_date: expiryDate,
      is_featured: isFeatured,
      is_active: true,
      festival_tag: festivalTag
    };

    let updatedOffers;
    if (editingId) {
      updatedOffers = offers.map(o => o.id === editingId ? newOffer : o);
      setEditingId(null);
    } else {
      updatedOffers = [newOffer, ...offers];
    }

    setOffers(updatedOffers);
    localStorage.setItem('saraswati_offers', JSON.stringify(updatedOffers));

    // Also sync to Supabase database if configured
    if (hasSupabaseConfig) {
      try {
        const saved = await saveOfferToSupabase(newOffer);
        if (saved && saved.id && saved.id !== newOffer.id) {
          // Update local state with real Supabase generated UUID
          const syncedOffers = updatedOffers.map(o => o.id === newOffer.id ? saved : o);
          setOffers(syncedOffers);
          localStorage.setItem('saraswati_offers', JSON.stringify(syncedOffers));
        }
      } catch (err) {
        console.warn('Note: Cloud DB sync error (offer saved locally):', err);
      }
    }

    // Clear form
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setOfferName('');
    setOfferImage('');
    setOfferCategory('Groceries');
    setOfferBrand('');
    setOfferType('price');
    setOfferValue('');
    setExpiryDate('');
    setIsFeatured(false);
    setFestivalTag('');
  };

  const handleEditSelect = (offer) => {
    setEditingId(offer.id);
    setOfferName(offer.name);
    setOfferImage(offer.image_url);
    setOfferCategory(offer.category);
    setOfferBrand(offer.brand || '');
    setOfferType(offer.offer_type);
    setOfferValue(offer.value);
    setExpiryDate(offer.expiry_date || '');
    setIsFeatured(offer.is_featured);
    setFestivalTag(offer.festival_tag || '');
  };

  const handleDeleteOffer = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      const updated = offers.filter(o => o.id !== id);
      setOffers(updated);
      localStorage.setItem('saraswati_offers', JSON.stringify(updated));

      if (hasSupabaseConfig) {
        try {
          await deleteOfferFromSupabase(id);
        } catch (err) {
          console.warn('Note: Could not delete from Cloud DB:', err);
        }
      }
    }
  };

  // Save global festival banner settings
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    const updatedBanner = { show: bannerShow, text: bannerText };
    setBannerSettings(updatedBanner);
    localStorage.setItem('saraswati_banner_settings', JSON.stringify(updatedBanner));

    if (hasSupabaseConfig) {
      try {
        await saveSiteSettingToSupabase('banner', updatedBanner);
      } catch (err) {
        console.warn('Note: Could not save banner to Cloud DB:', err);
      }
    }

    alert("Festival banner settings saved!");
  };

  // Admin Login Screen
  if (!isLoggedIn) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="admin-login-card" style={{ maxWidth: '440px', width: '100%' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--leaf-green)', textAlign: 'center', marginBottom: '0.25rem' }}>
            Staff Admin Login
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-light)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            சரஸ்வதி சூப்பர் மார்க்கெட் - நிர்வாகி உள்நுழைவு
          </p>

          {/* Configuration Status Notice */}
          {hasSupabaseConfig ? (
            <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚡</span>
              <span><strong>Supabase Cloud Auth Active:</strong> Log in or create an admin account below.</span>
            </div>
          ) : (
            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#b78103' }}>
              <div><strong>⚡ Supabase Auth Ready</strong></div>
              <div style={{ marginTop: '0.2rem' }}>Add <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code> to enable live cloud authentication. Standard login active below.</div>
            </div>
          )}

          {/* Form Switcher for Supabase Auth vs Fallback */}
          {hasSupabaseConfig ? (
            <div>
              <div style={{ display: 'flex', borderRadius: '6px', background: '#f0ece1', padding: '3px', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: !isSignUp ? 'var(--leaf-green)' : 'transparent',
                    color: !isSignUp ? '#fff' : 'var(--ink-color)'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: isSignUp ? 'var(--leaf-green)' : 'transparent',
                    color: isSignUp ? '#fff' : 'var(--ink-color)'
                  }}
                >
                  Register Account
                </button>
              </div>

              <form onSubmit={handleSupabaseAuth}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="form-control" 
                    placeholder="admin@saraswati.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>

                {loginError && (
                  <p style={{ color: 'var(--brick)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                    {loginError}
                  </p>
                )}

                {loginSuccess && (
                  <p style={{ color: '#2e7d32', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                    {loginSuccess}
                  </p>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Authenticating...' : (isSignUp ? 'Create Supabase Admin Account' : 'Log In with Supabase')}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleFallbackLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  className="form-control" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>

              {loginError && (
                <p style={{ color: 'var(--brick)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                  {loginError}
                </p>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Log In
              </button>
              <p style={{ textAlign: 'center', color: '#a89c94', fontSize: '0.75rem', marginTop: '1.5rem' }}>
                Demo credentials: <code>admin</code> / <code>saraswati2026</code>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Admin Dashboard Panel
  const expiredCount = offers.filter(o => o.expiry_date && o.expiry_date < today).length;
  const featuredCount = offers.filter(o => o.is_featured).length;

  return (
    <div className="section" style={{ backgroundColor: 'var(--market-cream)', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Header Bar */}
        <div className="admin-header-bar">
          <div className="admin-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--leaf-green)', margin: 0 }}>
                Saraswathi Store Admin Panel
              </h2>
              {authMode === 'supabase' ? (
                <span style={{ fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: '600' }}>
                  ⚡ Supabase Authenticated ({currentUserEmail})
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', background: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: '600' }}>
                  🔑 Local Credentials Mode
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-light)', display: 'block', marginTop: '0.25rem' }}>
              Weekly Offers, Brand tags, and global banner management dashboard.
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            Log Out
          </button>
        </div>

        {/* Stats Strip */}
        <div className="admin-stats-strip">
          <div className="admin-stat-card">
            <div className="admin-stat-num">{offers.length}</div>
            <div className="admin-stat-label">Total Offers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-num">{offers.length - expiredCount}</div>
            <div className="admin-stat-label">Active Offers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-num" style={{ color: 'var(--brick)' }}>{expiredCount}</div>
            <div className="admin-stat-label">Expired Offers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-num" style={{ color: 'var(--turmeric)' }}>{featuredCount}</div>
            <div className="admin-stat-label">Featured Deals</div>
          </div>
        </div>

        {/* Action Layout */}
        <div className="admin-layout">
          
          {/* Column 1: Forms (Offer Add/Edit & Site Settings) */}
          <div>
            {/* Offer Form Card */}
            <div className="admin-card">
              <h3>{editingId ? "Edit Weekly Offer" : "Add New Offer"}</h3>
              <form onSubmit={handleSubmitOffer}>
                
                {/* Offer Name */}
                <div className="form-group">
                  <label>Offer Name / Item Details *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Fortune Rice Bran Oil 1L" 
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    required
                  />
                </div>

                {/* Offer Brand */}
                <div className="form-group">
                  <label>Brand Tag (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Fortune, Aachi, Britannia" 
                    value={offerBrand}
                    onChange={(e) => setOfferBrand(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="form-group">
                  <label>Category Group</label>
                  <select 
                    className="form-control" 
                    value={offerCategory}
                    onChange={(e) => setOfferCategory(e.target.value)}
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Oils & Ghee">Oils & Ghee</option>
                    <option value="Masalas & Spices">Masalas & Spices</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Snacks & Beverages">Snacks & Beverages</option>
                    <option value="Household Essentials">Household Essentials</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                {/* Offer Type Selection */}
                <div className="form-group">
                  <label>Offer Style / Value Tag</label>
                  <div className="form-radio-group">
                    <button 
                      type="button" 
                      className={`radio-btn ${offerType === 'price' ? 'selected' : ''}`}
                      onClick={() => setOfferType('price')}
                    >
                      Special Price
                    </button>
                    <button 
                      type="button" 
                      className={`radio-btn ${offerType === 'pct' ? 'selected' : ''}`}
                      onClick={() => setOfferType('pct')}
                    >
                      % Discount
                    </button>
                    <button 
                      type="button" 
                      className={`radio-btn ${offerType === 'save' ? 'selected' : ''}`}
                      onClick={() => setOfferType('save')}
                    >
                      Save ₹ Amount
                    </button>
                  </div>
                </div>

                {/* Value Input */}
                <div className="form-group">
                  <label>
                    {offerType === 'price' ? "Special Price Value (₹)" : 
                     offerType === 'pct' ? "Discount Percentage (%)" : 
                     "Savings Amount (₹)"} *
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={offerType === 'price' ? "e.g. 145" : offerType === 'pct' ? "e.g. 10" : "e.g. 25"}
                    value={offerValue}
                    onChange={(e) => setOfferValue(e.target.value)}
                    required
                  />
                </div>

                {/* Expiry Date */}
                <div className="form-group">
                  <label>Expiry Date (Auto-hides once passed)</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                {/* Festival Tag */}
                <div className="form-group">
                  <label>Festival Label (Tag for ribbons)</label>
                  <select 
                    className="form-control" 
                    value={festivalTag}
                    onChange={(e) => setFestivalTag(e.target.value)}
                  >
                    <option value="">None / Regular Deals</option>
                    <option value="Pongal Special">Pongal Special</option>
                    <option value="Diwali Special">Diwali Special</option>
                    <option value="Ramzan Offer">Ramzan Offer</option>
                    <option value="Christmas Deal">Christmas Deal</option>
                  </select>
                </div>

                {/* Image Selection: Stock Gallery, Upload, or Custom URL */}
                <div className="form-group" style={{ background: '#FAF7F2', padding: '1rem', borderRadius: '8px', border: '1px solid var(--basket-tan)' }}>
                  <label style={{ fontWeight: '700', color: 'var(--deep-forest)', display: 'block', marginBottom: '0.5rem' }}>
                    🖼️ Product Image (Choose Stock, Upload photo, or Paste URL)
                  </label>

                  {/* 1. Upload from Phone / PC Gallery */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                      Option A: Upload from your device gallery
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setOfferImage(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ fontSize: '0.825rem', padding: '0.4rem', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                  </div>

                  {/* 2. Stock Image Gallery */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>
                      Option B: Choose from Stock Image Library
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto', padding: '0.25rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
                      {[
                        { label: '🌻 Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
                        { label: '🌾 Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
                        { label: '🌶️ Spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400' },
                        { label: '🍅 Tomatoes', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400' },
                        { label: '🥔 Vegetables', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400' },
                        { label: '🍌 Fruits', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400' },
                        { label: '🥛 Milk & Dairy', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400' },
                        { label: '🍪 Biscuits', url: 'https://images.unsplash.com/photo-1599490659273-e3b6900d1487?auto=format&fit=crop&q=80&w=400' },
                        { label: '🧃 Drinks', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400' },
                        { label: '🧼 Soaps', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400' },
                        { label: '🧴 Shampoo', url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=400' },
                        { label: '🍫 Sweets', url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=400' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setOfferImage(item.url)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.3rem',
                            border: offerImage === item.url ? '2px solid var(--turmeric)' : '1px solid #eee',
                            borderRadius: '4px',
                            background: offerImage === item.url ? '#FFF8EE' : '#FAF9F6',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                        >
                          <img src={item.url} alt={item.label} style={{ width: '100%', height: '40px', objectFit: 'cover', borderRadius: '3px' }} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Direct Image URL Input */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                      Option C: Paste custom image URL
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://..." 
                      value={offerImage}
                      onChange={(e) => setOfferImage(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Live Image Preview */}
                  {offerImage && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={offerImage} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--deep-forest)', fontWeight: '600', display: 'block' }}>Image Selected</span>
                        <button 
                          type="button" 
                          onClick={() => setOfferImage('')}
                          style={{ color: '#d32f2f', background: 'none', border: 'none', fontSize: '0.7rem', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Clear image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Featured Checkbox */}
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="isFeatured" 
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="isFeatured" style={{ cursor: 'pointer' }}>
                    Show in Homepage Highlights (Featured Offer)
                  </label>
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                    {editingId ? "Update Offer Details" : "Publish Offer"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Site settings banner form */}
            <div className="admin-card">
              <h3>Site Settings (Global Banner)</h3>
              <form onSubmit={handleSaveBanner}>
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="showBanner"
                    checked={bannerShow}
                    onChange={(e) => setBannerShow(e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="showBanner" style={{ cursor: 'pointer' }}>
                    Show global top-bar festival banner
                  </label>
                </div>
                <div className="form-group">
                  <label>Banner Text Announcement</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Pongal Special - Visit us this week for massive storewide discounts!"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
                  Save Banner Settings
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: Manage Offers List Table */}
          <div>
            <div className="admin-card">
              <h3>Active Promotional Offer Shelf</h3>
              <div className="admin-table-wrapper">
                {offers.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Offer Details</th>
                        <th>Category</th>
                        <th>Offer Value</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((offer) => {
                        const isExpired = offer.expiry_date && offer.expiry_date < today;
                        return (
                          <tr key={offer.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <img 
                                  src={offer.image_url} 
                                  alt="" 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--basket-tan)' }}
                                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=40'}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '600' }}>{offer.name}</span>
                                  {offer.brand && <span style={{ fontSize: '0.75rem', color: 'var(--brick)' }}>{offer.brand}</span>}
                                  {offer.festival_tag && <span style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>🏷️ {offer.festival_tag}</span>}
                                </div>
                              </div>
                            </td>
                            <td>{offer.category}</td>
                            <td>
                              <strong>
                                {offer.offer_type === 'pct' ? `${offer.value}% Off` : 
                                 offer.offer_type === 'save' ? `Save ₹${offer.value}` : 
                                 `₹${offer.value}`}
                              </strong>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {isExpired ? (
                                  <span className="badge-row expired">Expired</span>
                                ) : (
                                  <span className="badge-row active">Active</span>
                                )}
                                {offer.is_featured && (
                                  <span className="badge-row featured" style={{ textAlign: 'center' }}>Featured</span>
                                )}
                              </div>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <button 
                                className="btn-icon-action edit" 
                                title="Edit"
                                onClick={() => handleEditSelect(offer)}
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-icon-action delete" 
                                title="Delete"
                                onClick={() => handleDeleteOffer(offer.id)}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <span className="empty-state-icon">📝</span>
                    <h3 className="empty-state-title">No offers created yet</h3>
                    <p>Use the form on the left to publish your first weekly deal card.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
