import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import "./Product.css";
import Header from '../Home/Header';
import Footer2 from '../Home/Footer2';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Product = () => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const [loading, setLoading] = useState(null); // Track which button is loading
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' }); // For success/error messages

    // Refs for animations
    const messageRef = useRef(null);
    const cardsRef = useRef(null);

    const fetchProducts = async () => {
        fetch(`${API_BASE}/api/products`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setProducts(data);
                }
            })
            .catch(() => {
                setProducts([]);
            });
    };

    // Fetch user's current package
    useEffect(() => {
        fetchProducts();
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

    const initializeAnimations = useCallback(() => {

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
    }, [message]);

    useEffect(() => {
        // Initialize animations
        initializeAnimations();
    }, [initializeAnimations]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handlePurchase = async (product) => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        setLoading(product.title);
        try {
            const response = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    priceId: product.stripePriceId,
                    mode: "payment",
                    type: "product",
                    quantity: 1
                })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                showMessage('Failed to start checkout. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            showMessage('Error connecting to payment gateway. Please try again.', 'error');

        } finally {
            setLoading(null);
        }
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
                                <div id="products-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>
                                Shop Our Products
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

                        <div id="productTotalCards" ref={cardsRef}>
                            {(products && products.length > 0) && (
                                products.map((product, index) => (
                                    <div id={`Product-Cards${index + 1}`} className='product-card' key={index}>
                                        <div id="inCard">
                                            <h1>{product.title}</h1>
                                            <img src={product.imageURL} alt={product.title} />
                                            <h2>C${product.price}</h2>
                                            <h4>Description:</h4>
                                            <p>{product.description}</p>
                                            <button
                                                onClick={() => handlePurchase(product)}
                                                disabled={loading}
                                                style={{
                                                    opacity: loading === product.title ? 0.7 : 1,
                                                }}
                                            >
                                                {loading !== product.title ? "Buy Now" : "Processing"}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <Footer2 />
            </div>
        </>
    );
};

export default Product;