import React, { useState, useEffect, useCallback } from 'react';

export default function Home({ offers, setActivePage }) {
  const whatsappUrl = "https://wa.me/919943211715?text=Hello%20Saraswathi%20Super%20Market,%20I'm%20visiting%20your%20website%20and%20want%20to%20know%20more%20about%20your%20offers.";

  // Filter for featured and unexpired offers
  const today = new Date().toISOString().split('T')[0];
  const featuredOffers = offers
    .filter(offer => offer.is_featured && offer.is_active && (!offer.expiry_date || offer.expiry_date >= today))
    .slice(0, 4); // Show top 4 on home shelf

  const whyShopItems = [
    {
      icon: "🥦",
      title: "Fresh Produce",
      tamil: "புதிய காய்கறிகள்",
      desc: "Daily arrivals of handpicked vegetables and fruits sourced directly from local farms."
    },
    {
      icon: "💰",
      title: "Wholesale Value",
      tamil: "மொத்த விலை சேமிப்பு",
      desc: "Get unbeatable prices and discounts on all monthly grocery provisions and packs."
    },
    {
      icon: "🛒",
      title: "All Under One Roof",
      tamil: "அனைத்தும் ஒரே இடத்தில்",
      desc: "Wide selection of masalas, cosmetics, personal care, snacks, and dairy products."
    },
    {
      icon: "🤝",
      title: "Local Heritage",
      tamil: "நம்பிக்கையான சேவை",
      desc: "Proudly serving the families of Gingee with friendly service for years."
    }
  ];

  const brandList = [
    "Aachi", "Fortune", "Aashirvaad", "Britannia", "Tata Salt", "Gold Winner"
  ];

  const gallerySlides = [
    {
      url: "/shop/vegetables.jpg",
      fallback: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
      alt: "Fresh Fruits & Vegetables Display",
      caption: "Fresh Fruits & Vegetables",
      sub: "Daily arrivals of farm-fresh fruits, vegetables & produce"
    },
    {
      url: "/shop/fruits.jpg",
      fallback: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1200",
      alt: "Handpicked Fruit Varieties",
      caption: "Handpicked Fresh Fruits",
      sub: "Bananas, apples, pomegranates, oranges & seasonal fruits"
    },
    {
      url: "/shop/aisles.jpg",
      fallback: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1200",
      alt: "Organized Grocery Aisles",
      caption: "Spacious Grocery Aisles",
      sub: "100+ top brands of packaged foods, beverages & provisions"
    },
    {
      url: "/shop/jewellery.jpg",
      fallback: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
      alt: "Fashion Jewellery & Cosmetics Section",
      caption: "Jewellery & Personal Care",
      sub: "Fashion jewellery, bangles, cosmetics & beauty items"
    },
    {
      url: "/shop/kitchenware.jpg",
      fallback: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200",
      alt: "Kitchen Appliances & Home Goods",
      caption: "Household & Kitchenware",
      sub: "Cookware, mixers, gas stoves & household essential items"
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goToSlide((activeSlide + 1) % gallerySlides.length);
  }, [activeSlide, gallerySlides.length, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((activeSlide - 1 + gallerySlides.length) % gallerySlides.length);
  }, [activeSlide, gallerySlides.length, goToSlide]);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [goNext, isPaused]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-layout">
          <div className="hero-info">
            <span className="hero-badge">Weekly Specials Inside!</span>
            <h1 className="hero-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Saraswathi Super Market
              <span className="tamil-text" style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: 'var(--brick)' }}>
                சரஸ்வதி சூப்பர் மார்க்கெட்
              </span>
            </h1>
            <p className="hero-desc">
              Your trusted partner for fresh groceries and household essentials in Gingee. Explore this week’s exclusive deals and visit us in-store today to save big!
            </p>
            <div className="hero-ctas">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setActivePage('offers');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span>View This Week's Offers</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-whatsapp"
              >
                {/* SVG WhatsApp */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.018-5.111-2.875-6.968C16.593 1.92 14.121.901 11.49.901c-5.442 0-9.866 4.42-9.87 9.858a9.818 9.818 0 0 0 1.5 5.17l-.982 3.582 3.673-.963zm10.702-7.25c-.299-.149-1.768-.872-2.042-.971-.274-.1-.474-.149-.673.149-.199.299-.772.971-.946 1.171-.174.199-.349.224-.648.075-.3-.149-1.266-.466-2.41-1.484-.89-.793-1.49-1.773-1.664-2.071-.174-.299-.019-.461.13-.61.135-.133.3-.349.449-.523.149-.174.199-.299.299-.497.1-.199.05-.373-.025-.523-.075-.149-.673-1.62-.922-2.218-.242-.584-.487-.504-.673-.514-.174-.009-.373-.01-.573-.01a1.1 1.1 0 0 0-.798.373c-.274.299-1.047 1.021-1.047 2.49 0 1.469 1.07 2.888 1.219 3.087.149.199 2.106 3.215 5.102 4.507.712.307 1.27.49 1.704.629.714.227 1.365.195 1.88.118.574-.085 1.768-.722 2.017-1.419.249-.697.249-1.294.174-1.419-.075-.125-.274-.199-.573-.349z"/>
                </svg>
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Offers Shelf Section */}
      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="shelf-header">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)' }}>
                This Week's Highlights
                <span className="tamil-text" style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
                  இந்த வார சிறப்பு சலுகைகள்
                </span>
              </h2>
            </div>
            <a 
              href="#offers" 
              className="shelf-link"
              onClick={(e) => {
                e.preventDefault();
                setActivePage('offers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              See All Offers ({offers.length}) →
            </a>
          </div>

          {featuredOffers.length > 0 ? (
            <div className="grid grid-4">
              {featuredOffers.map((offer) => (
                <div key={offer.id} className="offer-card">
                  {offer.festival_tag && (
                    <div className="festival-ribbon">{offer.festival_tag}</div>
                  )}
                  <div className="offer-badge">
                    {offer.offer_type === 'pct' ? `${offer.value} OFF` : 
                     offer.offer_type === 'save' ? `SAVE ₹${offer.value}` : 
                     `₹${offer.value}`}
                  </div>
                  <div className="offer-img-container">
                    <img 
                      src={offer.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'} 
                      alt={offer.name} 
                      className="offer-img"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                  </div>
                  <div className="offer-brand">{offer.brand || 'Fresh'}</div>
                  <h3 className="offer-name">{offer.name}</h3>
                  <div className="offer-category">{offer.category}</div>
                  <div className="offer-footer">
                    <span className="offer-date">
                      Expires: {offer.expiry_date ? new Date(offer.expiry_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'Weekly'}
                    </span>
                    <span className="offer-deal">
                      {offer.offer_type === 'price' ? `Special Price` : 'Offer!'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">🛒</span>
              <h3 className="empty-state-title">Loading Fresh Offers</h3>
              <p>We are adding new weekly deals right now. Check back shortly or visit us in-store!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Shop With Us Section */}
      <section className="section" style={{ backgroundColor: 'var(--market-cream)' }}>
        <div className="container">
          <h2 className="section-title">
            Why Shop With Us?
            <span className="tamil-text" style={{ fontSize: '1rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
              ஏன் எங்களிடம் வாங்க வேண்டும்?
            </span>
          </h2>
          <p className="section-subtitle">
            We strive to provide the best retail experience in Gingee with wholesale prices and customer-first services.
          </p>

          <div className="grid grid-4">
            {whyShopItems.map((item, index) => (
              <div key={index} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>
                  {item.title}
                  <span className="tamil-text" style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
                    {item.tamil}
                  </span>
                </h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands We Stock Section */}
      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <h2 className="section-title">
            Brands We Stock
            <span className="tamil-text" style={{ fontSize: '1rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
              நாங்கள் விற்கும் தயாரிப்பு பிராண்டுகள்
            </span>
          </h2>
          <p className="section-subtitle">
            Find all your favorite and trusted household staples in our aisles. We source 100% original goods.
          </p>

          <div className="brand-grid">
            {brandList.map((brand, index) => (
              <div key={index} className="brand-card">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Slider Section */}
      <section className="section gallery-section" style={{ backgroundColor: 'var(--market-cream)', paddingBottom: '5rem' }}>
        <div className="container">
          <h2 className="section-title">
            A Glimpse of Our Store
            <span className="tamil-text" style={{ fontSize: '1rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
              எங்கள் கடை ஒரு பார்வை
            </span>
          </h2>
          <p className="section-subtitle">
            Step into a spacious and fully stocked shopping environment. Clean aisles and hygienic storage guaranteed.
          </p>

          {/* Slider */}
          <div
            className="gallery-slider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Slides */}
            <div className="gallery-track">
              {gallerySlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`gallery-slide ${idx === activeSlide ? 'active' : ''}`}
                  aria-hidden={idx !== activeSlide}
                >
                  <img
                    src={slide.url}
                    alt={slide.alt}
                    className="gallery-slide-img"
                    loading="lazy"
                    onError={(e) => { e.target.src = slide.fallback; }}
                  />
                  {/* Caption overlay */}
                  <div className={`gallery-caption ${idx === activeSlide ? 'caption-visible' : ''}`}>
                    <h3 className="gallery-caption-title">{slide.caption}</h3>
                    <p className="gallery-caption-sub">{slide.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev / Next arrows */}
            <button
              className="gallery-arrow gallery-arrow-prev"
              onClick={goPrev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="gallery-arrow gallery-arrow-next"
              onClick={goNext}
              aria-label="Next image"
            >
              ›
            </button>

            {/* Dot indicators */}
            <div className="gallery-dots">
              {gallerySlides.map((_, idx) => (
                <button
                  key={idx}
                  className={`gallery-dot ${idx === activeSlide ? 'gallery-dot-active' : ''}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="gallery-progress">
              <div
                className="gallery-progress-bar"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                key={activeSlide}
              />
            </div>
          </div>

          {/* Thumbnail strip below slider */}
          <div className="gallery-thumbs">
            {gallerySlides.map((slide, idx) => (
              <button
                key={idx}
                className={`gallery-thumb ${idx === activeSlide ? 'gallery-thumb-active' : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={slide.alt}
              >
                <img
                  src={slide.url}
                  alt={slide.alt}
                  onError={(e) => { e.target.src = slide.fallback; }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
