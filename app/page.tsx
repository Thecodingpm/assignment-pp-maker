'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './components/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import AIGenerationModal from './components/AIGenerationModal';
import LogoPreviewModal from './components/LogoPreviewModal';
import LoginModal from './components/LoginModal';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState("build-presentations");
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [isLogoPreviewModalOpen, setIsLogoPreviewModalOpen] = useState(false);
  const [generatedLogoData, setGeneratedLogoData] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const templateSectionRef = useRef<HTMLDivElement>(null);
  const isVideoInView = useInView(videoSectionRef, { once: true, amount: 0.3 });
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: templateSectionRef,
    offset: ["start end", "end start"]
  });
  
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const x3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const x4 = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // Login modal handlers
  const handleLoginClick = () => {
    setLoginMode('login');
    setIsLoginModalOpen(true);
  };

  const handleSignupClick = () => {
    setLoginMode('signup');
    setIsLoginModalOpen(true);
  };

  // Logo preview modal handlers
  const handleOpenInEditor = () => {
    setIsLogoPreviewModalOpen(false);
    router.push('/logo-editor');
  };

  const handleRegenerateLogo = async () => {
    if (!generatedLogoData) return;
    
    try {
      // Get the original prompt and options from the generated data
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: generatedLogoData.prompt, 
          options: generatedLogoData.options || {} 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate logo');
      }

      const data = await response.json();
      
      // Update the generated logo data
      setGeneratedLogoData(data);
      
      // Store the new data in localStorage
      localStorage.setItem('aiGeneratedLogo', JSON.stringify(data));
      
    } catch (error) {
      console.error('Logo regeneration error:', error);
      alert('Failed to regenerate logo. Please try again.');
    }
  };

  const handleAIGeneration = async (type: 'presentation' | 'logo', prompt: string, options: any) => {
    try {
      console.log('🤖 AI Generation Request:', { type, prompt, options });
      
      if (type === 'presentation') {
        // Use existing AI generation endpoint for presentations
        const response = await fetch('/api/ai-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate presentation');
        }

        const data = await response.json();
        
        // Store the AI-generated data in localStorage
        localStorage.setItem('aiGeneratedPresentation', JSON.stringify(data));
        
        // Navigate to presentation editor
        router.push('/presentation-editor');
      } else if (type === 'logo') {
        // Use new logo generation endpoint
        const response = await fetch('/api/generate-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, options }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate logo');
        }

        const data = await response.json();
        
        console.log('🎨 Logo generation response:', data);
        
        // Store the AI-generated logo data in localStorage
        localStorage.setItem('aiGeneratedLogo', JSON.stringify(data));
        
        // Show preview modal instead of directly opening editor
        console.log('🎨 Setting logo data and opening preview modal');
        setGeneratedLogoData(data);
        setIsLogoPreviewModalOpen(true);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate content. Please try again.');
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  // Auto-play video when it comes into view
  useEffect(() => {
    if (isVideoInView && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Autoplay failed:', err));
    }
  }, [isVideoInView]);

  // Handle video changes when activeVideo changes
  useEffect(() => {
    if (videoRef.current) {
      // Reset video to beginning
      videoRef.current.currentTime = 0;
      // Play the video
      videoRef.current.play().catch(err => console.log('Video play failed:', err));
    }
  }, [activeVideo]);

  // Hide global navbar on this page
  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }
    
    return () => {
      if (navbar) {
        navbar.style.display = 'block';
      }
    };
  }, []);

  const templates = [
    { 
      id: 'agency-pitch', 
      title: 'Agency Pitch', 
      category: 'Business', 
      color: 'bg-gradient-to-br from-orange-100 to-blue-200',
      content: 'Agency Pitch',
      icon: '🏢',
    },
    { 
      id: 'sales-deck', 
      title: 'Sales Deck', 
      category: 'Sales', 
      color: 'bg-gradient-to-br from-gray-800 to-black',
      content: 'WRITE YOUR OWN STORY.',
      icon: '📱',
    },
    { 
      id: 'creative-brief', 
      title: 'Creative Brief', 
      category: 'Marketing', 
      color: 'bg-gradient-to-br from-pink-500 to-red-500',
      content: 'CREATIVE BRIEF',
      icon: '👥',
    },
    { 
      id: 'sales-pitch', 
      title: 'Sales Pitch', 
      category: 'Sales', 
      color: 'bg-gradient-to-br from-gray-100 to-gray-200',
      content: 'Sales Pitch',
      icon: '📊',
    },
    { 
      id: 'pitch-deck', 
      title: 'Pitch Deck', 
      category: 'Startup', 
      color: 'bg-gradient-to-br from-black to-gray-800',
      content: '65%',
      icon: '📈',
    },
    { 
      id: 'product-launch', 
      title: 'Product Launch', 
      category: 'Product', 
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      content: 'Product Launch',
      icon: '🚀',
    },
    { 
      id: 'board-deck', 
      title: 'Board Deck', 
      category: 'Executive', 
      color: 'bg-gradient-to-br from-black to-gray-800',
      content: 'BOARD DECK',
      icon: '💼',
    },
    { 
      id: 'brand-guidelines', 
      title: 'Brand Guidelines', 
      category: 'Design', 
      color: 'bg-gradient-to-br from-white to-gray-100',
      content: 'Brand Guidelines',
      icon: '🎨',
    },
    { 
      id: 'mutual-action-plan', 
      title: 'Mutual Action Plan', 
      category: 'Strategy', 
      color: 'bg-gradient-to-br from-gray-100 to-gray-200',
      content: 'Mutual Action Plan',
      icon: '📋',
    },
    { 
      id: 'product-launch-2', 
      title: 'Product Launch', 
      category: 'Product', 
      color: 'bg-gradient-to-br from-black to-gray-800',
      content: 'Sleep',
      icon: '😴',
    },
    { 
      id: 'sales-deck-2', 
      title: 'Sales Deck', 
      category: 'Sales', 
      color: 'bg-gradient-to-br from-white to-gray-100',
      content: 'New app made for you with love.',
      icon: '💚',
    },
    { 
      id: 'business-proposal', 
      title: 'Business Proposal', 
      category: 'Business', 
      color: 'bg-gradient-to-br from-gray-100 to-gray-200',
      content: 'Your Company',
      icon: '🤝',
    },
    { 
      id: 'concept-proposal', 
      title: 'Concept Proposal', 
      category: 'Creative', 
      color: 'bg-gradient-to-br from-blue-600 to-purple-600',
      content: 'Concept Proposal',
      icon: '💡',
    },
    { 
      id: 'sales-proposal', 
      title: 'Sales Proposal', 
      category: 'Sales', 
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      content: 'Sales Proposal',
      icon: '💰',
    },
    { 
      id: 'company-name', 
      title: 'Company Name', 
      category: 'Corporate', 
      color: 'bg-gradient-to-br from-amber-800 to-amber-900',
      content: 'COMPANY NAME',
      icon: '👁️',
    },
    { 
      id: 'series-d-pitch', 
      title: 'Series D Pitch', 
      category: 'Startup', 
      color: 'bg-gradient-to-br from-pink-400 to-blue-400',
      content: 'Series D Pitch',
      icon: '🚴',
    },
    { 
      id: 'investor-update', 
      title: 'Investor Update', 
      category: 'Investor', 
      color: 'bg-gradient-to-br from-gray-100 to-gray-200',
      content: 'Investor Update',
      icon: '🥽',
    },
    { 
      id: 'tone-of-voice', 
      title: 'Tone of Voice Guidelines', 
      category: 'Brand', 
      color: 'bg-gradient-to-br from-gray-800 to-orange-600',
      content: 'Tone of Voice Guidelines',
      icon: '🎭',
    },
    { 
      id: 'go-to-market', 
      title: 'Go-to-Market', 
      category: 'Strategy', 
      color: 'bg-gradient-to-br from-purple-400 to-pink-400',
      content: 'Go-to-Market',
      icon: '🎯',
    },
    { 
      id: 'design', 
      title: 'Design', 
      category: 'Creative', 
      color: 'bg-gradient-to-br from-gray-100 to-gray-200',
      content: 'Design',
      icon: '✋',
      description: 'Design system template'
    },
    { 
      id: 'olaf-bjorn', 
      title: 'OLAF & BJÖRN', 
      category: 'Brand', 
      color: 'bg-gradient-to-br from-gray-100 to-gray-200',
      content: 'OLAF & BJÖRN',
      icon: '👟',
      description: 'Brand showcase template'
    },
    { 
      id: 'case-study', 
      title: 'Case Study Title Here', 
      category: 'Case Study', 
      color: 'bg-gradient-to-br from-blue-600 to-orange-500',
      content: 'Case Study Title Here',
      icon: '📚'
    },
    { 
      id: 'marketing-plan', 
      title: 'Marketing Plan', 
      category: 'Marketing', 
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
      content: 'Marketing Plan',
      icon: '📈'
    },
    { 
      id: 'annual-report', 
      title: 'Annual Report', 
      category: 'Finance', 
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      content: 'Annual Report',
      icon: '📊'
    },
    { 
      id: 'team-presentation', 
      title: 'Team Presentation', 
      category: 'Internal', 
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      content: 'Team Presentation',
      icon: '👥'
    },
    { 
      id: 'client-proposal', 
      title: 'Client Proposal', 
      category: 'Business', 
      color: 'bg-gradient-to-br from-amber-500 to-yellow-500',
      content: 'Client Proposal',
      icon: '💼'
    },
    { 
      id: 'training-deck', 
      title: 'Training Deck', 
      category: 'Education', 
      color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      content: 'Training Deck',
      icon: '🎓'
    },
    { 
      id: 'portfolio-showcase', 
      title: 'Portfolio Showcase', 
      category: 'Creative', 
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
      content: 'Portfolio Showcase',
      icon: '🎨'
    },
    { 
      id: 'event-presentation', 
      title: 'Event Presentation', 
      category: 'Events', 
      color: 'bg-gradient-to-br from-emerald-500 to-green-500',
      content: 'Event Presentation',
      icon: '🎪'
    },
    { 
      id: 'research-findings', 
      title: 'Research Findings', 
      category: 'Research', 
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      content: 'Research Findings',
      icon: '🔬'
    },
    { 
      id: 'company-overview', 
      title: 'Company Overview', 
      category: 'Corporate', 
      color: 'bg-gradient-to-br from-slate-500 to-gray-500',
      content: 'Company Overview',
      icon: '🏢'
    },
    { 
      id: 'product-demo', 
      title: 'Product Demo', 
      category: 'Product', 
      color: 'bg-gradient-to-br from-sky-500 to-indigo-500',
      content: 'Product Demo',
      icon: '🛠️'
    },
    { 
      id: 'financial-forecast', 
      title: 'Financial Forecast', 
      category: 'Finance', 
      color: 'bg-gradient-to-br from-lime-500 to-green-500',
      content: 'Financial Forecast',
      icon: '💰'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" style={{ display: 'block !important' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-lg">P</span>
              </div>
              <span className="text-white font-semibold text-xl">Pitch</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="flex items-center space-x-1 text-white font-medium text-base hover:text-indigo-200 cursor-pointer">
                  <span>Product</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Invisible bridge to help with hover */}
                <div className="absolute top-full left-0 w-full h-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-40"></div>
                {/* Product Dropdown */}
                <div className="absolute top-full left-0 mt-1 w-[600px] bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 pointer-events-none group-hover:pointer-events-auto hover:opacity-100 hover:visible hover:pointer-events-auto transform group-hover:translate-y-0 translate-y-[-10px] group-hover:scale-100 scale-95">
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Left Side - Product Overview */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Overview</h3>
                        <p className="text-gray-600 text-sm mb-4">See how Pitch works and explore features</p>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            <div className="text-xs text-gray-500">+2 collaborators</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Side - Discover Pitch */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">DISCOVER PITCH</h3>
                        <div className="space-y-3">
                          <a href="#" className="block text-gray-700 hover:text-indigo-600 transition-colors">What's New</a>
                          <a href="#" className="block text-gray-700 hover:text-indigo-600 transition-colors">Integrations</a>
                          <a href="#" className="block text-gray-700 hover:text-indigo-600 transition-colors">Presentation Gallery</a>
                          <a href="#" className="block text-gray-700 hover:text-indigo-600 transition-colors">Download</a>
                          <a href="#" className="block text-gray-700 hover:text-indigo-600 transition-colors">Status</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="flex items-center space-x-1 text-white font-medium text-base hover:text-indigo-200 cursor-pointer">
                  <span>Use Cases</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Use Cases Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 pointer-events-none group-hover:pointer-events-auto hover:opacity-100 hover:visible hover:pointer-events-auto transform group-hover:translate-y-0 translate-y-[-10px] group-hover:scale-100 scale-95">
                  <div className="py-2">
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Sales Teams</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Marketing</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Education</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Startups</a>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="flex items-center space-x-1 text-white font-medium text-base hover:text-indigo-200 cursor-pointer">
                  <span>Templates</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Templates Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="py-2">
                    <a href="/templates" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">All Templates</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Business</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Creative</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Education</a>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="flex items-center space-x-1 text-white font-medium text-base hover:text-indigo-200 cursor-pointer">
                  <span>Resources</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Resources Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="py-2">
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Blog</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Help Center</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Community</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Webinars</a>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="flex items-center space-x-1 text-white font-medium text-base hover:text-indigo-200 cursor-pointer">
                  <span>Pricing</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Pricing Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="py-2">
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Free Plan</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Pro Plan</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Enterprise</a>
                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Compare Plans</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLoginClick}
                className="text-white hover:text-indigo-200 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/10"
              >
                Log in
              </button>
              <button 
                onClick={handleSignupClick}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors border border-white/20"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden min-h-screen"
        >
                    {/* Modern Curved Blue Lines Background */}
          <div className="absolute inset-0">
            {/* Dot Matrix Grid */}
            <div className="absolute inset-0 grid grid-cols-12 gap-16 p-16 opacity-20">
              {/* Row 1 */}
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-breathe"></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-breathe" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '1s' }}></div>
              <div className="w-1 h-1 bg-blue-300 rounded-full animate-breathe" style={{ animationDelay: '1.5s' }}></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-breathe" style={{ animationDelay: '2s' }}></div>
              <div className="w-1 h-1 bg-purple-300 rounded-full animate-breathe" style={{ animationDelay: '2.5s' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-breathe" style={{ animationDelay: '3s' }}></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-breathe" style={{ animationDelay: '3.5s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '4s' }}></div>
              <div className="w-1 h-1 bg-blue-300 rounded-full animate-breathe" style={{ animationDelay: '4.5s' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-breathe" style={{ animationDelay: '5s' }}></div>
              <div className="w-1 h-1 bg-purple-300 rounded-full animate-breathe" style={{ animationDelay: '5.5s' }}></div>
              
              {/* Row 2 */}
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-breathe" style={{ animationDelay: '0.8s' }}></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-breathe" style={{ animationDelay: '1.3s' }}></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '1.8s' }}></div>
              <div className="w-1 h-1 bg-blue-300 rounded-full animate-breathe" style={{ animationDelay: '2.3s' }}></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-breathe" style={{ animationDelay: '2.8s' }}></div>
              <div className="w-1 h-1 bg-purple-300 rounded-full animate-breathe" style={{ animationDelay: '3.3s' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-breathe" style={{ animationDelay: '3.8s' }}></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-breathe" style={{ animationDelay: '4.3s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '4.8s' }}></div>
              <div className="w-1 h-1 bg-blue-300 rounded-full animate-breathe" style={{ animationDelay: '5.3s' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-breathe" style={{ animationDelay: '5.8s' }}></div>
              
              {/* Row 3 */}
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-breathe" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '0.7s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-breathe" style={{ animationDelay: '1.2s' }}></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-breathe" style={{ animationDelay: '1.7s' }}></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '2.2s' }}></div>
              <div className="w-1 h-1 bg-blue-300 rounded-full animate-breathe" style={{ animationDelay: '2.7s' }}></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-breathe" style={{ animationDelay: '3.2s' }}></div>
              <div className="w-1 h-1 bg-purple-300 rounded-full animate-breathe" style={{ animationDelay: '3.7s' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-breathe" style={{ animationDelay: '4.2s' }}></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-breathe" style={{ animationDelay: '4.7s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-breathe" style={{ animationDelay: '5.2s' }}></div>
              <div className="w-1 h-1 bg-blue-300 rounded-full animate-breathe" style={{ animationDelay: '5.7s' }}></div>
            </div>
            
            {/* Large Curved Blue Shapes */}
            <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-br from-blue-400/15 via-indigo-500/12 to-purple-600/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-gradient-to-tr from-indigo-400/12 via-blue-500/10 to-purple-600/8 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/3"></div>
            
            {/* Curved Line Elements */}
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] border-2 border-blue-400/20 rounded-full blur-sm"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[250px] border-2 border-indigo-400/15 rounded-full blur-sm"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] border border-purple-400/10 rounded-full blur-sm"></div>
            
            {/* Flowing Curved Lines */}
            <div className="absolute top-1/6 right-1/6 w-[200px] h-[150px] border-t-2 border-blue-400/25 rounded-t-full blur-sm"></div>
            <div className="absolute bottom-1/6 left-1/6 w-[180px] h-[120px] border-b-2 border-indigo-400/20 rounded-b-full blur-sm"></div>
            <div className="absolute top-2/3 right-1/3 w-[160px] h-[100px] border-l-2 border-purple-400/15 rounded-l-full blur-sm"></div>
            
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/5 to-indigo-900/5"></div>
            
            {/* Beautiful Geometric Shapes */}
            {/* Hexagon */}
            <div className="absolute top-1/6 right-1/6 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-indigo-500/6 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-full h-full bg-gradient-to-br from-blue-400/4 to-indigo-500/3 rounded-full animate-pulse"></div>
            </div>
            
            {/* Diamond */}
            <div className="absolute bottom-1/6 left-1/6 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/8 transform rotate-45 blur-lg animate-float" style={{ animationDelay: '3s' }}></div>
            
            {/* Triangle */}
            <div className="absolute top-1/2 left-1/4 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-indigo-400/12 blur-md animate-float" style={{ animationDelay: '2s' }}></div>
            
            {/* Star */}
            <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-blue-300/8 to-indigo-400/6 transform rotate-12 blur-lg animate-float" style={{ animationDelay: '4s' }}>
              <div className="w-full h-full bg-gradient-to-br from-blue-300/4 to-indigo-400/3 transform rotate-45 animate-pulse"></div>
            </div>
            
            {/* Octagon */}
            <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-gradient-to-br from-purple-300/6 to-pink-400/4 rounded-lg blur-xl animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-full h-full bg-gradient-to-br from-purple-300/3 to-pink-400/2 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Crescent */}
            <div className="absolute top-2/3 left-1/3 w-20 h-20 bg-gradient-to-br from-indigo-300/8 to-blue-400/6 rounded-full blur-lg animate-float" style={{ animationDelay: '2.5s' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-900 rounded-full transform translate-x-2 translate-y-1"></div>
        </div>

            {/* Floating Accent Dots */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400/40 rounded-full animate-float"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-indigo-400/35 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-purple-400/30 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-blue-300/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            
            {/* Subtle Grid Lines */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '120px 120px'
            }}></div>
          </div>

          <div className="relative z-10 w-full px-6 py-20 text-center">
            {/* Typewriter-style heading */}
            <motion.div
              variants={fadeInUp}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight mt-8">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Win more deals.
                </motion.span>
                <br />
                <motion.span 
                  className="text-indigo-200"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Pitch.
                </motion.span>
              </h1>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-12"
            >
              Pitch turns presentations into your team's superpower. 
              Close deals, win clients, and expand accounts — all while staying on brand.
            </motion.p>

            {/* Demo and Signup Buttons - Before Feature Navigation */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/presentation-editor"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  Start New Presentation
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/templates"
                  className="bg-indigo-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-600 transition-all duration-300 border-2 border-white/20"
                >
                  Get a demo
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setIsAIGenerationModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 border-2 border-white/20 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Generate
                </button>
              </motion.div>
            </motion.div>

            {/* Feature Navigation Section - Inside Hero */}
            <motion.div 
              variants={staggerContainer}
              className="flex justify-center space-x-16 mb-16"
            >
              
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  ),
                  title: "PITCH",
                  description: "Build presentations",
                  videoId: "build-presentations",
                  videoSrc: "/videos/build-presentations.mp4"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  ),
                  title: "DESIGN",
                  description: "Beautiful templates",
                  videoId: "beautiful-templates",
                  videoSrc: "/videos/beautiful-templates.mp4"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                  title: "COLLABORATE",
                  description: "Real-time editing",
                  videoId: "real-time-editing",
                  videoSrc: "/videos/real-time-editing.mp4"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  ),
                  title: "ANALYZE",
                  description: "Track progress",
                  videoId: "track-progress",
                  videoSrc: "/videos/track-progress.mp4"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-center cursor-pointer group"
                  onClick={() => setActiveVideo(feature.videoId)}
                >
                  <div className="mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto transition-all duration-300 ${
                      activeVideo === feature.videoId 
                        ? 'bg-indigo-400/80 shadow-lg shadow-indigo-400/30' 
                        : 'bg-white/20 group-hover:bg-indigo-300/40'
                    }`}>
                      <div className={`${activeVideo === feature.videoId ? 'text-white' : 'text-white/70 group-hover:text-indigo-200'}`}>
                        {feature.icon}
                  </div>
                </div>
              </div>
                  <h3 className={`text-sm font-medium tracking-wider ${
                    activeVideo === feature.videoId 
                      ? 'text-indigo-200' 
                      : 'text-white/70 group-hover:text-indigo-200'
                  }`}>{feature.title}</h3>
                  <p className={`text-xs mt-1 ${
                    activeVideo === feature.videoId 
                      ? 'text-indigo-300/80' 
                      : 'text-white/50 group-hover:text-indigo-300/60'
                  }`}>{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

                        {/* Video Section - Inside Hero */}
            <motion.div 
              ref={videoSectionRef}
              variants={fadeIn}
              className="mb-20 mt-12 w-full flex justify-center items-center -mx-6"
            >
              <motion.div 
                className="relative w-[60vw] h-[720px] bg-gradient-to-br from-slate-800 to-indigo-900 rounded-3xl shadow-2xl border border-slate-600 overflow-hidden"
                key={activeVideo}
                initial={{ opacity: 0, scale: 0.95, rotateY: -15 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotateY: 0,
                  transition: { 
                    duration: 0.6, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }
                }}
                exit={{ opacity: 0, scale: 0.95, rotateY: 15 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Video Player */}
                <motion.div 
                  className="w-full h-full relative"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { 
                      delay: 0.2,
                      duration: 0.5 
                    }
                  }}
                >
                  <motion.video
                    ref={videoRef}
                    key={activeVideo}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { 
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }}
                    onError={(e) => console.error('Video error:', e)}
                    onLoadStart={() => console.log('Video loading started')}
                    onCanPlay={() => console.log('Video can play')}
                    onEnded={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(err => console.log('Video restart failed:', err));
                      }
                    }}
                  >
                    <source src="/videos/video1.mov" type="video/quicktime" />
                    <source src="/videos/video1.mov" type="video/mp4" />
                    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </motion.video>
                  
                  {/* Animated Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { 
                        delay: 0.4,
                        duration: 0.6 
                      }
                    }}
                  />
                  
                  {/* Glowing Border Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: 'linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
                      backgroundSize: '200% 200%'
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
        </div>
        </motion.section>

        {/* Templates Section */}
        <section ref={templateSectionRef} className="py-20 bg-white relative overflow-hidden">
          <div className="w-full px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className="text-center mb-16 px-6"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Get a head start with free templates</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Choose from 100+ fully customizable templates crafted by subject matter experts and presentation design pros. Or upload your existing PPTX file.
              </p>
              <Link 
                href="/templates"
                className="text-indigo-600 hover:text-indigo-700 font-medium text-lg inline-flex items-center group"
              >
                Explore the templates gallery
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            {/* Animated Template Grid */}
            <div className="relative w-full -mx-6">
              {/* Row 1 - Moving Left */}
              <motion.div 
                style={{ x: x1 }}
                className="flex gap-2 mb-3 overflow-visible w-full"
              >
                {templates.slice(0, 10).map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="group cursor-pointer flex-shrink-0"
                    onMouseEnter={() => setHoveredCard(template.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={`
                      relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-500 w-64 h-40 flex-shrink-0
                      ${hoveredCard === template.id ? 'shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}
                    `}>
                      <div className={`${template.color} h-full flex items-center justify-center relative overflow-hidden`}>
                        {/* Random template image for all */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl">{template.icon}</span>
                          </div>
            </div>

                      </div>
                      
                      {/* Hover overlay */}
                      <div className={`
                        absolute inset-0 bg-indigo-600/90 flex items-center justify-center opacity-0 transition-opacity duration-300
                        ${hoveredCard === template.id ? 'opacity-100' : ''}
                      `}>
                        <div className="text-white text-center">
                          <div className="text-2xl mb-2">✨</div>
                          <div className="text-sm font-medium">Use Template</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Row 2 - Moving Right */}
              <motion.div 
                style={{ x: x2 }}
                className="flex gap-2 mb-3 overflow-visible w-full"
              >
                {templates.slice(10, 20).map((template, index) => (
                  <motion.div
                  key={template.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="group cursor-pointer flex-shrink-0"
                  onMouseEnter={() => setHoveredCard(template.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`
                      relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-500 w-64 h-40 flex-shrink-0
                      ${hoveredCard === template.id ? 'shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}
                    `}>
                      <div className={`${template.color} h-full flex items-center justify-center relative overflow-hidden`}>
                        {/* Random template image for all */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl">{template.icon}</span>
                          </div>
                      </div>
                      
                      <div className="text-center text-white relative z-10">
                          <div className="text-2xl mb-2">{template.icon}</div>
                          <div className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                          {template.content}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-gray-500 text-xs">{template.category}</p>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className={`
                      absolute inset-0 bg-indigo-600/90 flex items-center justify-center opacity-0 transition-opacity duration-300
                      ${hoveredCard === template.id ? 'opacity-100' : ''}
                    `}>
                      <div className="text-white text-center">
                        <div className="text-2xl mb-2">✨</div>
                        <div className="text-sm font-medium">Use Template</div>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Row 3 - Moving Left */}
              <motion.div 
                style={{ x: x3 }}
                className="flex gap-2 mb-3 overflow-visible w-full"
              >
                {templates.slice(20, 30).map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="group cursor-pointer flex-shrink-0"
                    onMouseEnter={() => setHoveredCard(template.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={`
                      relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-500 w-64 h-40 flex-shrink-0
                      ${hoveredCard === template.id ? 'shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}
                    `}>
                      <div className={`${template.color} h-full flex items-center justify-center relative overflow-hidden`}>
                        {/* Random template image for all */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl">{template.icon}</span>
            </div>
                        </div>
                        
                      </div>
                      
                      {/* Hover overlay */}
                      <div className={`
                        absolute inset-0 bg-indigo-600/90 flex items-center justify-center opacity-0 transition-opacity duration-300
                        ${hoveredCard === template.id ? 'opacity-100' : ''}
                      `}>
                        <div className="text-white text-center">
                          <div className="text-2xl mb-2">✨</div>
                          <div className="text-sm font-medium">Use Template</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

            </div>
          </div>
        </section>

        {/* Manual Scroller Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse All Templates</h3>
              <p className="text-gray-600">Use the controls below to manually scroll through our template collection</p>
            </div>

            {/* Manual Scroller Controls */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <button 
                onClick={() => {
                  const container = document.getElementById('manual-scroll-container');
                  if (container) {
                    container.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              
              <button 
                onClick={() => {
                  const container = document.getElementById('manual-scroll-container');
                  if (container) {
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Manual Scroll Container */}
            <div 
              id="manual-scroll-container"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {templates.map((template, index) => (
                <div
                  key={template.id}
                  className="group cursor-pointer flex-shrink-0"
                  onMouseEnter={() => setHoveredCard(template.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`
                    relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-500 w-64 h-40
                    ${hoveredCard === template.id ? 'shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}
                  `}>
                    <div className={`${template.color} h-full flex items-center justify-center relative overflow-hidden`}>
                      {/* Template image */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center shadow-lg">
                          <span className="text-white text-2xl">{template.icon}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className={`
                      absolute inset-0 bg-indigo-600/90 flex items-center justify-center opacity-0 transition-opacity duration-300
                      ${hoveredCard === template.id ? 'opacity-100' : ''}
                    `}>
                      <div className="text-white text-center">
                        <div className="text-2xl mb-2">✨</div>
                        <div className="text-sm font-medium">Use Template</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Progress Indicator */}
            <div className="mt-6 flex justify-center">
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Get started with Pitch</h2>
              <button className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors">
                Sign up for free
              </button>
            </div>

            {/* Features List */}
            <div className="flex justify-center space-x-12 mb-16">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">Unlimited presentations</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">Unlimited sharing links</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">Custom templates</span>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative">
              {/* Main Dashboard */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-2 scale-95">
                {/* Dashboard Header */}
                <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <span className="font-semibold text-gray-900">SW SpaceWork</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0 1 15 0v5z" />
                      </svg>
                    </div>
                    <span className="text-gray-600 font-medium">Recents</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="flex space-x-8">
                    {/* Left Sidebar */}
                    <div className="w-64">
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="text-gray-500 text-sm mb-2">Q Search & commands</div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 text-lg">+</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Start new presentation</div>
                            <div className="text-sm text-gray-500">Choose from 100+ templates</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 text-lg">★</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Start with AI</div>
                            <div className="text-sm text-gray-500">Create from a prompt</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 text-lg">📁</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Import file</div>
                            <div className="text-sm text-gray-500">Add PowerPoint files to Pitch</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                      <div className="flex space-x-6 mb-6">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">By me</button>
                        <button className="px-4 py-2 text-gray-500 hover:text-gray-700">By everyone</button>
                      </div>
                      
                      {/* Presentation Grid */}
                      <div className="grid grid-cols-3 gap-6">
                        {/* Presentation 1 */}
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 h-48 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl">🌍</span>
                            </div>
                            <div className="text-white/80 text-sm">Just now</div>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">Company overview</h3>
                            <p className="text-white/80 text-sm">In Sales - Updated just now</p>
                          </div>
                        </div>

                        {/* Presentation 2 */}
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-6 h-48 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl">✈️</span>
                            </div>
                            <div className="text-white/80 text-sm">Just now</div>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">Team bulletin</h3>
                            <p className="text-white/80 text-sm">In Bulletins - Updated just now</p>
                          </div>
                        </div>

                        {/* Presentation 3 */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-6 h-48 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl">💰</span>
                            </div>
                            <div className="text-white/80 text-sm">39m ago</div>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">Series B funding</h3>
                            <p className="text-white/80 text-sm">In Company - Updated 39 minutes ago</p>
                          </div>
                        </div>

                        {/* Presentation 4 */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-6 h-48 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl">⚙️</span>
                            </div>
                            <div className="text-white/80 text-sm">2h ago</div>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">Series A</h3>
                            <p className="text-white/80 text-sm">In Company - Updated 2 hours ago</p>
                          </div>
                        </div>

                        {/* Presentation 5 */}
                        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg p-6 h-48 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl">🚀</span>
                            </div>
                            <div className="text-white/80 text-sm">1d ago</div>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">Sales</h3>
                            <p className="text-white/80 text-sm">In Sales - Updated 1 day ago</p>
                          </div>
                        </div>

                        {/* Presentation 6 */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 h-48 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl">📊</span>
                            </div>
                            <div className="text-white/80 text-sm">3d ago</div>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">Quarterly</h3>
                            <p className="text-white/80 text-sm">In Finance - Updated 3 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Mockup */}
              <div className="absolute -left-16 -top-8 w-64 h-96 bg-black rounded-3xl p-2 transform -rotate-12 scale-75">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">SW SpaceWork</span>
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-gray-500 text-xs">Q Search</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-3">Recently edited</div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
                        <div className="text-white font-medium text-sm">Company overview</div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3">
                        <div className="text-white font-medium text-sm">Team bulletin</div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-3">
                        <div className="text-white font-medium text-sm">Series B funding</div>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="text-xs text-gray-500">Workspace</div>
                      <div className="text-xs text-gray-500">Shared with me</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Simple, transparent pricing</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose the plan that's right for your team. All plans include our core features with no hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600 mb-8">Perfect for individuals and small teams getting started</p>
                  
                  <button className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Get started
                  </button>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Up to 3 presentations</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Basic templates</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Public sharing</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Basic analytics</span>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-indigo-600 text-white rounded-2xl p-8 relative transform scale-105 shadow-2xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$20</span>
                    <span className="text-indigo-200">/month</span>
                  </div>
                  <p className="text-indigo-200 mb-8">Perfect for growing teams and professionals</p>
                  
                  <button className="w-full bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Start free trial
                  </button>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Unlimited presentations</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Premium templates</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>AI-powered features</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Team collaboration</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Priority support</span>
                  </div>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  </div>
                  <p className="text-gray-600 mb-8">For large organizations with advanced needs</p>
                  
                  <button className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Contact sales
                  </button>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Everything in Pro</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">SSO & security</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Custom branding</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20">
              <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently asked questions</h3>
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Can I change plans anytime?</h4>
                  <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.</p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial?</h4>
                  <p className="text-gray-600">Yes, we offer a 14-day free trial for all paid plans. No credit card required to get started.</p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">What payment methods do you accept?</h4>
                  <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Can I cancel anytime?</h4>
                  <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access to your account until the end of your billing period.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Loved by teams worldwide</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See what our customers are saying about their experience with Pitch
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    S
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Sarah Chen</h4>
                    <p className="text-gray-600 text-sm">VP of Sales, TechCorp</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Pitch has completely transformed how we create presentations. What used to take hours now takes minutes, and our clients are blown away by the quality."
                </p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Michael Rodriguez</h4>
                    <p className="text-gray-600 text-sm">Marketing Director, StartupXYZ</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "The AI features are incredible. I can generate professional presentations in seconds, and the templates are exactly what we need for our brand."
                </p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    A
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Alex Thompson</h4>
                    <p className="text-gray-600 text-sm">CEO, InnovateLab</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Our team collaboration has never been better. Everyone can work on presentations simultaneously, and the real-time updates are seamless."
                </p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">50K+</div>
                <div className="text-gray-600">Active users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">1M+</div>
                <div className="text-gray-600">Presentations created</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">4.9/5</div>
                <div className="text-gray-600">User rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to create amazing presentations?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of teams already using Pitch to create, collaborate, and present with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Start free trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors">
                Schedule a demo
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-lg">P</span>
                  </div>
                  <span className="text-white font-semibold text-xl">Pitch</span>
                </div>
                <p className="text-gray-400 mb-4">
                  The modern way to create, collaborate, and present with confidence.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Templates</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400">&copy; 2024 Pitch. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* AI Generation Modal */}
      <AIGenerationModal 
        isOpen={isAIGenerationModalOpen} 
        onClose={() => setIsAIGenerationModalOpen(false)}
        onGenerate={handleAIGeneration}
      />

      {/* Logo Preview Modal */}
      {generatedLogoData && (
        <LogoPreviewModal
          isOpen={isLogoPreviewModalOpen}
          onClose={() => setIsLogoPreviewModalOpen(false)}
          logoData={generatedLogoData}
          onOpenInEditor={handleOpenInEditor}
          onRegenerate={handleRegenerateLogo}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        mode={loginMode}
        onModeChange={setLoginMode}
      />

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
