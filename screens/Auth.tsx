
import React, { useState } from 'react';

interface RegisteredAccount {
  email: string;
  username: string;
  password?: string;
}

interface AuthProps {
  onLogin: (identifier: string, isNew: boolean, password?: string, randomData?: { displayName: string, username: string }) => void;
  registeredAccounts: RegisteredAccount[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, registeredAccounts }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [identifier, setIdentifier] = useState(''); // E-mail no signup, E-mail/User no login
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const generateRandomIdentity = () => {
    const adj = ['Urban', 'Neon', 'Cool', 'Cyber', 'Vibe', 'Hyper', 'Flow', 'Nova', 'Swift', 'Pulse', 'Epic', 'Glitch'];
    const noun = ['User', 'Rider', 'Wave', 'Star', 'Viber', 'Ghost', 'Blade', 'Soul', 'Drift', 'Pixel', 'Hunter', 'Edge'];
    const num = Math.floor(Math.random() * 999);
    const displayName = `${adj[Math.floor(Math.random() * adj.length)]} ${noun[Math.floor(Math.random() * noun.length)]}`;
    const username = `${displayName.replace(/\s/g, '_').toLowerCase()}_${num}`;
    return { displayName, username };
  };

  const handleAction = (isSignup: boolean) => {
    const trimmedId = identifier.toLowerCase().trim().replace(/^@/, '');
    
    // Validação de E-mail para cadastro
    if (isSignup) {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(trimmedId)) {
         setError('Por favor, insira um e-mail válido (ex: vibe@exemplo.com).');
         return;
       }
    } else {
       if (trimmedId.length < 3) {
         setError('Insira seu e-mail ou @usuário cadastrado.');
         return;
       }
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    
    const account = registeredAccounts.find(a => a.email === trimmedId || a.username === trimmedId);

    // Validação de conta existente ou inexistente
    if (isSignup && account) {
      setError('Este e-mail já possui uma conta vinculada. Tente fazer login.');
      return;
    }

    if (!isSignup) {
      if (!account) {
        setError('Esta conta não existe no VibeStream. Verifique o e-mail ou cadastre-se.');
        return;
      }
      if (account.password !== password) {
        setError('Senha incorreta. Tente novamente.');
        return;
      }
    }

    setError('');
    
    if (isSignup) {
      const identity = generateRandomIdentity();
      onLogin(trimmedId, true, password, identity);
    } else {
      onLogin(account!.email, false, password);
    }
  };

  const resetAndSetMode = (newMode: 'landing' | 'login' | 'signup') => {
    setIdentifier('');
    setPassword('');
    setError('');
    setMode(newMode);
  };

  if (mode === 'landing') {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 animate-view">
        <div className="mb-20 text-center">
          <h1 className="text-7xl font-black italic tracking-tighter mb-2">VIBE<span className="text-indigo-500">.</span></h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.4em]">Sua vibe, seu ritmo.</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button onClick={() => resetAndSetMode('signup')} className="w-full bg-indigo-600 text-white h-14 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-indigo-600/20">
            CRIAR CONTA
          </button>
          <button onClick={() => resetAndSetMode('login')} className="w-full bg-white/5 border border-white/10 text-white h-14 rounded-2xl font-black text-sm transition-all active:scale-95 hover:bg-white/10">
            ENTRAR NA CONTA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black flex flex-col p-8 animate-view">
      <button onClick={() => resetAndSetMode('landing')} className="mb-12 w-fit p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round"/></svg>
      </button>

      <div className="flex-1 max-w-sm mx-auto w-full">
        <h2 className="text-4xl font-black mb-10 italic uppercase tracking-tighter">
          {mode === 'login' ? 'Entrar' : 'Começar'}
        </h2>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black p-4 rounded-2xl mb-8 animate-view uppercase tracking-widest leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">
              {mode === 'login' ? 'E-mail ou Usuário' : 'E-mail para cadastro'}
            </label>
            <input 
              type="text" 
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-gray-700"
              placeholder={mode === 'login' ? "ex: vibe@exemplo ou @seu_user" : "ex: voce@email.com"}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-gray-700"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          onClick={() => handleAction(mode === 'signup')}
          className="w-full bg-indigo-600 text-white h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] mt-12 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 hover:bg-indigo-500"
        >
          {mode === 'login' ? 'ENTRAR NA CONTA' : 'CRIAR MINHA VIBE'}
        </button>

        <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
           Ao continuar, você concorda com nossos termos de uso e privacidade da VIBE.
        </p>
      </div>
    </div>
  );
};

export default Auth;
