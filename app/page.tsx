'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './components/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import AIGenerationModal from './components/AIGenerationModal';
import LoginModal from './components/LoginModal';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState("build-presentations");
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const isVideoInView = useInView(videoSectionRef, { once: true, amount: 0.3 });

  // Login modal handlers
  const handleLoginClick = () => {
    setLoginMode('login');
    setIsLoginModalOpen(true);
  };

  const handleSignupClick = () => {
    setLoginMode('signup');
    setIsLoginModalOpen(true);
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
        
        // Store the AI-generated logo data in localStorage
        localStorage.setItem('aiGeneratedLogo', JSON.stringify(data));
        
        // Navigate to logo editor
        router.push('/logo-editor');
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
      color: 'bg-gradient-to-br from-gray-100 to-gray-200',
      content: 'Agency Pitch',
      icon: '🏢'
    },
    { 
      id: 'sales-deck', 
      title: 'Sales Deck', 
      category: 'Sales', 
      color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      content: 'WRITE YOUR OWN STORY.',
      icon: '📱'
    },
    { 
      id: 'creative-brief', 
      title: 'Creative Brief', 
      category: 'Marketing', 
      color: 'bg-gradient-to-br from-pink-500 to-red-500',
      content: 'Creative Brief',
      icon: '🎨'
    },
    { 
      id: 'financial-report', 
      title: 'Financial Report', 
      category: 'Finance', 
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      content: 'Financial Report',
      icon: '💰'
    },
    { 
      id: 'product-launch', 
      title: 'Product Launch', 
      category: 'Product', 
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      content: 'Product Launch',
      icon: '🚀'
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
            <div className="flex items-center space-x-6" style={{ display: 'flex !important', visibility: 'visible !important' }}>
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
                  className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg block"
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
                  className="bg-indigo-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-600 transition-all duration-300 border-2 border-white/20 block"
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 border-2 border-white/20 block flex items-center gap-2"
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
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
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
            </div>

            {/* Templates Grid with Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {templates.map((template, index) => (
                <div
                  key={template.id}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredCard(template.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className={`
                    relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-500 
                    ${hoveredCard === template.id ? 'shadow-xl scale-110 rotate-2' : 'hover:shadow-lg hover:scale-105'}
                    transform hover:-translate-y-2
                  `}>
                    <div className={`${template.color} h-32 flex items-center justify-center relative overflow-hidden`}>
                      {/* Animated background elements */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-2 right-2 w-8 h-8 bg-white/30 rounded-full animate-ping"></div>
                        <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/20 rounded-full animate-bounce"></div>
                      </div>
                      
                      <div className="text-center text-white relative z-10">
                        <div className="text-3xl mb-2 animate-pulse">{template.icon}</div>
                        <div className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
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
            </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* AI Generation Modal */}
      <AIGenerationModal 
        isOpen={isAIGenerationModalOpen} 
        onClose={() => setIsAIGenerationModalOpen(false)}
        onGenerate={handleAIGeneration}
      />

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
      `}</style>
    </div>
  );
}
