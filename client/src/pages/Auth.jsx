import React, { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

const InputField = ({ label, icon: Icon, type, value, onChange, placeholder, showToggle, onToggle, isPasswordVisible }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input 
        type={type} 
        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      {showToggle && (
        <button 
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");

      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { fullName: formData.fullName, email: formData.email, password: formData.password };

      const { data } = await api.post(endpoint, payload);

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userName', data.fullName || ''); 
        navigate('/dashboard');
      } else if (!isLogin) {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        
        <div className="flex border-b">
          {[ { id: true, label: 'Login', icon: LogIn }, { id: false, label: 'Register', icon: UserPlus } ].map(tab => (
            <button key={tab.label} onClick={() => { setIsLogin(tab.id); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${isLogin === tab.id ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
           
          </div>

          {error && <div className={`p-3 rounded-xl text-xs font-bold mb-6 text-center border-2 ${error.includes('successful') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <InputField label="Full Name" icon={User} type="text" placeholder="e.g. Nabil Deshmukh" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            )}

            <InputField label="Email Address" icon={Mail} type="email" placeholder="name@clinic.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />

            <InputField label="Password" icon={Lock} type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} showToggle onToggle={() => setShowPassword(!showPassword)} isPasswordVisible={showPassword} />

            {!isLogin && (
              <InputField label="Confirm Password" icon={Lock} type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 active:scale-[0.98] transition-all disabled:bg-blue-300 flex justify-center items-center gap-2 mt-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Sign In' : 'Create Profile')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;