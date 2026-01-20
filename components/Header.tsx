
import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  user?: User;
  onReset: () => void;
  onExport: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onReset, onExport, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center cursor-pointer group" onClick={onReset}>
            <div className="bg-gray-900 text-white p-2.5 rounded-2xl mr-4 shadow-lg group-hover:bg-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              ListingGenius <span className="text-blue-600">AI</span>
            </span>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Studio Connected</span>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                >
                  <img src={user.avatar} className="w-10 h-10 rounded-xl shadow-sm border border-gray-100" />
                  <div className="text-left hidden sm:block">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">Active Brand</p>
                    <p className="text-sm font-black text-gray-900 leading-none">{user.brandName}</p>
                  </div>
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account</p>
                        <p className="text-xs font-bold text-gray-600 truncate">{user.email}</p>
                      </div>
                      <button onClick={() => { onReset(); setShowDropdown(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg> New Project
                      </button>
                      <button onClick={onExport} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Batch Export
                      </button>
                      <div className="border-t border-gray-50 mt-2 pt-2">
                        <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> Logout Studio
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
             <div className="flex items-center px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Authentication Required</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
