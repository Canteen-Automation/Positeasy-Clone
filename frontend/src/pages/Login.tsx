import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Assets
import collegeLogo from '../assets/college-logo.png';
import foodCourtPosBg from '../assets/food-court-pos.png';
import ritLogo from '../assets/RIT_Logo.png';

const Login = () => {
  const [role, setRole] = useState<'manager' | 'master'>('manager');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Ensure any previous session is completely wiped out when arriving at the login screen
  useEffect(() => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userPermissions');
    localStorage.removeItem('systemUser');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/system/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });

      if (response.ok) {
        const user = await response.json();

        // Strict Role Validation
        if ((user.role || '').toLowerCase() !== (role || '').toLowerCase()) {
          alert(`Access Denied: You are trying to login as ${(role || '').toUpperCase()}, but your credentials belong to a ${(user.role || '').toUpperCase()} account.`);
          return;
        }

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userRole', (user.role || '').toLowerCase());
        sessionStorage.setItem('userPermissions', JSON.stringify(user.permissions || []));

        // Persist user profile + JWT token for authenticated API calls
        localStorage.setItem('systemUser', JSON.stringify(user)); // user object now includes `token`

        navigate('/store-dashboard');
      } else {
        const error = await response.json().catch(() => ({ error: 'Invalid credentials' }));
        alert(error.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Network error - make sure backend is running');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col gap-6 items-center justify-center p-4 md:p-8 bg-cover bg-center bg-no-repeat relative font-inter overflow-hidden"
      style={{ backgroundImage: `url(${foodCourtPosBg})` }}
    >
      {/* Subtle light overlay to match the clean aesthetic and improve card contrast */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-0"></div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/90 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col relative z-10"
      >
        {/* Top Logo - Centered */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center mb-8"
        >
          <img src={collegeLogo} alt="College Logo" className="h-16 md:h-20 object-contain filter drop-shadow-sm" />
          <span className="text-xs font-semibold text-[#001828]/60 mt-2.5 italic tracking-wide font-sans">
            Till yo tummy is full...
          </span>
        </motion.div>

        {/* Login Container */}
        <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-xs font-black tracking-[0.2em] text-[#001828] uppercase mb-2">
              Canteen Management System
            </h2>
            <div className="w-12 h-1 bg-[#001828] mx-auto rounded-full"></div>
          </div>

          {/* Role Toggle */}
          <div className="bg-slate-100/80 p-1 rounded-2xl flex gap-1 mb-6 relative">
            <motion.div
              className="absolute h-[calc(100%-8px)] top-1 bg-white rounded-xl shadow-sm z-0"
              initial={false}
              animate={{
                left: role === 'manager' ? '4px' : '50%',
                width: 'calc(50% - 6px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setRole('manager')}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 ${
                role === 'manager' ? 'text-[#001828]' : 'text-[#94a3b8] hover:text-[#64748b]'
              }`}
            >
              <UserCircle2 size={16} />
              MANAGER
            </button>
            <button
              onClick={() => setRole('master')}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 ${
                role === 'master' ? 'text-[#001828]' : 'text-[#94a3b8] hover:text-[#64748b]'
              }`}
            >
              <ShieldCheck size={16} />
              MASTER
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest pl-1">
                Secure User ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-[#001828] transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-white/85 border-2 border-slate-200 focus:border-[#001828] focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none transition-all placeholder:text-[#cbd5e1]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">
                  Passcode
                </label>
                <button type="button" className="text-[10px] font-black text-[#001828] uppercase hover:underline">
                  Forgot Access?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-[#001828] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/85 border-2 border-slate-200 focus:border-[#001828] focus:bg-white rounded-2xl py-3.5 pl-12 pr-12 text-sm font-semibold outline-none transition-all placeholder:text-[#cbd5e1]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#64748b] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#001828] text-white rounded-2xl py-3.5 font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-[#001828]/20 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden group relative mt-2"
            >
              <span className="relative z-10">CONNECT TO PORTAL</span>
              <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">
            © 2026 TILLO • SYSTEM PORTAL
          </p>
        </div>
      </motion.div>

      {/* Merchant Section Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4 relative z-10"
      >
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Merchant Partner</span>
          <span className="text-xs font-bold text-[#001828] mt-0.5">Rajalakshmi Institute of Technology</span>
        </div>
        <img src={ritLogo} alt="RIT Logo" className="h-12 w-auto object-contain filter drop-shadow-sm" />
      </motion.div>
    </div>
  );
};

export default Login;
