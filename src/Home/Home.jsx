// src/pages/Home.jsx
import React, { useEffect } from "react";
import Hero from "./Hero";
import Features from "./Features";
import FeaturedListings from "./FeaturedListings";
import About from "./About";
import CTA from "./CTA";
import PartnerSection from "./PartnerSection";
import Service from "./Service";
import DonateSection from "./Donate";
import TestimonialsPartnerEventInsta from "./TestimonialsPartnerEventInsta";
import Header from "./Header";
import Footer2 from "./Footer2";
import CursorEyes from "../components/CursorEyes";

const Home = () => {
  // Handle anchor navigation when page loads
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

      scrollWithHeaderOffset();
      setTimeout(scrollWithHeaderOffset, 100);
      setTimeout(scrollWithHeaderOffset, 500);
      setTimeout(scrollWithHeaderOffset, 1000);
    }
  }, []);

  return (
    <>
    <div id="ffgq">
    <Header/>
    </div>
      <Hero />
      <Features />
      <FeaturedListings />
      <About />
      <PartnerSection />
      <Service />
      <DonateSection />
      <CursorEyes />
      <TestimonialsPartnerEventInsta />
      <Footer2/>
    </>
  );
};

export default Home;
