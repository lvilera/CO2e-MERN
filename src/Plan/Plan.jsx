import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import "./Plan.css";
import Header from '../Home/Header';
import Footer2 from '../Home/Footer2';
import { useNavigate } from 'react-router-dom';
import { IoBulbOutline, IoRibbonOutline, IoAirplaneOutline } from 'react-icons/io5';
import { API_BASE } from '../config';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Plan = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [loading, setLoading] = useState(null); // Track which button is loading
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' }); // For success/error messages

  const subscriptionInfoRef = useRef(subscriptionInfo);

  // Refs for animations
  const messageRef = useRef(null);
  const cardsRef = useRef(null);
  const perksRef = useRef(null);
  const blockchainRef = useRef(null);
  const investmentRef = useRef(null);
  const commitmentRef = useRef(null);

  useEffect(() => {
    subscriptionInfoRef.current = subscriptionInfo;
  }, [subscriptionInfo]);

  const fetchMe = async () => {
    if (isLoggedIn) {
      fetch(`${API_BASE}/api/me`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.subscriptionInfo) {
            setSubscriptionInfo(data.subscriptionInfo);
          }
        })
        .catch(() => {
          setSubscriptionInfo(null);
        });
    } else {
      setSubscriptionInfo(null);
    }
  };

  // Fetch user's current package
  useEffect(() => {
    fetchMe();
  }, [isLoggedIn]);

  // Handle hash navigation when page loads
  useEffect(() => {
    if (window.location.hash) {
      const anchorId = window.location.hash.substring(1);

      const scrollWithHeaderOffset = () => {
        const anchor = document.getElementById(anchorId);
        if (anchor) {
          const headerEl = document.querySelector('#hhw') || document.querySelector('header.header');
          const headerOffset = headerEl ? headerEl.offsetHeight : 0;
          const rect = anchor.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = scrollTop + rect.top - (headerOffset + 10);
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      };

      // Multiple attempts to ensure DOM is ready
      scrollWithHeaderOffset();
      setTimeout(scrollWithHeaderOffset, 100);
      setTimeout(scrollWithHeaderOffset, 500);
      setTimeout(scrollWithHeaderOffset, 1000);
    }
  }, []);

  useEffect(() => {
    // Initialize animations
    initializeAnimations();
  }, [message]);

  const initializeAnimations = () => {

    // Message animation
    if (messageRef.current && message.text) {
      gsap.fromTo(messageRef.current,
        { opacity: 0, scale: 0.8, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }

    // Cards animation
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('#Cards1, #Cards, #Cards3');
      gsap.fromTo(cards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Perks section animation
    if (perksRef.current) {
      gsap.fromTo(perksRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: perksRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Blockchain section animation
    if (blockchainRef.current) {
      const elements = blockchainRef.current.querySelectorAll('div, img');
      gsap.fromTo(elements,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: blockchainRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Investment section animation
    if (investmentRef.current) {
      const elements = investmentRef.current.querySelectorAll('div, img');
      gsap.fromTo(elements,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: investmentRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Commitment section animation
    if (commitmentRef.current) {
      const elements = commitmentRef.current.querySelectorAll('div, img');
      gsap.fromTo(elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: commitmentRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCancelSubscription = async () => {

  };

  const pollSubscriptionUpdate = async (newPriceId, attempts = 10, interval = 3000) => {
    for (let i = 0; i < attempts; i++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      await fetchMe();

      if (subscriptionInfoRef.current?.priceId === newPriceId) {
        showMessage("Subscription updated successfully!");
        return;
      }
    }

    showMessage("Subscription update may be delayed. Please refresh later.", "info");
  };

  const handleSubscribe = async (priceId) => {
    console.log("Price ID: ", priceId);
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // For paid plans, proceed with Stripe checkout
    setLoading(priceId);
    try {
      if (subscriptionInfo?.status) {
        const response = await fetch(`${API_BASE}/api/stripe/update-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            newPriceId: priceId
          })
        });

        if (!response.ok) {
          return showMessage('Failed to update subscription. Please try again.', 'error');
        }

        const data = await response.json();
        console.log("Data: ", data);
        await pollSubscriptionUpdate(priceId);
      } else {
        const response = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            priceId
          })
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          showMessage('Failed to start checkout. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showMessage('Error connecting to payment gateway. Please try again.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const getCardStyle = (priceId) => {
    if (!priceId && (!subscriptionInfo || !subscriptionInfo.status)) {
      return {
        border: '3px solid #90be55',
        boxShadow: '0 0 20px rgba(144, 190, 85, 0.3)',
        position: 'relative'
      };
    } else if (subscriptionInfo?.priceId === priceId) {
      return {
        border: '3px solid #90be55',
        boxShadow: '0 0 20px rgba(144, 190, 85, 0.3)',
        position: 'relative'
      };
    }
    return {};
  };

  return (
    <>
      <div id="cover">
        <div id="uuq">
          <div id="hederArea">
            <Header />
          </div>

          <div id="innerPlan">
            <div id="innerheading">
              <h1 style={{ position: 'relative' }}>
                {/* Anchor div for navbar navigation - ensures heading appears from start */}
                <div id="plans-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>
                {t("plan.choose_membership_title")}
              </h1>
            </div>

            {/* Message Display */}
            {message.text && (
              <div ref={messageRef} style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                backgroundColor: message.type === 'error' ? '#fee' : '#efe',
                color: message.type === 'error' ? '#c33' : '#363',
                border: `1px solid ${message.type === 'error' ? '#fcc' : '#cfc'}`
              }}>
                {message.text}
              </div>
            )}

            <div id="totalCards" ref={cardsRef}>

              {/* INDIVIDUAL PLAN */}
              <div id="Cards1" style={getCardStyle(null)}>
                {(!subscriptionInfo || !subscriptionInfo.status) && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#90be55',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
                    {t("plan.current")}
                  </div>
                )}
                <div id="inCard">
                  <h3>🟢 1. {t("plan.free_plan")}</h3>
                  <h1>{t("plan.free")}</h1>
                  <p>→ {t("plan.free_desc")}</p>
                  <div id="Listing">
                    <p>✅ {t("plan.free_listed_directory")}</p>
                    <p>❌ {t("plan.free_no_courses")}</p>
                    <p>❌ {t("plan.free_no_discounts")}</p>
                    <p>❌ {t("plan.free_no_featured")}</p>
                  </div>
                  {(subscriptionInfo && subscriptionInfo.status) &&
                    <button
                      onClick={() => handleCancelSubscription()}
                      disabled={loading === 'cancel'}
                      style={{
                        opacity: loading === 'cancel' ? 0.7 : 1,
                      }}
                    >
                      {loading === 'cancel' ? t("plan.activating") : t("plan.start_free")}
                    </button>
                  }
                </div>
              </div>

              {/* PROFESSIONAL PLAN */}
              <div id="Cards" style={getCardStyle(t("plan.pro_price_id"))}>
                {(subscriptionInfo?.priceId === t("plan.pro_price_id")) && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#90be55',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
                    {t("plan.current")}
                  </div>
                )}
                <div id="inCard">
                  <h3>🔵 2. {t("plan.pro_plan")}</h3>
                  <h1>C$29.99 / {t("plan.month")}</h1>
                  <p>→ {t("plan.pro_desc")}</p>
                  <div id="Listing">
                    <p>✅ {t("plan.pro_listed_directory")}</p>
                    <p style={{ marginLeft: '20px' }}>• {t("plan.pro_bold_text")}</p>
                    <p style={{ marginLeft: '20px' }}>• {t("plan.pro_color")}</p>
                    <p style={{ marginLeft: '20px' }}>• {t("plan.pro_larger_font")}</p>
                    <p>✅ {t("plan.pro_access_courses")}</p>
                    <p>❌ {t("plan.pro_no_discounts")}</p>
                    <p>❌ {t("plan.pro_no_featured")}</p>
                  </div>
                  {subscriptionInfo?.priceId !== t("plan.pro_price_id") &&
                    <button
                      onClick={() => handleSubscribe(t("plan.pro_price_id"))}
                      disabled={loading === t("plan.pro_price_id")}
                      style={{
                        opacity: loading === t("plan.pro_price_id") ? 0.7 : 1,
                      }}
                    >
                      {loading === t("plan.pro_price_id") ? t("plan.redirecting") : t("plan.go_pro")}
                    </button>
                  }
                </div>
              </div>

              {/* PREMIUM PLAN */}
              <div id="Cards3" style={getCardStyle(t("plan.premium_price_id"))}>
                {(subscriptionInfo?.priceId === t("plan.premium_price_id")) && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#90be55',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
                    {t("plan.current")}
                  </div>
                )}
                <div id="inCard">
                  <h3>🟣 3. {t("plan.premium_plan")}</h3>
                  <h1>C$49.99 / {t("plan.month")}</h1>
                  <p>→ {t("plan.premium_desc")}</p>
                  <div id="Listing">
                    <p>✅ {t("plan.premium_all_pro_features")}</p>
                    <p>✅ {t("plan.premium_featured_homepage")}</p>
                    <p>✅ {t("plan.premium_discounts_courses")}</p>
                    <p>✅ {t("plan.premium_access_courses")}</p>
                    <p>✅ {t("plan.premium_listed_directory")}</p>
                    <p style={{ marginLeft: '20px' }}>• {t("plan.pro_bold_text")}</p>
                    <p style={{ marginLeft: '20px' }}>• {t("plan.pro_color")}</p>
                    <p style={{ marginLeft: '20px' }}>• {t("plan.pro_larger_font")}</p>
                  </div>
                  {subscriptionInfo?.priceId !== t("plan.premium_price_id") &&
                    <button
                      onClick={() => handleSubscribe(t("plan.premium_price_id"))}
                      disabled={loading === t("plan.premium_price_id")}
                      style={{
                        opacity: loading === t("plan.premium_price_id") ? 0.7 : 1,
                      }}
                    >
                      {loading === t("plan.premium_price_id") ? t("plan.redirecting") : t("plan.go_premium")}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div id="courses">
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fa', borderRadius: '20px', margin: '40px 0' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#222', marginBottom: '20px', position: 'relative' }}>
                {/* Anchor div for navbar navigation - ensures heading appears from start */}
                <div id="courses-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>
                {t("navbar.submenu.courses")}
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                {t("plan.courses_description")}
              </p>
              <p style={{ fontSize: '1.1rem', color: '#555', marginTop: '20px', fontWeight: '500' }}>
                <strong>{t("plan.note")}:</strong> {t("plan.courses_access_note")}
              </p>
            </div>
          </div>

          <div id="Perks" ref={perksRef}>
            <h1>{t("plan.membership_perks")}</h1>
            <p>{t("plan.perk1")}</p>
            <p>{t("plan.perk2")}</p>
          </div>

          <div id="iio" ref={blockchainRef}>
            <div id="Blockchain">
              <h1>{t("plan.blockchain_title")}</h1>
              <p>{t("plan.blockchain_text")}</p>
            </div>
            <img id="imager" src="https://static.vecteezy.com/system/resources/previews/055/135/329/non_2x/3d-gold-coin-stacks-with-a-rising-arrow-representing-business-growth-investment-success-and-positive-financial-trends-free-png.png" />
          </div>

          <div id="yyy" ref={investmentRef}>
            <img id="imager2" src="https://www.tunley-environmental.com/hs-fs/hubfs/Website%20Sized%20Images/Graphics/Embodied%20Carbon%20Assessment-03.png?width=500&height=439&name=Embodied%20Carbon%20Assessment-03.png" />
            <div id="Blockchain2">
              <h1>{t("plan.investment_hub_title")}</h1>
              <p>{t("plan.investment_hub_text")}</p>
            </div>
          </div>

          <div id="Laster" ref={commitmentRef}>
            <div id="Blockchain3">
              <h1>{t("plan.commitment_title")}</h1>
              <p>{t("plan.commitment_text")}</p>
            </div>
            <img id="lasterimg" src="https://static.vecteezy.com/system/resources/thumbnails/040/735/326/small/ai-generated-silhouette-two-hand-holding-soil-with-growing-sprout-black-color-only-png.png" />
          </div>
        </div>

        <Footer2 />
      </div>
    </>
  );
};

export default Plan;
