import { useRef } from "react";
import { IoHeartOutline } from "react-icons/io5";
import "./assets/css/style.css";
import ctaImage from "./assets/images/cta-banner.jpg";

const CTA = () => {
  const ctaRef = useRef(null);
  const contentRef = useRef(null);
  const bannerRef = useRef(null);
  const buttonRef = useRef(null);

  // useEffect(() => {
  //   // Animate CTA section on scroll
  //   if (ctaRef.current) {
  //     // Scroll-triggered animations
  //     if (contentRef.current) {
  //       scrollTriggerAnimation(contentRef.current, slideInLeft, "top 85%");
  //     }
      
  //     if (bannerRef.current) {
  //       scrollTriggerAnimation(bannerRef.current, slideInRight, "top 85%");
  //     }
      
  //     // Continuous animations
  //     setTimeout(() => {
  //       if (bannerRef.current) {
  //         floatingAnimation(bannerRef.current, 3);
  //       }
        
  //       if (buttonRef.current) {
  //         continuousCardFloat(buttonRef.current, 0.5);
  //         continuousCardPulse(buttonRef.current, 0.7);
  //       }
  //     }, 1500);
  //   }
  // }, []);

  return (
    <section className="section cta" ref={ctaRef}>
      <div className="container">
        <div className="cta-content" ref={contentRef}>
          <h2 className="h2 section-title">324+ Trusted Global Partners</h2>
          <button className="btn btn-outline" ref={buttonRef}>
            <span>Become a Partner</span>
            <IoHeartOutline aria-hidden="true" />
          </button>
        </div>

        <figure className="cta-banner" ref={bannerRef}>
          <img
            src={ctaImage}
            width="520"
            height="228"
            loading="lazy"
            alt="Fox"
            className="img-cover"
          />
        </figure>
      </div>
    </section>
  );
};

export default CTA;
