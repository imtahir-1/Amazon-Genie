
import React from 'react';

interface HeaderProps {
  onReset: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, onExport }) => {
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
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">System Online</span>
            </div>
            <button 
              onClick={onReset}
              className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 hover:bg-gray-50 rounded-xl"
            >
              Restart
            </button>
            <button 
              onClick={onExport}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-black transition-all"
            >
              Export Assets
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
