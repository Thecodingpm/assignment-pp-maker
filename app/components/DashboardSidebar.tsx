'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

type TabType = 'assignments' | 'presentations' | 'logos' | 'templates' | 'links-overview' | 'recently-deleted' | 'analytics';

interface DashboardSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [showEmailPreferencesModal, setShowEmailPreferencesModal] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [userName, setUserName] = useState(user?.name || 'ahmad muaaz');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({
    mentions: true,
    assignments: true,
    comments: true
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Direct logout function that bypasses AuthContext
  const handleDirectLogout = async () => {
    if (isLoggingOut) return;
    
    console.log('🚪 DashboardSidebar: Starting direct logout...');
    setIsLoggingOut(true);
    
    try {
      // Sign out directly from Firebase
      await signOut(auth);
      console.log('✅ DashboardSidebar: Firebase signOut successful');
      
      // Clear local state
      setShowTeamDropdown(false);
      
      // Force redirect to landing page
      console.log('🔄 DashboardSidebar: Redirecting to landing page...');
      
      // Method 1: Immediate window.location redirect (most reliable)
      console.log('🔄 DashboardSidebar: Immediate window.location redirect...');
      try {
        window.location.href = '/';
        console.log('✅ DashboardSidebar: Immediate redirect successful');
      } catch (e) {
        console.log('⚠️ DashboardSidebar: Immediate redirect failed, trying replace...');
        try {
          window.location.replace('/');
          console.log('✅ DashboardSidebar: Replace redirect successful');
        } catch (e2) {
          console.log('⚠️ DashboardSidebar: Replace redirect failed, trying assign...');
          try {
            window.location.assign('/');
            console.log('✅ DashboardSidebar: Assign redirect successful');
          } catch (e3) {
            console.error('❌ DashboardSidebar: All immediate redirects failed');
          }
        }
      }
      
      // Method 2: Next.js Router as backup
      setTimeout(() => {
        console.log('🔄 DashboardSidebar: Trying Next.js router as backup...');
        try {
          router.push('/');
          console.log('✅ DashboardSidebar: Router backup successful');
        } catch (error) {
          console.error('❌ DashboardSidebar: Router backup failed:', error);
        }
      }, 100);
      
      // Method 3: Force redirect after delay
      setTimeout(() => {
        console.log('🔄 DashboardSidebar: Force redirect after delay...');
        try {
          window.location.href = '/';
        } catch (e) {
          window.location.replace('/');
        }
      }, 300);
      
    } catch (error) {
      console.error('❌ DashboardSidebar: Direct logout error:', error);
      setIsLoggingOut(false);
      
      // Even if there's an error, try to redirect
      console.log('🔄 DashboardSidebar: Error fallback redirect...');
      try {
        window.location.href = '/';
      } catch (e) {
        try {
          window.location.replace('/');
        } catch (e2) {
          window.location.assign('/');
        }
      }
    }
  };

  // Modal content based on step
  const modalContent = [
    {
      title: "Efficient collaboration",
      subtitle: "Promote team productivity without worrying about access levels and accidental edits.",
      features: [
        {
          icon: "commenters",
          title: "Give commenters free access",
          description: "Add teammates who don't edit to view and comment on presentations in your workspace at no cost."
        },
        {
          icon: "folders",
          title: "Create and share private folders",
          description: "Work by yourself, or invite members to contribute to a private folder."
        },
        {
          icon: "history",
          title: "Revert changes with version history",
          description: "View a time-stamped history of individual slides or entire presentations."
        }
      ]
    },
    {
      title: "Transform your team's ideas into winning work. Upgrade now.",
      subtitle: "",
      features: [
        {
          icon: "brand",
          title: "Put your brand front and center",
          description: "Remove our logo from presentation links, exports, and embeds. Upload videos and high-quality images."
        },
        {
          icon: "collaborate",
          title: "Collaborate how you want",
          description: "Invite more guests to individual presentations, or commenters to your workspace. Create shared private folders."
        },
        {
          icon: "analytics",
          title: "Identify the impact of your slides",
          description: "Track when and where presentations and rooms are viewed. Send custom, passcode-protected links for sensitive work."
        }
      ]
    },
    {
      title: "Audience insights",
      subtitle: "Understand the impact of your content - from sales proposals to project deliverables.",
      features: [
        {
          icon: "analytics",
          title: "Track interest with links and engagement analytics",
          description: "See when, where, and how often a deck or room was viewed, along with who viewed it."
        },
        {
          icon: "lock",
          title: "Control access with passcodes",
          description: "Add a passcode to limit who can view the links you send out."
        },
        {
          icon: "deliver",
          title: "Deliver more relevant decks",
          description: "Analyze slide-level engagement to know which slides grab attention and which need refinement."
        }
      ]
    },
    {
      title: "Advanced features",
      subtitle: "Unlock powerful tools to take your presentations to the next level.",
      features: [
        {
          icon: "templates",
          title: "Access premium templates",
          description: "Get exclusive access to professionally designed templates and themes."
        },
        {
          icon: "export",
          title: "High-quality exports",
          description: "Export presentations in multiple formats with custom branding and high resolution."
        },
        {
          icon: "support",
          title: "Priority support",
          description: "Get faster response times and dedicated support for your team's needs."
        }
      ]
    }
  ];

  // Auto-sliding progress bar animation
  useEffect(() => {
    if (showUpgradeModal) {
      const interval = setInterval(() => {
        setProgressStep((prev) => (prev + 1) % 4);
      }, 3000); // Change step every 3 seconds

      return () => clearInterval(interval);
    } else {
      setProgressStep(0);
    }
  }, [showUpgradeModal]);

  // Function to render icon based on type
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case "commenters":
        return (
          <div className="relative">
            <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-white rounded-full bg-transparent"></div>
          </div>
        );
      case "folders":
        return (
          <div className="relative">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-lg"></div>
          </div>
        );
      case "history":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "brand":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "collaborate":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case "analytics":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "lock":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case "deliver":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "templates":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
      case "export":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "support":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col relative h-screen -mt-4">
      {/* Team Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded transition-all duration-200"
              >
                <h2 className="text-sm font-medium text-gray-900">{user?.name}'s team</h2>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded transition-all duration-200 relative"
          >
            <img 
              src="/icons/bell.png" 
              alt="Notifications" 
              className="w-5 h-5"
              onError={() => {
                // Fallback to SVG if image fails to load
                if (svgRef.current) {
                  svgRef.current.classList.remove('hidden');
                }
              }}
            />
            <svg ref={svgRef} className="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h5l-5 5v-5zM15 7h5l-5 5V7zM4.5 4.5h5l-5 5V4.5z" />
            </svg>
          </button>
        </div>
        <button 
          onClick={() => setShowUpgradeModal(true)}
          className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Upgrade this workspace</span>
        </button>
        
        {/* Workspace Dropdown */}
        {showWorkspaceDropdown && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {/* Workspace Settings */}
            <div className="p-2">
              <button 
                onClick={() => {
                  router.push('/settings');
                  setShowWorkspaceDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Workspace settings</span>
              </button>
              
              <button 
                onClick={() => {
                  router.push('/members');
                  setShowWorkspaceDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Members</span>
              </button>
              
              <button 
                onClick={() => {
                  router.push('/upgrade');
                  setShowWorkspaceDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Upgrade this workspace</span>
              </button>
            </div>
            
            <div className="border-t border-gray-200"></div>
            
            {/* Workspaces Section */}
            <div className="p-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">WORKSPACES</div>
              <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-900 rounded flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">A</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name}'s team</span>
                  <span className="text-xs text-gray-500">Free plan</span>
                </div>
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create a new workspace</span>
              </button>
            </div>
            
            <div className="border-t border-gray-200"></div>
            
            {/* Account Section */}
            <div className="p-2">
              <div className="px-3 py-1 text-xs text-gray-500">{user?.email}</div>
              <button 
                onClick={() => setShowAccountSettingsModal(true)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Account settings</span>
              </button>
              
              <button 
                onClick={handleDirectLogout}
                disabled={isLoggingOut}
                className={`w-full text-left px-3 py-2 text-sm rounded flex items-center space-x-2 ${
                  isLoggingOut 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isLoggingOut ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
                <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
              </button>
            </div>
            
            <div className="border-t border-gray-200"></div>
            
            {/* App Features */}
            <div className="p-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open desktop app</span>
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <span>Drafts</span>
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create folder</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search & commands"
            className="w-full bg-gray-50 text-sm py-2.5 px-4 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('presentations')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-3 ${
              activeTab === 'presentations' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Recents</span>
          </button>
          <button
            onClick={() => onTabChange('templates')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-3 ${
              activeTab === 'templates' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>Templates</span>
          </button>
          <button
            onClick={() => onTabChange('assignments')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-3 ${
              activeTab === 'assignments' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onTabChange('logos')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-3 ${
              activeTab === 'logos' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            <span>Logos</span>
          </button>
          <button
            onClick={() => onTabChange('links-overview')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-3 ${
              activeTab === 'links-overview' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Links Overview</span>
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-3 ${
              activeTab === 'analytics' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </button>
        </nav>

        {/* Team Folders Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Team</h3>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Marketing</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Design</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New folder</span>
            </button>
          </div>
        </div>

        {/* Private Folders Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 px-3 py-2 bg-gray-100 rounded">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Private</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Personal</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Drafts</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create folder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Links Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/members')}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Invite members</span>
          </button>
          <button 
            onClick={() => onTabChange('recently-deleted')}
            className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-200 flex items-center space-x-3 ${
              activeTab === 'recently-deleted' 
                ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Recently deleted</span>
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 flex items-center space-x-3">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Install app</span>
          </button>
        </div>
      </div>

      {/* Team Dropdown */}
      {showTeamDropdown && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-2">
            {/* Workspace Actions Section */}
            <div className="space-y-1 mb-3">
              <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Workspace settings</span>
              </button>
              <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Members</span>
              </button>
              <button className="w-full text-left px-3 py-2.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Upgrade this workspace</span>
              </button>
            </div>

            {/* Workspaces Section */}
            <div className="border-t border-gray-200 pt-3 mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-3 font-medium">Workspaces</p>
              <div className="space-y-1">
                <div className="px-3 py-2.5 flex items-center space-x-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">A</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name}'s team</p>
                    <p className="text-xs text-gray-500">Free plan</p>
                  </div>
                </div>
                <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center space-x-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create a new workspace</span>
                </button>
              </div>
            </div>

            {/* Account Section */}
            <div className="border-t border-gray-200 pt-3 mb-3">
              <p className="text-xs text-gray-500 px-3 mb-2 font-medium">{user?.email}</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setShowAccountSettingsModal(true)}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span>Account settings</span>
                </button>
                <button 
                  onClick={handleDirectLogout}
                  disabled={isLoggingOut}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                    isLoggingOut 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </button>
              </div>
            </div>

            {/* Desktop App Section */}
            <div className="border-t border-gray-200 pt-3">
              <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open desktop app</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 -right-80 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-96">
          <div className="p-0">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex space-x-6">
                <button className="text-sm font-medium text-gray-900 border-b-2 border-purple-600 pb-2">
                  Inbox
                </button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-700 pb-2">
                  Subscribed
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Content - No Notifications */}
            <div className="text-center py-8 px-4">
              {/* Purple Bell Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-12">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">You're all up to date</h3>
              <p className="text-sm text-gray-600">New notifications will appear here whenever there's activity.</p>
            </div>

            {/* Promotional Card */}
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                {/* Slack Logo */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                    <div className="flex flex-wrap w-5 h-5">
                      <div className="w-2 h-2 bg-green-500 rounded-sm m-0.5"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-sm m-0.5"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-sm m-0.5"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-sm m-0.5"></div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Know when you're needed with the Pitch app for Slack</p>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Add Pitch to Slack</a>
                </div>
                
                {/* Close Button */}
                <button className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showTeamDropdown || showNotifications || showWorkspaceDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowTeamDropdown(false);
            setShowNotifications(false);
            setShowWorkspaceDropdown(false);
          }}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowUpgradeModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Modal */}
          <motion.div 
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[600px] flex overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Left Panel - Dark Background */}
            <div className="w-1/2 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex flex-col justify-center items-center text-white p-8 relative">
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <motion.span 
                    className="text-6xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >P</motion.span>
                  <motion.span 
                    className="text-6xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >h</motion.span>
                  <motion.span 
                    className="text-6xl font-bold text-purple-400"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >i</motion.span>
                  <motion.span 
                    className="text-6xl font-bold text-blue-400"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >x</motion.span>
                </div>
                <motion.p 
                  className="text-2xl text-purple-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >even better.</motion.p>
              </motion.div>
              
              {/* Abstract Graphics */}
              <div className="absolute inset-0 flex items-center justify-center">
                {progressStep === 0 && (
                  <motion.div 
                    key="image-0"
                    className="w-80 h-80 relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Step 0: Collaboration - Hands reaching out */}
                    <div className="absolute top-8 right-8 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
                    </div>
                    
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">X</span>
                    </div>
                    
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                      </svg>
                    </div>
                    
                    <div className="absolute bottom-8 right-16 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                  </motion.div>
                )}
                
                {progressStep === 1 && (
                  <motion.div 
                    key="image-1"
                    className="w-80 h-80 relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Step 1: Brand/Transform - Abstract C-shape with blocks */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {/* Large C-shape */}
                      <div className="w-32 h-32 border-8 border-pink-400 rounded-full border-r-transparent border-b-transparent transform rotate-45"></div>
                      
                      {/* Blue blocks behind */}
                      <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded-lg transform rotate-12"></div>
                      <div className="absolute top-8 left-8 w-6 h-6 bg-blue-600 rounded-lg transform -rotate-12"></div>
                      <div className="absolute top-12 left-12 w-4 h-4 bg-blue-700 rounded-lg transform rotate-6"></div>
                      
                      {/* Yellow sphere */}
                      <div className="absolute bottom-4 right-4 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    </div>
                  </motion.div>
                )}
                
                {progressStep === 2 && (
                  <motion.div 
                    key="image-2"
                    className="w-80 h-80 relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Step 2: Analytics - Dashboard mockup */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {/* Main dashboard card */}
                      <div className="w-48 h-32 bg-white rounded-lg shadow-lg p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-16 h-2 bg-gray-300 rounded"></div>
                          <div className="w-8 h-2 bg-gray-300 rounded"></div>
                        </div>
                        
                        {/* Chart bars */}
                        <div className="flex items-end space-x-2 h-16">
                          <div className="w-4 bg-green-400 rounded-t" style={{height: '60%'}}></div>
                          <div className="w-4 bg-blue-400 rounded-t" style={{height: '80%'}}></div>
                          <div className="w-4 bg-purple-400 rounded-t" style={{height: '40%'}}></div>
                          <div className="w-4 bg-orange-400 rounded-t" style={{height: '90%'}}></div>
                          <div className="w-4 bg-pink-400 rounded-t" style={{height: '70%'}}></div>
                        </div>
                        
                        {/* Labels */}
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                        </div>
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      
                      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {progressStep === 3 && (
                  <motion.div 
                    key="image-3"
                    className="w-80 h-80 relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Step 3: Advanced features - Premium elements */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {/* Premium crown */}
                      <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      
                      {/* Floating premium elements */}
                      <div className="absolute -top-6 -right-6 w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                        </svg>
                      </div>
                      
                      <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-teal-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      
                      <div className="absolute top-8 left-8 w-4 h-4 bg-pink-500 rounded-full"></div>
                      <div className="absolute bottom-8 right-8 w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Panel - White Background */}
            <div className="w-1/2 bg-white p-8 flex flex-col">
              {/* Close Button */}
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center">
                <motion.h2 
                  key={`title-${progressStep}`}
                  className="text-2xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {modalContent[progressStep].title}
                </motion.h2>
                {modalContent[progressStep].subtitle && (
                  <motion.p 
                    key={`subtitle-${progressStep}`}
                    className="text-sm text-gray-600 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    {modalContent[progressStep].subtitle}
                  </motion.p>
                )}

                {/* Features */}
                <div className="space-y-6 mb-8">
                  {modalContent[progressStep].features.map((feature, index) => (
                    <motion.div 
                      key={`feature-${progressStep}-${index}`}
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {renderIcon(feature.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                                                    {/* CTA Button */}
                  <motion.button 
                    className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    See pricing
                  </motion.button>
                </div>

                {/* Progress Bar at Bottom */}
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <div className="flex space-x-1">
                    <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${progressStep >= 0 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${progressStep >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${progressStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${progressStep >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Account Settings Modal */}
        {showAccountSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAccountSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Account settings</h2>
                <button
                  onClick={() => setShowAccountSettingsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Settings List */}
              <div className="p-0">
                {/* Avatar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className="text-sm text-gray-700">Avatar</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Name */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className="text-sm text-gray-700">Name</span>
                  <div className="flex items-center space-x-2">
                    {isEditingName ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              setIsEditingName(false);
                            }
                          }}
                          onBlur={() => setIsEditingName(false)}
                          className="text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          onClick={() => setIsEditingName(false)}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{userName}</span>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Email preferences */}
                <div 
                  onClick={() => setShowEmailPreferencesModal(true)}
                  className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <span className="text-sm text-gray-700">Email preferences</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">Subscribed to all</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className="text-sm text-gray-700">Notifications</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">Subscribed to 21 presentations</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className="text-sm text-red-600">Danger zone</span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete my account
                    </button>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Email Preferences Modal */}
        {showEmailPreferencesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowEmailPreferencesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowEmailPreferencesModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Email preferences</h2>
                </div>
                <button
                  onClick={() => setShowEmailPreferencesModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-700 mb-6">Get an email for the following updates:</p>
                
                <div className="space-y-4">
                  {/* When someone mentions you */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">@</span>
                      </div>
                      <span className="text-sm text-gray-700">When someone mentions you</span>
                    </div>
                    <button
                      onClick={() => setEmailPreferences(prev => ({ ...prev, mentions: !prev.mentions }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailPreferences.mentions ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailPreferences.mentions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* When someone assigns a slide to you */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">When someone assigns a slide to you</span>
                    </div>
                    <button
                      onClick={() => setEmailPreferences(prev => ({ ...prev, assignments: !prev.assignments }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailPreferences.assignments ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailPreferences.assignments ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* When someone responds to your comments */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">When someone responds to your comments</span>
                    </div>
                    <button
                      onClick={() => setEmailPreferences(prev => ({ ...prev, comments: !prev.comments }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailPreferences.comments ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailPreferences.comments ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone.</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  This will permanently delete your account and all associated data. You will lose access to all your presentations, folders, and workspace settings.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle account deletion here
                      handleDirectLogout();
                      setShowDeleteConfirm(false);
                      setShowAccountSettingsModal(false);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }
