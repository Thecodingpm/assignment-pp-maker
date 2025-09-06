'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Diamond, 
  MessageCircle, 
  FileText, 
  CheckCircle, 
  User,
  Play,
  Plus,
  Bell,
  List,
  BarChart3,
  Share2
} from 'lucide-react';

interface SlideTransitionPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const SlideTransitionPanel: React.FC<SlideTransitionPanelProps> = ({
  isVisible,
  onClose
}) => {
  const [selectedTransition, setSelectedTransition] = useState('none');

  const transitions = [
    {
      id: 'none',
      name: 'None',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
        </svg>
      ),
      available: true
    },
    {
      id: 'continuity',
      name: 'Continuity',
      icon: (
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
        </div>
      ),
      available: false
    },
    {
      id: 'fade',
      name: 'Fade',
      icon: (
        <div className="w-6 h-6 bg-gray-400 rounded"></div>
      ),
      available: false
    },
    {
      id: 'slide-left',
      name: 'Slide left',
      icon: (
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      ),
      available: false
    },
    {
      id: 'slide-right',
      name: 'Slide right',
      icon: (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
        </div>
      ),
      available: false
    },
    {
      id: 'slide-up',
      name: 'Slide up',
      icon: (
        <div className="flex flex-col items-center space-y-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
        </div>
      ),
      available: false
    },
    {
      id: 'slide-down',
      name: 'Slide down',
      icon: (
        <div className="flex flex-col items-center space-y-1">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      ),
      available: false
    }
  ];

  const rightSidebarTools = [
    { id: 'cut', icon: Scissors, label: 'Cut/Edit', active: false },
    { id: 'transitions', icon: Diamond, label: 'Transitions', active: true },
    { id: 'comments', icon: MessageCircle, label: 'Comments', active: false },
    { id: 'notes', icon: FileText, label: 'Notes/Edit', active: false },
    { id: 'review', icon: CheckCircle, label: 'Review', active: false },
    { id: 'user', icon: User, label: 'User/Share', active: false }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
            onClick={onClose}
          />
          
          {/* Main Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] flex"
          >
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Top Application Bar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">A</span>
                  </div>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors">
                    <Bell className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors">
                    <List className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center space-x-2 transition-colors">
                    <Play className="w-3 h-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Play</span>
                  </button>
                  <button className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium text-sm transition-colors">
                    Share
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                  {/* Slide Transition Card */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Slide transition</h2>
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Transition Options */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {transitions.map((transition) => (
                        <button
                          key={transition.id}
                          onClick={() => transition.available && setSelectedTransition(transition.id)}
                          disabled={!transition.available}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                            selectedTransition === transition.id
                              ? 'border-purple-500 bg-purple-50'
                              : transition.available
                              ? 'border-gray-200 hover:border-gray-300 bg-white'
                              : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                          }`}
                        >
                          <div className={`${transition.available ? 'text-gray-600' : 'text-gray-400'}`}>
                            {transition.icon}
                          </div>
                          <span className={`text-sm font-medium ${
                            selectedTransition === transition.id
                              ? 'text-purple-700'
                              : transition.available
                              ? 'text-gray-700'
                              : 'text-gray-400'
                          }`}>
                            {transition.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Order Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Order</h3>
                        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Preview
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="space-y-3 mb-4">
                          <div className="w-full h-8 bg-gray-200 rounded"></div>
                          <div className="w-full h-8 bg-gray-200 rounded"></div>
                        </div>
                        <p className="text-gray-500 text-sm">
                          You can reorder your animations once you've created some.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
              {rightSidebarTools.map((tool) => (
                <button
                  key={tool.id}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    tool.active
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            {/* Bottom Right Info Card */}
            <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-lg px-4 py-3 flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">69%</span>
              <button className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideTransitionPanel;
