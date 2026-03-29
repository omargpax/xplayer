"use client"

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Copyright, Scale } from 'lucide-react';

const LegalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'dmca'>('terms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden border bg-[#1a1a1e] border-purple-500/30 rounded-2xl shadow-2xl flex flex-col font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="flex items-center gap-3 text-purple-400">
            <Scale size={24} />
            <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">XPlay Legal Center</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden md:flex-row">
          
          {/* Sidebar Navigation */}
          <nav className="flex flex-row p-2 border-b md:flex-col md:w-64 md:border-b-0 md:border-r border-white/10 bg-black/20">
            <TabButton 
              active={activeTab === 'terms'} 
              onClick={() => setActiveTab('terms')}
              icon={<FileText size={18} />}
              label="Terms of Use"
            />
            <TabButton 
              active={activeTab === 'privacy'} 
              onClick={() => setActiveTab('privacy')}
              icon={<ShieldCheck size={18} />}
              label="Privacy Policy"
            />
            <TabButton 
              active={activeTab === 'dmca'} 
              onClick={() => setActiveTab('dmca')}
              icon={<Copyright size={18} />}
              label="Copyright Claims"
            />
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto text-gray-300 scroll-smooth leading-relaxed">
            {activeTab === 'terms' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">Terms of Service</h3>
                <p className="text-sm italic text-purple-300/80">Last Updated: March 2026</p>
                
                <section className="space-y-4">
                  <h4 className="text-lg font-medium text-purple-400">1. Nature of the Service</h4>
                  <p>XPlay is a personal project designed for educational and recreational purposes. It functions as a general-purpose tool that allows for the reproduction and personal downloading of audio content from the internet.</p>
                  <p>By using this website, you agree that you are doing so for personal, non-commercial use only. You must be at least 18 years of age to use this service.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-medium text-purple-400">2. Prohibited Conduct</h4>
                  <p>To maintain a safe environment and protect our project's identity, you agree not to use XPlay to process links containing:</p>
                  <ul className="pl-5 space-y-2 list-disc border-l border-purple-500/30">
                    <li>Obscene, vulgar, or illegal material.</li>
                    <li>Offensive language or content inappropriate for minors.</li>
                    <li>Content that depicts physical harm or animal cruelty.</li>
                    <li>Any use of automated scripts or crawlers to extract data from this site.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-medium text-purple-400">3. Disclaimer of Warranties</h4>
                  <p>This service is provided "AS-IS" and "AS-AVAILABLE". The developer makes no warranties regarding the constant availability of the service or the accuracy of third-party content. Under no circumstances shall the developer be liable for any indirect or consequential damages.</p>
                </section>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">Privacy Policy</h3>
                
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <h4 className="mb-2 font-medium text-purple-400">Local Storage</h4>
                  <p>Your "Favorites" and preferences are stored locally on your device via browser LocalStorage. This data is never sent to or stored on any external server.</p>
                </div>

                <section className="space-y-4">
                  <h4 className="text-lg font-medium text-purple-400">Transitory Processing</h4>
                  <p>XPlay does not maintain permanent logs or databases of the links you process. Content is handled in a transitory manner to facilitate immediate use.</p>
                  <h4 className="text-lg font-medium text-purple-400">Third-Party Links</h4>
                  <p>This site interacts with YouTube services. Your use of such content is governed by the <a  className="text-purple-400 hover:text-cyan-600" href="https://www.youtube.com/static?template=terms"> YouTube/Google Terms of Service and Privacy Policy</a> .</p>
                </section>
              </div>
            )}

            {activeTab === 'dmca' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">Copyright Claims</h3>
                <p>We respect intellectual property rights. XPlay functions as a tool and does not host or index content independently.</p>
                
                <section className="p-6 border rounded-xl border-white/5 bg-white/5">
                  <h4 className="mb-4 text-lg font-medium text-white">DMCA Compliance</h4>
                  <p className="mb-4 text-sm">If you believe your copyrighted work is being accessed through this tool in a way that constitutes infringement, please contact the developer with the following information: identification of the work, the URL, and your contact details.</p>
                  <div className="p-3 font-mono text-sm rounded bg-black/40 text-purple-300">
                    Contact: omargpax.dev@gmail.com
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center p-4 border-t border-white/10 bg-black/40">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">XPlay © 2026 — Lima, Peru</p>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 w-full
      ${active 
        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

export default LegalModal;
