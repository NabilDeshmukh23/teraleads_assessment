import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Staff'); 
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName'); 
    
    if (storedName) {
      setUserName(storedName);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  return (
    <header className="bg-white border-b border-gray-200 z-40 relative">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-blue-100 shadow-lg">
            <User size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">DentalAI</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-2xl transition duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 transition-colors group-hover:bg-blue-100 uppercase">
              {userName.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Logged in as</p>
              {/* Added 'uppercase' class here */}
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1 uppercase">
                Dr. {userName} <ChevronDown size={14} className={`transition-transform duration-300 text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile</p>
                {/* Added 'uppercase' class to the dropdown name */}
                <p className="text-xs font-bold text-slate-700 truncate uppercase">{userName}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition duration-150 text-left uppercase"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;