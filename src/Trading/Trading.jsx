import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import Footer2 from '../Home/Footer2';
import Header from '../Home/Header';
import { useApi } from '../hooks/useApi';
import CarbonEmissionsCalculator from './CarbonEmissionsCalculator';
import './Trading.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Trading = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState([]);
  const { get } = useApi();

  // Refs for animations
  const logoRef = useRef(null);
  const comingSoonRef = useRef(null);
  const guidesTitleRef = useRef(null);
  const guidesContainerRef = useRef(null);
  const calculatorTitleRef = useRef(null);
  const calculatorContainerRef = useRef(null);
  const democratizingRef = useRef(null);
  const partnersTitleRef = useRef(null);
  const partnersLogosRef = useRef(null);

  const fetchCards = useCallback(async () => {
    try {
      // Get the selected language from localStorage
      // const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      const data = await get(`${API_BASE_URL}/api/guides`, 'Loading trading cards...');
      setCards(data);
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  }, [get]);

  useEffect(() => {
    fetchCards();
    // Listen for language changes
    // const handleLanguageChange = () => {
    //   fetchCards();
    // };
    // window.addEventListener('storage', handleLanguageChange);
    // window.addEventListener('languageChanged', handleLanguageChange);
    // return () => {
    //   window.removeEventListener('storage', handleLanguageChange);
    //   window.removeEventListener('languageChanged', handleLanguageChange);
    // };
  }, [fetchCards]);

  // Handle anchor navigation when page loads
  useEffect(() => {
    if (window.location.hash) {
      const anchorId = window.location.hash.substring(1);
      console.log('Trading: Navigating to anchor:', anchorId);

      const scrollWithHeaderOffset = () => {
        const anchor = document.getElementById(anchorId);
        console.log('Trading: Found anchor element:', anchor);
        if (anchor) {
          const headerEl = document.querySelector('#hhw') || document.querySelector('header.header');
          const headerOffset = headerEl ? headerEl.offsetHeight : 0;
          const rect = anchor.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = scrollTop + rect.top - (headerOffset + 10);
          console.log('Trading: Scrolling to position:', targetPosition, 'with headerOffset:', headerOffset);
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        } else {
          console.log('Trading: Anchor element not found:', anchorId);
        }
      };

      scrollWithHeaderOffset();
      setTimeout(scrollWithHeaderOffset, 100);
      setTimeout(scrollWithHeaderOffset, 500);
      setTimeout(scrollWithHeaderOffset, 1000);
    }
  }, []);

  useEffect(() => {
    // Initialize animations
    initializeAnimations();
  }, [cards]);

  const initializeAnimations = () => {
    // Logo and coming soon animation
    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }

    if (comingSoonRef.current) {
      gsap.fromTo(comingSoonRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.3,
          ease: "back.out(1.7)"
        }
      );
    }

    // Carbon guides section animation
    if (guidesTitleRef.current) {
      gsap.fromTo(guidesTitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: guidesTitleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (guidesContainerRef.current) {
      const guideCards = guidesContainerRef.current.querySelectorAll('.guide-card');
      gsap.fromTo(guideCards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: guidesContainerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Calculator section animation
    if (calculatorTitleRef.current) {
      gsap.fromTo(calculatorTitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: calculatorTitleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (calculatorContainerRef.current) {
      gsap.fromTo(calculatorContainerRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: calculatorContainerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Democratizing section animation
    if (democratizingRef.current) {
      gsap.fromTo(democratizingRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: democratizingRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Partners section animation
    if (partnersTitleRef.current) {
      gsap.fromTo(partnersTitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: partnersTitleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (partnersLogosRef.current) {
      const partnerLogos = partnersLogosRef.current.querySelectorAll('.partner-logo');
      gsap.fromTo(partnerLogos,
        { opacity: 0, y: 30, rotation: -5 },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: partnersLogosRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  };

  return (
    <>
      <div id="trade">
        <Header />
      </div>
      <div id='logo2b'>
        {/* DecarbXchange Logo and Coming Soon Button - Keep unchanged */}
        <div id="logp2a" style={{ position: 'relative', padding: '40px 20px', minHeight: '200px' }}>
          {/* Anchor div for navbar navigation - ensures section appears from start */}
          <div id="logp2a-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>

          <img src="./Logo2.webp" alt="Logo" ref={logoRef} style={{ maxWidth: '100%', height: 'auto' }} />
          <button id="ttr4" ref={comingSoonRef}>{t("trading.coming_soon")}</button>
        </div>

        {/* Carbon Offsetting Guides Section */}
        <div id="carbon-guides-section" style={{ position: 'relative' }}>
          <h1 ref={guidesTitleRef} style={{ position: 'relative' }}>
            {/* Anchor div for navbar navigation - ensures heading appears from start */}
            <div id="carbon-guides-section-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>
            {t("trading.carbon_guides_title")}
          </h1>
          <div id="guides-container" ref={guidesContainerRef}>
            {cards.map((card, idx) => (
              <div className="guide-card" key={idx} onClick={() => window.open(card.fileURL, "_blank")}>
                <div className="guide-card-content">
                  <img className='guide-image' src={card.imageURL} alt='guide-image' />
                  <h3>{card.title || t("trading.untitled")}</h3>
                  {/* <p>{card.description || t("trading.no_description")}</p> */}
                  <button className="guide-button">{t("trading.learn_more")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CO2 Emissions Calculator and Democratizing Section */}
        <div id="calculator-democratizing-container">
          <div id="calculator-section">
            
            <div id="calculator-container" ref={calculatorContainerRef}>
              {/* <iframe
                style={{ height: '730px', width: '100%' }}
                src="https://plugin.sustainabletravel.com/?api_key=STIKEY_687aad94750ee556806795&primary_color=%23008370&secondary_color=%23f7961f&light_primary_color=%2366e9d6&sort_order=Flight%2CHotel%2CCar%2CBoat"
                title="CO2 Emissions Calculator"
              /> */}
              <CarbonEmissionsCalculator />
            </div>
          </div>

          {/* Democratizing Green Investment Section */}
          <div id="democratizing-section">
            <div className="democratizing-content" ref={democratizingRef}>
              <h1>{t("trading.democratizing_title")}</h1>
              <p>{t("trading.democratizing_text")}</p>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div id="partners-section" style={{ position: 'relative' }}>
          <h1 ref={partnersTitleRef} style={{ position: 'relative' }}>
            {/* Anchor div for navbar navigation - ensures heading appears from start */}
            <div id="partners-section-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>
            {t("trading.partners_title")}
          </h1>
          <div id="partners-logos" ref={partnersLogosRef}>
            <div className="partner-logo">
              <img src="./pi1.webp" alt="Fragile Impact" />
            </div>
            <div className="partner-logo">
              <img src="./pi2.webp" alt="PH-PLUS 500ml" />
            </div>
            <div className="partner-logo">
              <img src="./pi3.webp" alt="PH-PLUS Kids" />
            </div>

          </div>
        </div>


        <Footer2 />
      </div>
    </>
  );
};

export default Trading;
