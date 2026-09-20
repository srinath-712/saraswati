import React, { useState } from 'react';

export default function Navbar({ activePage, setActivePage }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', tamil: 'முகப்பு' },
    { id: 'offers', label: 'Weekly Deals', tamil: 'வாராந்திர சலுகைகள்' },
    { id: 'products', label: 'Categories', tamil: 'பிரிவுகள்' },
    { id: 'about', label: 'About Us', tamil: 'எங்களைப் பற்றி' },
    { id: 'contact', label: 'Store Locator', tamil: 'தொடர்புக்கு' }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header" id="navbar">
      <div className="container nav-wrapper">
        <a href="#home" className="logo-link" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Saraswathi Super Market Logo" 
            style={{ height: '3.25rem', width: 'auto', objectFit: 'contain', borderRadius: '4px' }}
            onError={(e) => {
              e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd0Q-5OgwZBVtOSnO3Ps_bcoXjbTj4jJuzKg&s";
            }}
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.id); }}
                >
                  <span>{item.label}</span>
                  <span className="tamil-text" style={{ fontSize: '0.65rem' }}>{item.tamil}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Toggle Button */}
        <button
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`mobile-nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick(item.id); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.label}</span>
                  <span className="tamil-text" style={{ color: 'var(--ink-light)', fontSize: '0.75rem' }}>{item.tamil}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
