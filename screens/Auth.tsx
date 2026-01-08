
import React, { useState, useEffect } from 'react';
import SecurityNotification from '../components/SecurityNotification';

interface RegisteredAccount {
  email: string;
  username: string;
  password?: string;
  twoFactorEnabled?: boolean;
}

interface AuthProps {
  onLogin: (identifier: string, isNew: boolean, password?: string, randomData?: { displayName: string, username: string }) => void;
  registeredAccounts: RegisteredAccount[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, registeredAccounts }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup' | '2fa'>('landing');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingLogin, setPendingLogin] = useState<RegisteredAccount | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const trigger2FA = (account: RegisteredAccount) => {
    setIsSendingEmail(true);
    setError('');
    
    // Simula o tempo de rede para enviar o e-mail
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setPendingLogin(account);
      setIsSendingEmail(false);
      setMode('2fa');
      setShowNotification(true);
    }, 1800);
  };

  const handleAction = (isSignup: boolean) => {
    const trimmedId = identifier.toLowerCase().trim().replace(/^@/, '');
    
    if (isSignup) {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(trimmedId)) {
         setError('E-mail inválido.');
         return;
       }
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    
    const account = registeredAccounts.find(a => a.email === trimmedId || a.username === trimmedId);

    if (isSignup && account) {
      setError('Este e-mail já possui uma conta.');
      return;
    }

    if (!isSignup) {
      if (!account) {
        setError('Conta não encontrada.');
        return;
      }
      if (account.password !== password) {
        setError('Senha incorreta.');
        return;
      }

      if (account.twoFactorEnabled) {
        trigger2FA(account);
        return;
      }
    }

    setError('');
    if (isSignup) {
      const identity = { 
        displayName: `Viber ${Math.floor(Math.random() * 1000)}`, 
        username: `user_${Math.random().toString(36).substr(2, 5)}` 
      };
      onLogin(trimmedId, true, password, identity);
    } else {
      onLogin(account!.email, false, password);
    }
  };

  const verify2FA = () => {
    const fullCode = twoFactorCode.join('');
    if (fullCode === generatedCode) {
      onLogin(pendingLogin!.email, false, pendingLogin!.password);
    } else {
      setError('Código de segurança incorreto.');
      setTwoFactorCode(['', '', '', '', '', '']);
    }
  };

  const handle2FAInput = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...twoFactorCode];
    newCode[index] = val.slice(-1);
    setTwoFactorCode(newCode);

    if (val && index < 5) {
      const nextInput = document.getElementById(`2fa-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (isSendingEmail) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Enviando e-mail de segurança...</p>
        <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">Aguarde um momento</p>
      </div>
    );
  }

  if (mode === 'landing') {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 animate-view">
        <div className="mb-20 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-600/40 rotate-12">
             <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.53 19H4.47L12 5.45zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z"/></svg>
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter mb-2">VIBE<span className="text-indigo-500">.</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em]">Experience the rhythm</p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <button onClick={() => setMode('signup')} className="w-full bg-indigo-600 text-white h-16 rounded-[2rem] font-black text-xs tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20">CRIAR CONTA</button>
          <button onClick={() => setMode('login')} className="w-full bg-white/5 border border-white/10 text-white h-16 rounded-[2rem] font-black text-xs tracking-widest transition-all active:scale-95">ENTRAR</button>
        </div>
      </div>
    );
  }

  if (mode === '2fa') {
    return (
      <div className="h-full w-full bg-black flex flex-col p-8 animate-view justify-center">
        {showNotification && pendingLogin && (
          <SecurityNotification 
            email={pendingLogin.email} 
            code={generatedCode} 
            onClose={() => setShowNotification(false)} 
          />
        )}
        
        <div className="max-w-sm mx-auto w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" /></svg>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Verificação</h2>
          <p className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-widest">O e-mail foi enviado.</p>
          <p className="text-[9px] text-indigo-500 font-black uppercase mb-10 tracking-[0.2em]">Confira sua caixa de entrada</p>
          
          <div className="flex justify-between gap-2 mb-10">
            {twoFactorCode.map((digit, i) => (
              <input 
                key={i}
                id={`2fa-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handle2FAInput(e.target.value, i)}
                className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-indigo-500 outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all"
              />
            ))}
          </div>

          {error && <p className="text-rose-500 text-[10px] font-black uppercase mb-6 tracking-widest">{error}</p>}

          <button onClick={verify2FA} className="w-full bg-white text-black h-16 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all active:scale-95 mb-6">Confirmar Acesso</button>
          
          <div className="space-y-4">
            <button 
              onClick={() => pendingLogin && trigger2FA(pendingLogin)} 
              className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors block mx-auto"
            >
              Reenviar E-mail
            </button>
            <button onClick={() => setMode('login')} className="text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors block mx-auto">Voltar para o Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black flex flex-col p-8 animate-view">
      <button onClick={() => setMode('landing')} className="mb-12 w-fit p-3 bg-white/5 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
      <div className="flex-1 max-w-sm mx-auto w-full">
        <h2 className="text-5xl font-black mb-12 italic uppercase tracking-tighter">{mode === 'login' ? 'Vibe Login' : 'New Vibe'}</h2>
        {error && <div className="bg-rose-600/10 border border-rose-500/20 text-rose-500 text-[9px] font-black p-4 rounded-2xl mb-8 uppercase tracking-[0.2em]">{error}</div>}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Identidade</label>
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-indigo-500" placeholder="E-mail ou @user" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Senha Secreta</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-indigo-500" placeholder="••••••••" />
          </div>
        </div>
        <button onClick={() => handleAction(mode === 'signup')} className="w-full bg-indigo-600 text-white h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] mt-12 shadow-xl shadow-indigo-600/20 active:scale-95">{mode === 'login' ? 'Entrar Agora' : 'Criar Perfil'}</button>
      </div>
    </div>
  );
};

export default Auth;
