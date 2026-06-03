import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { apiFetch } from '../../services/api';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalTab, closeAuthModal, setAuthModalTab, setToken, showToast, setUserName, setUserEmail } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleOAuthLogin = async () => {
    try {
      const cfg = await fetch('/api/v1/config').then((r) => r.json());
      if (!cfg.googleClientId) {
        showToast('Set GOOGLE_CLIENT_ID to enable Google login');
        return;
      }
      
      const w = window as any;
      if (!w.google?.accounts?.id) {
        showToast('Google login SDK is still loading');
        return;
      }

      w.google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: async (response: any) => {
          try {
            const data = await apiFetch<any>('/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_token: response.credential })
            });
            setToken(data.access_token);
            closeAuthModal();
            showToast('✅ Signed in with Google!');
          } catch (err: any) {
            showToast(err.message);
          }
        }
      });
      w.google.accounts.id.prompt();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const path = authModalTab === 'signin' ? '/auth/login' : '/auth/signup';
      const body = authModalTab === 'signin' 
        ? { email, password } 
        : { email, password, name: name.trim() || email.split('@')[0] };

      const data = await apiFetch<any>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      setToken(data.access_token);
      setUserEmail(email);
      setUserName(name.trim() || email.split('@')[0]);
      
      closeAuthModal();
      showToast(authModalTab === 'signin' ? '✅ Welcome back!' : '✅ Account created!');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-bg" onClick={(e) => e.target === e.currentTarget && closeAuthModal()}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-x" onClick={closeAuthModal}>✕</button>
        <div className="auth-logo">
          <span style={{ color: '#fff' }}>Eat</span>
          <span style={{ color: 'var(--green)', fontStyle: 'italic' }}>Map</span>
        </div>
        <div className="auth-tagline">Map-first food discovery · Hyderabad</div>
        
        <div className="auth-tabs">
          <div
            className={`auth-tab ${authModalTab === 'signin' ? 'active' : ''}`}
            onClick={() => setAuthModalTab('signin')}
          >
            Sign in
          </div>
          <div
            className={`auth-tab ${authModalTab === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthModalTab('signup')}
          >
            Create account
          </div>
        </div>

        <button className="oauth-btn" onClick={handleOAuthLogin}>
          <span style={{ fontWeight: 900, fontSize: '16px', color: '#4285f4', fontFamily: 'serif', marginRight: '6px' }}>G</span>
          Continue with Google
        </button>
        
        <div className="auth-or">or</div>

        <form onSubmit={handleEmailAuth}>
          {authModalTab === 'signup' && (
            <input
              className="auth-field"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="auth-field"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? 'Processing...' 
              : authModalTab === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        
        <div className="auth-terms">By continuing you agree to EatMap Terms & Privacy Policy.</div>
      </div>
    </div>
  );
};
