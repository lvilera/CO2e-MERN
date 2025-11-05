import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IoChevronForwardOutline,
  IoCloseOutline,
  IoHeartOutline,
  IoMenuOutline
} from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { API_BASE } from '../config';
import "./assets/css/style.css";

const COURSE_TITLE = "Net Zero Carbon Strategy for Business";

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [hasCourse, setHasCourse] = useState(false);
  const [userPackage, setUserPackage] = useState('');

  // Helper function for smooth scrolling to anchors
  const scrollToAnchor = (anchorId) => {
    setTimeout(() => {
      const anchor = document.getElementById(anchorId);
      if (anchor) {
        // Determine current header height (supports #hhw or .header)
        const headerEl = document.querySelector('#hhw') || document.querySelector('header.header');
        const headerOffset = headerEl ? headerEl.offsetHeight : 0;

        const rect = anchor.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = scrollTop + rect.top - (headerOffset + 10); // keep a tiny gap

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure DOM is ready
  };

  // Load language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    window.addEventListener('storage', checkLogin);
    // Listen for login changes in the same tab
    const interval = setInterval(checkLogin, 500);
    return () => {
      window.removeEventListener('storage', checkLogin);
      clearInterval(interval);
    };
  }, []);

  // Fetch user info from backend for navbar logic
  useEffect(() => {
    console.log("isLoggedIn: ", isLoggedIn);
    if (isLoggedIn && localStorage.getItem('isInstructor') !== 'true') {
      fetch(`${API_BASE}/api/me`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.courses) && data.courses.includes(COURSE_TITLE)) {
            setHasCourse(true);
          }
          setUserPackage((data.package || '').toLowerCase().replace(' plan', '').trim());
        })
        .catch((err) => {
          setHasCourse(false);
          setUserPackage('');
        });
    } else {
      setHasCourse(false);
      setUserPackage('');
    }
  }, [isLoggedIn]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem("selectedLanguage", newLang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('package');
    localStorage.removeItem('hasCourse');
    localStorage.removeItem('purchasedPackage');
    localStorage.removeItem('fallbackToken'); // Clear fallback token
    setIsLoggedIn(false);
    setHasCourse(false);
    setUserPackage('');
    window.location.href = '/';
  };

  return (
    <>
      <header id="hhw" className="header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1>
            <a href="#" className="logo"><img id="logoo" src="/Logo.png" /></a>
          </h1>

          {/* Language Dropdown */}
          <select
            name="language"
            className="lang-switch"
            onChange={handleLanguageChange}
            value={i18n.language}
          >
            <option id="hos" value="en">English</option>
            <option id="hos" value="fr">Français</option>
            <option id="hos" value="es">Español</option>
          </select>

          {/* Open Menu Button */}
          <button
            className="nav-open-btn"
            aria-label="Open Menu"
            onClick={() => setNavOpen(true)}
          >
            <IoMenuOutline />
          </button>

          {/* Navigation Menu */}
          <nav className={`navbar ${navOpen ? "active" : ""}`}>
            <button
              className="nav-close-btn"
              aria-label="Close Menu"
              onClick={() => setNavOpen(false)}
            >
              <IoCloseOutline />
            </button>

            <a href="#" className="logo">{t("navbar.logo")}</a>

            <ul className="navbar-list">
              {/* Home Dropdown */}
              <li className="dropdown">
                <span
                  className="navbar-link"
                  onClick={() => { setNavOpen(false); window.location.href = '/'; }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <span id="hos" style={location.pathname === '/' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>
                    {t("navbar.home")}
                  </span>
                  <IoChevronForwardOutline style={{ marginLeft: 6 }} />
                </span>
                <ul className="dropdown-menu">
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/') {
                      // If already on home page, scroll smoothly to the anchor
                      scrollToAnchor('about-anchor');
                    } else {
                      // If on different page, navigate to home with anchor
                      window.location.href = '/#about-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.why_choose_us")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/') {
                      // If already on home page, scroll smoothly to the anchor
                      scrollToAnchor('service-anchor');
                    } else {
                      // If on different page, navigate to home with anchor
                      window.location.href = '/#service-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.what_we_do")}</span></li>
                </ul>
              </li>
              {/* Service Dropdown */}
              <li className="dropdown">
                <span className="navbar-link" onClick={() => { setNavOpen(false); window.location.href = '/service'; }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span id="hos" style={location.pathname === '/service' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>
                    {t("navbar.service")}
                  </span>
                  <IoChevronForwardOutline style={{ marginLeft: 6 }} />
                </span>
                <ul className="dropdown-menu">
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/service') {
                      scrollToAnchor('directory-listing-anchor');
                    } else {
                      window.location.href = '/service#directory-listing-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.directory_listing")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/service') {
                      scrollToAnchor('fcourse-anchor');
                    } else {
                      window.location.href = '/service#fcourse-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.corporate_training_courses")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/service') {
                      scrollToAnchor('carbon-footprint-anchor');
                    } else {
                      window.location.href = '/service#carbon-footprint-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.carbon_footprint_assessment")}</span></li>
                  <li><span id="hos" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff', textShadow: '0 0 2px #90be55' }}>{t("navbar.submenu.edu_ficelle")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/service') {
                      scrollToAnchor('satellite-verified-anchor');
                    } else {
                      window.location.href = '/service#satellite-verified-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.satellite_verified_offset_project_explorer")} <span style={{ color: 'green' }}>{t("navbar.submenu.soon")}</span></span></li>
                </ul>
              </li>
              {/* Pricing Dropdown */}
              <li className="dropdown">
                <span className="navbar-link" onClick={() => { setNavOpen(false); window.location.href = '/pricing'; }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span id="hos" style={location.pathname === '/pricing' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>
                    {t("navbar.pricing")}
                  </span>
                  <IoChevronForwardOutline style={{ marginLeft: 6 }} />
                </span>
                <ul className="dropdown-menu">
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/pricing') {
                      scrollToAnchor('plans-anchor');
                    } else {
                      window.location.href = '/pricing#plans-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.plans")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/pricing') {
                      scrollToAnchor('courses-anchor');
                    } else {
                      window.location.href = '/pricing#courses-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.courses")}</span></li>
                </ul>
              </li>
              {/* Products Dropdown */}
              <li className="dropdown">
                <span className="navbar-link" onClick={() => { setNavOpen(false); window.location.href = '/products'; }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span id="hos" style={location.pathname === '/products' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>
                    {t("navbar.products")}
                  </span>
                   
                </span>
                
              </li>
              {/* News Dropdown */}
              <li className="dropdown">
                <span className="navbar-link" onClick={() => { setNavOpen(false); window.location.href = '/news'; }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span id="hos" style={location.pathname === '/news' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>
                    {t("navbar.news")}
                  </span>
                  <IoChevronForwardOutline style={{ marginLeft: 6 }} />
                </span>
                <ul className="dropdown-menu">
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/news') {
                      scrollToAnchor('news-heading-anchor');
                    } else {
                      window.location.href = '/news#news-heading-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.news")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/news') {
                      scrollToAnchor('blog-heading-anchor');
                    } else {
                      window.location.href = '/news#blog-heading-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.blog")}</span></li>
                </ul>
              </li>


              {/* Resources Dropdown (was Trade) */}
              <li className="dropdown">
                <span className="navbar-link" onClick={() => { setNavOpen(false); window.location.href = '/trade'; }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span id="hos" style={location.pathname === '/trade' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>
                    {t("navbar.resources")}
                  </span>
                  <IoChevronForwardOutline style={{ marginLeft: 6 }} />
                </span>
                <ul className="dropdown-menu">
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/trade') {
                      scrollToAnchor('logp2a-anchor');
                    } else {
                      window.location.href = '/trade#logp2a-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.decarbxchange")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/trade') {
                      scrollToAnchor('carbon-guides-section-anchor');
                    } else {
                      window.location.href = '/trade#carbon-guides-section-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.carbon_offsetting_guides")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/trade') {
                      scrollToAnchor('calculator-section-anchor');
                    } else {
                      window.location.href = '/trade#calculator-section-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.tools_resources")}</span></li>
                  <li><span id="hos" onClick={() => {
                    setNavOpen(false);
                    if (location.pathname === '/trade') {
                      scrollToAnchor('partners-section-anchor');
                    } else {
                      window.location.href = '/trade#partners-section-anchor';
                    }
                  }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.our_partners")}</span></li>
                </ul>
              </li>

              {/* Resources Dropdown (was Trade) */}
             {isLoggedIn && (<li className="dropdown" style={{ whiteSpace: 'nowrap' }}>
                <span className="navbar-link" onClick={() => { setNavOpen(false); window.location.href = '/audit-toolkit'; }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span id="hos" style={location.pathname === '/audit-toolkit' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>
                    {t("navbar.auditToolkit")}
                  </span>
                   
                </span>
                 
              </li>)}
              {/* Show 'BCourses' for Pro/Premium users, never show 'Courses' */}
              {isLoggedIn && (userPackage === 'pro' || userPackage === 'premium') && (
                <li>
                  <Link to="/buy-courses" className="navbar-link" onClick={() => setNavOpen(false)}>
                    <span id="hos" style={location.pathname === '/buy-courses' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>{t("navbar.submenu.bcourses")}</span>
                    <IoChevronForwardOutline />
                  </Link>
                </li>
              
                )}
              {isLoggedIn && localStorage.getItem('isInstructor') !== 'true' && (
                <li>
                  <Link to="/directory" className="navbar-link" onClick={() => setNavOpen(false)}>
                    <span id="hos" style={location.pathname === '/directory' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>{t("navbar.submenu.directory")}</span>
                    <IoChevronForwardOutline />
                  </Link>
                </li>
              )}
              {(isLoggedIn && localStorage.getItem('isInstructor') === 'true') && (
                <li>
                  <Link to="/slots" className="navbar-link" onClick={() => setNavOpen(false)}>
                    <span id="hos" style={location.pathname === '/slots' ? { borderBottom: '2px solid #90be55', display: 'inline-block' } : {}}>{t("navbar.submenu.slots")}</span>
                    <IoChevronForwardOutline />
                  </Link>
                </li>
              )}
              {/* Login Dropdown */}
              {!isLoggedIn && (
                <li className="dropdown">
                  <span className="navbar-link" onClick={() => { setNavOpen(false); window.location.href = '/login'; }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span id="hos2" style={location.pathname === '/login' ? { display: 'inline-block' } : {}}>
                      {t("navbar.login")}
                    </span>
                    <IoChevronForwardOutline style={{ marginLeft: 6 }} />
                  </span>
                  <ul className="dropdown-menu">
                    <li><span id="hos" onClick={() => { setNavOpen(false); window.location.href = '/login'; }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.login")}</span></li>
                    <li><span id="hos" onClick={() => { setNavOpen(false); window.location.href = '/contact'; }} style={{ cursor: 'pointer' }}>{t("navbar.submenu.contact_us")}</span></li>
                  </ul>
                </li>
              )}
            </ul>
          </nav>

          <div className="header-action" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {!isLoggedIn && (
              <Link id="hos" to="/signup">
                <button className="btn btn-primary">
                  <span>{t("join_now")}</span>
                  <IoHeartOutline />
                </button>
              </Link>
            )}
            {isLoggedIn && (
              <button id="hos" className="btn btn-primary" style={{ background: '#e74c3c', border: 'none' }} onClick={handleLogout}>
                {t('logout')}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
