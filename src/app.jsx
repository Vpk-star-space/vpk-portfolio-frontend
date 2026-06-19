import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './index.css';
import { Helmet } from 'react-helmet-async';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const socket = io(BACKEND_URL);

// ==========================================
// CUSTOM AI & DEV.TO STYLE MARKDOWN PARSER
// ==========================================
const parseInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="md-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="md-link">{match[1]}</a>;
    }
    return part;
  });
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="md-spacer" />;
    if (line.startsWith('# ')) return <h1 key={i} className="md-h1">{parseInline(line.slice(2))}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="md-h2">{parseInline(line.slice(3))}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="md-h3">{parseInline(line.slice(4))}</h3>;
    if (line.startsWith('> ')) return <blockquote key={i} className="md-quote">{parseInline(line.slice(2))}</blockquote>;
    if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="md-li">{parseInline(line.slice(2))}</li>;
    return <p key={i} className="md-p">{parseInline(line)}</p>;
  });
};

// ==========================================
// 1. PREMIUM DASHBOARD PORTFOLIO (CLIENT)
// ==========================================
export function ArchitectPortfolio() {
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);
  const [showBanner] = useState(true); 
  const [scrollSpeed] = useState(20); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // UPGRADE: New state for expanding chat
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // CMS & Silent Server States
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [showBootOverlay, setShowBootOverlay] = useState(false);

  const prevLengthRef = useRef(0);

  // --- PERSISTENCE LOGIC FOR VISITOR ---
  const [visitorId] = useState(() => {
    let vid = localStorage.getItem('vpk_visitor_id');
    if (!vid) {
      vid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('vpk_visitor_id', vid);
    }
    return vid;
  });

  const [chatLog, setChatLog] = useState(() => {
    const saved = localStorage.getItem('vpk_chat_history');
    const parsed = saved ? JSON.parse(saved) : [];
    prevLengthRef.current = parsed.length;
    return parsed;
  });

  // Toggle Dark Mode globally
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Mobile Click-Outside Drawer Handler & Expanded Chat Scroll Lock
  useEffect(() => {
    const handleMobileRemovers = (e) => {
      if (!isMobileMenuOpen) return;
      if (e.target.closest('.mobile-menu-btn')) return;
      if (!e.target.closest('.sidebar')) {
        setIsMobileMenuOpen(false);
      }
    };

    // Lock background scrolling if menu OR chat is expanded
    if (isMobileMenuOpen || isChatExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('click', handleMobileRemovers);
    return () => {
      document.removeEventListener('click', handleMobileRemovers);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isChatExpanded]);

  // 💡 SILENT BACKGROUND SERVER POLLING (No automatic overlays)
  useEffect(() => {
    let isMounted = true;
    let pollInterval;

    const checkServer = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/articles`)
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPublishedArticles(Array.isArray(data) ? data : []);
            setIsBackendReady(true);
            setShowBootOverlay(false); // Auto-close overlay if it was open
            clearInterval(pollInterval); // Stop polling once connected
          }
        }
      } catch (err) {
        // Server is offline/sleeping. Do nothing silently.
      }
    };

    checkServer(); // Initial silent check

    // Ping every 5 seconds until it wakes up
    pollInterval = setInterval(() => {
      if (!isBackendReady) checkServer();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isBackendReady]);

  // Save chat to local storage
  useEffect(() => {
    localStorage.setItem('vpk_chat_history', JSON.stringify(chatLog));
    if (chatLog.length > prevLengthRef.current) {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevLengthRef.current = chatLog.length;
  }, [chatLog]);

// SOCKET LOGIC
  useEffect(() => {
    if (socket.connected) {
      socket.emit('join_visitor', { visitorId });
    }
    const onConnect = () => socket.emit('join_visitor', { visitorId });
    socket.on('connect', onConnect);
    
    // ADDED: sender: 'admin' so the UI knows this is YOU typing
    socket.on('admin_msg_received', (msg) => {
      setChatLog(prev => [...prev, { type: 'received', sender: 'admin', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    });
    
    // ADDED: sender: 'bot' so the UI knows this is the automated system
    socket.on('bot_reply', (data) => {
      setChatLog(prev => [...prev, { type: 'received', sender: 'bot', text: data.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    });
    
    return () => { 
      socket.off('connect', onConnect); 
      socket.off('admin_msg_received'); 
      socket.off('bot_reply');
    };
  }, [visitorId]);

  // 💡 INTERCEPTOR: Trigger overlay ONLY if server is asleep and user clicks AI
  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!isBackendReady) {
      setShowBootOverlay(true);
      return;
    }

    setIsAiLoading(true);
    setAiResponse(''); 
    try {
      const response = await fetch(`${BACKEND_URL}/api/gemini/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if(response.ok) {
        setAiResponse(data.response);
      } else {
        setAiResponse('### ⚠️ System Alert\n**AI Agent unreachable.**');
      }
    } catch { 
      setAiResponse('### ⚠️ Connection Terminated\n**Infrastructure Unreachable.**'); 
    }
    setIsAiLoading(false);
    setPrompt('');
  };

  // 💡 INTERCEPTOR: Trigger overlay ONLY if server is asleep and user sends msg
  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!isBackendReady) {
      setShowBootOverlay(true);
      return;
    }

    socket.emit('stream_secure_msg', { visitorId, message }); 
    setChatLog((prev) => [...prev, { type: 'sent', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
  };
  
  return (
    <div className="dashboard-layout">
      {/* =========================================
          GLOBAL INLINE STYLES FOR COMPONENTS
          ========================================= */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* UPGRADED: Premium Dark Background & Subhams Networks Watermark */
        .wa-widget { position: relative; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; height: 500px; border: 1px solid rgba(255,255,255,0.1); background: #050a15; font-family: 'Segoe UI', sans-serif; box-shadow: 0 20px 40px rgba(0,0,0,0.6); margin-top: 10px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);}
        .wa-widget::before { content: 'SUBHAMS NETWORKS'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2.5rem; font-weight: 900; color: rgba(255, 255, 255, 0.03); white-space: nowrap; z-index: 0; pointer-events: none; letter-spacing: 6px; }
        
        /* EXPANDED CHAT UPGRADE */
        .expanded-chat { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 100000 !important; border-radius: 0 !important; margin: 0 !important; }
        
        .wa-header { position: relative; z-index: 2; background: rgba(15, 23, 42, 0.95); padding: 12px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .wa-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .wa-header-text h3 { margin: 0; color: #e9edef; font-size: 1rem; }
        .wa-header-text p { margin: 0; color: #8696a0; font-size: 0.8rem; }
        .wa-body { position: relative; z-index: 1; flex: 1; overflow-y: auto; padding: 20px; background-color: transparent; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; display: flex; flex-direction: column; gap: 10px; }
        .wa-body::-webkit-scrollbar { width: 6px; }
        .wa-body::-webkit-scrollbar-thumb { background: #374045; border-radius: 10px; }
        .wa-bubble { position: relative; z-index: 2; padding: 10px 14px; border-radius: 12px; max-width: 80%; font-size: 0.95rem; line-height: 1.4; color: #e9edef; animation: popIn 0.2s ease forwards;}
        .wa-sent { background: #3b82f6; align-self: flex-end; border-top-right-radius: 2px; margin-right: 4px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);}
        .wa-received { background: #1e293b; align-self: flex-start; border-top-left-radius: 2px; margin-left: 4px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 12px rgba(0,0,0,0.2);}
        .wa-time { font-size: 0.65rem; color: rgba(255,255,255,0.6); float: right; margin-left: 10px; margin-top: 4px; }
        .wa-footer { position: relative; z-index: 2; padding: 12px; background: rgba(15, 23, 42, 0.95); display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
        .wa-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px 18px; border-radius: 24px; outline: none; transition: 0.3s;}
        .wa-input:focus { background: rgba(255,255,255,0.1); border-color: #3b82f6;}
        .wa-btn { background: #3b82f6; color: white; border: none; width: 42px; height: 42px; border-radius: 50%; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: 0.2s;}
        .wa-btn:hover { transform: scale(1.05); background: #2563eb;}

        /* Typewriter Animation Logic */
        .typewriter-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #3b82f6;
          animation: typing 2.5s steps(40, end), blink-caret 0.75s step-end infinite;
          max-width: 0;
          animation-fill-mode: forwards;
        }
        @keyframes typing { from { max-width: 0; } to { max-width: 100%; } }
        @keyframes blink-caret { from, to { border-color: transparent; } 50% { border-color: #3b82f6; } }
        @keyframes customSpinner { to { transform: rotate(360deg); } }
        
        /* Mobile Specific Overrides */
        @media (max-width: 768px) {
          .typewriter-text { white-space: normal !important; border-right: none !important; animation: none !important; max-width: 100% !important; }
        }
      `}} />

      {/* =========================================
          SERVER WAKEUP GLASS OVERLAY (ON ACTION)
          ========================================= */}
      {showBootOverlay && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.55)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: isDarkMode ? '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.05)' : '0 40px 80px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.9)',
            padding: '50px 40px', borderRadius: '32px', textAlign: 'center', maxWidth: '420px',
            color: isDarkMode ? '#f8fafc' : '#0f172a', position: 'relative'
          }}>
            <button 
              onClick={() => setShowBootOverlay(false)}
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}
            >✕</button>
            <div style={{
              width: '45px', height: '45px', border: '4px solid #3b82f6', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'customSpinner 1s linear infinite', margin: '0 auto 25px auto'
            }}></div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>Initializing Server</h2>
            <p style={{ fontWeight: '600', opacity: 0.8, lineHeight: '1.6', fontSize: '0.95rem' }}>
              The secure architecture is waking up from its standby state. Please hold on, connection establishing shortly...
            </p>
          </div>
        </div>
      )}

      {/* =========================================
          FLOATING UI CONTROLS (BULLETPROOF TOGGLE)
          ========================================= */}
      <div className="ui-controls" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 99999 }}>
        {/* Dark Mode Toggle */}
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="ui-btn">
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        {/* Mobile Hamburger Menu */}
        <button 
          className="ui-btn mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* =========================================
          SIDEBAR NAVIGATION
          ========================================= */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <img src="/profile.png" alt="Venkata Pavan Kumar Profile" className="profile-img" />
        <h1>Venkata Pavan Kumar</h1>
        <p className="title"><span className="typewriter-text">Systems Architect & Backend Engineer</span></p>

        {/* NEW: MOBILE IN-MENU NAVIGATION LINKS */}
        <div className="mobile-nav-menu">
          <div className="section-title">Navigation</div>
          <a href="#projects" className="social-link" onClick={() => setIsMobileMenuOpen(false)}><span>🚀</span> Live Links</a>
          <a href="#articles" className="social-link" onClick={() => setIsMobileMenuOpen(false)}><span>📝</span> Articles</a>
          <a href="#contact" className="social-link" onClick={() => setIsMobileMenuOpen(false)}><span>💬</span> Get in Touch</a>
        </div>

        <div className="section-title">Technical Arsenal</div>
        <div className="skill-tags">
          <span className="skill-tag">Node.js</span><span className="skill-tag">System Design</span>
          <span className="skill-tag">WebSockets</span><span className="skill-tag">MongoDB</span><span className="skill-tag">React</span>
        </div>

     <div className="section-title">Connect & Links</div>
        <div className="social-links">
          <a href="https://www.linkedin.com/in/venkata-pavan-kumar-server" target="_blank" rel="noopener noreferrer" className="social-link link-linkedin"><span>💼</span> LinkedIn</a>
          <a href="https://github.com/Vpk-star-space" target="_blank" rel="noopener noreferrer" className="social-link link-github"><span>🐙</span> GitHub</a>
          <a href="https://dev.to/vpkstarspace" target="_blank" rel="noopener noreferrer" className="social-link link-devto"><span>👨‍💻</span> Dev.to</a>
          <a href="mailto:pavanvenkat63@gmail.com" className="social-link link-mail"><span>✉️</span> pavanvenkat63@gmail.com</a>
        </div>
      </aside>
      {/* =========================================
          MAIN CONTENT PORTFOLIO
          ========================================= */}
      <main className="main-content">

        {/* NEW: PREMIUM TOP GLASS NAVIGATION & AI SEARCH */}
        <nav className="top-nav-glass">
          <div className="top-nav-links">
            <a href="#projects" className="top-nav-link">Live Links</a>
            <a href="#articles" className="top-nav-link">Articles</a>
            <a href="#contact" className="top-nav-link">Get in Touch</a>
          </div>
          
          <form onSubmit={handleAiSubmit} className="top-search-wrapper">
            <span className="top-search-icon" title="Gemini AI Agent">✧</span>
            <input 
              className="top-search-input" 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              placeholder="Ask AI about Pavan's expertise..." 
              disabled={isAiLoading} 
            />
          </form>
        </nav>

        {/* AI RESPONSE RENDER AREA (Right below the nav) */}
        {isAiLoading && <div className="loading-text" style={{ padding: '0 28px 20px 28px', color: '#2997ff', fontWeight: '600' }}><div className="loading-dot"></div> Analyzing query infrastructure...</div>}
        {aiResponse && !isAiLoading && (
          <div className="ai-response-window" style={{ margin: '0 auto 30px auto', maxWidth: '1300px', width: '96%' }}>
            <div className="ai-response-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Gemini Agent Output
              </span>
              <button className="ai-close-btn" onClick={() => setAiResponse('')} title="Clear response">✕</button>
            </div>
            <div style={{ color: isDarkMode ? '#e1e1e6' : '#334155' }}>
              {renderMarkdown(aiResponse)}
            </div>
          </div>
        )}

        {/* FORMAL WELCOME HERO */}
        <div className="hero-section">
          <h1>Welcome to my Engineering Portfolio.</h1>
          <p>I am <strong>Venkata Pavan Kumar Amarthaluri</strong>, a Systems Architect specialized in high-performance backend infrastructure.</p>
        </div>

        {/* SCROLLING TICKER */}
        {showBanner && (
          <div className="scrolling-ticker">
            <div className="scrolling-text">
              🚀 ARCHITECTING ROBUST BACKEND INFRASTRUCTURE • SECURE SYSTEM DESIGN & SCALABILITY • DEPLOYING HIGH-PERFORMANCE SOLUTIONS
            </div>
          </div>
        )}

        <div className="grid-layout">
          {/* PROJECTS SECTION WITH ID FOR JUMP LINK */}
          <section id="projects" className="projects-container">
            <h2 className="main-heading">✦ Live Architecture Projects</h2>
            <div className="projects-grid">
              <a href="https://subhams-agent-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-card card-blue">
                <h3>🌐 Subhams Secure Networks</h3><p>RAM-based transient state architecture.</p>
              </a>
              <a href="https://bhavyams-vendor-hub-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-card card-orange">
                <h3>🛒 Bhavyams VendorHub</h3><p>Scalable E-commerce ecosystem engine.</p>
              </a>
              <a href="https://subhams-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-card card-green">
                <h3>🔒 PMMS System</h3><p>Secure financial tracking infrastructure.</p>
              </a>
            </div>
          </section>

          {/* DEV.TO STYLE ARTICLE FEED WITH ID FOR JUMP LINK */}
          <section id="articles" className="articles-container">
            <h2 className="main-heading" style={{ marginTop: '20px' }}>📝 Technical Publications</h2>
            <div className="articles-list">
              {Array.isArray(publishedArticles) && publishedArticles.length > 0 ? (
                publishedArticles.map((article) => (
                  <Link to={`/article/${article.slug}`} key={article._id} className="article-preview-line">
                    <div className="article-meta">
                      <span className="article-date">{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    
                    <h3 className="article-title">{article.title}</h3>
                    
                    <p className="article-snippet">
                      {article.content.substring(0, 150).replace(/[#*`>]/g, '')}...
                    </p>

                    <div className="article-stats">
                      <span className="stat-item">❤️ {article.likes || 0}</span>
                      <span className="stat-item">💬 {article.comments?.length || 0}</span>
                      <span className="read-more">Read Article <span>→</span></span>
                    </div>
                  </Link>
                ))
              ) : (
                <p style={{color: '#8696a0', marginTop: '10px', fontWeight: '500'}}>
                  {isBackendReady ? 'No articles published yet.' : 'Database initializing in background...'}
                </p>
              )}
            </div>
          </section>

          {/* WHATSAPP STYLE VISITOR TUNNEL WITH ID FOR JUMP LINK */}
          <section id="contact" style={{ display: 'flex', flexDirection: 'column', marginTop: '40px' }}>
            <h2 style={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: '1.4rem', fontWeight: '900', display: 'flex', alignItems: 'center' }}>
              <span className="live-dot" style={{ background: isBackendReady ? '#00a884' : '#f59e0b', display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', marginRight: '10px', boxShadow: isBackendReady ? '0 0 10px rgba(0, 168, 132, 0.5)' : 'none', animation: isBackendReady ? 'pulse 2s infinite' : 'none' }}></span>
              Direct Secure Line
            </h2>
            {/* UPGRADE: Conditional expanded class added here */}
            <div className={`wa-widget ${isChatExpanded ? 'expanded-chat' : ''}`}>
              <div className="wa-header">
                <div className="wa-avatar" style={{ background: '#6b7c85', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                <div className="wa-header-text">
                  <h3>Venkata Pavan Kumar</h3>
                  <p>System Architect • {isBackendReady ? 'Available' : 'Booting...'}</p>
                </div>
                {/* UPGRADE: Expand Toggle Button */}
                <button 
                  onClick={() => setIsChatExpanded(!isChatExpanded)} 
                  style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#8696a0', fontSize: '1.2rem', cursor: 'pointer', transition: '0.2s' }}
                  title={isChatExpanded ? "Minimize Chat" : "Expand Chat"}
                >
                  {isChatExpanded ? '🗗' : '🗖'}
                </button>
              </div>

              <div className="wa-body">
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', color: '#8696a0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                    End-to-end encrypted connection
                  </span>
                </div>
                {chatLog.length === 0 && <div style={{ textAlign: 'center', color: '#8696a0', fontSize: '0.9rem', marginTop: '20px', position: 'relative', zIndex: 2 }}>Send a message to connect securely.</div>}
                
                {chatLog.map((log, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className={`wa-bubble ${log.type === 'sent' ? 'wa-sent' : 'wa-received'}`}>
                      {/* UPGRADED: Dynamic Name based on sender property */}
                      {log.type === 'received' && (
                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '900', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {log.sender === 'bot' ? 'Subhams Networks' : 'Venkata Pavan Kumar'}
                        </div>
                      )}
                      {log.text}
                      <span className="wa-time">{log.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="wa-footer">
                <input 
                  className="wa-input" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  placeholder="Type a message..." 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                />
                <button onClick={handleSendMessage} className="wa-btn">➤</button>
              </div>
            </div>
          </section>

          {/* SUBHAMS FOOTER */}
          <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ animation: 'float-sparkle 2s ease-in-out infinite', fontSize: '13px' }}>✨</span>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', margin: 0, letterSpacing: '1.5px' }}>POWERED BY <span className="subhams-brand-text">SUBHAMS</span></p>
              <span style={{ animation: 'float-sparkle 2s ease-in-out infinite 1s', fontSize: '13px' }}>✨</span>
            </div>
            <div style={{ height: '3px', width: '40px', background: 'linear-gradient(90deg, transparent, #3b82f6, #a855f7, transparent)', margin: '8px auto 0 auto', borderRadius: '10px', animation: 'line-breathe 3s ease-in-out infinite' }}></div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ==========================================
// 2. DEV.TO STYLE DEDICATED READING PAGE
// ==========================================
export function ArticleView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  
  // Interaction States
  const [isLiking, setIsLiking] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grab Visitor ID for tracking
  const visitorId = localStorage.getItem('vpk_visitor_id') || 'unknown_visitor';

  useEffect(() => {
  fetch(`${BACKEND_URL}/api/articles/${slug}`)
  
      .then(res => res.json())
      .then(data => setArticle(data))
      .catch(err => console.error(err));
  }, [slug]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/articles/${slug}/like`, { method: 'POST' });
      const data = await res.json();
      setArticle(prev => ({ ...prev, likes: data.likes }));
    } catch (err) {
      console.error("Like failed", err);
    }
    setTimeout(() => setIsLiking(false), 1000); 
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);

    try {
const res = await fetch(`${BACKEND_URL}/api/articles/${slug}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: commentName, text: commentText, visitorId })
      });
      const updatedComments = await res.json();
      setArticle(prev => ({ ...prev, comments: updatedComments }));
      setCommentText(''); 
    } catch (err) {
      console.error("Comment failed", err);
    }
    setIsSubmitting(false);
  };

  const cleanDescription = article?.content 
    ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 150) 
    : "Read this article on my portfolio.";

  const currentUrl = `https://venkatapavankumar.vercel.app/article/${slug}`;

  if (!article) return <div style={{ color: '#8696a0', textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', fontWeight: 'bold' }}>Booting infrastructure...</div>;

  
  return (
  <div className="article-page-wrapper">
      <Helmet>
        {/* Basic SEO */}
        <title>{article.title} | Venkata Pavan Kumar</title>
        <meta name="description" content={cleanDescription} />
        <link rel="canonical" href={currentUrl} />

        {/* Open Graph (Social Sharing for WhatsApp/Facebook/LinkedIn) */}
        <meta property="og:title" content={`${article.title} | Venkata Pavan Kumar`} />
        <meta property="og:description" content={cleanDescription} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        
        {/* Twitter/X Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={cleanDescription} />
      </Helmet>
      <nav className="article-nav">
        <button onClick={() => navigate('/')} className="back-btn">← Back to Portfolio</button>
      </nav>
      
      <article className="dev-article-container">
        <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 className="article-main-title">{article.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="author-card" style={{ border: 'none', margin: 0, padding: 0 }}>
              <img src="/profile.png" alt="Pavan" className="author-avatar" />
              <div className="author-info">
                <strong>Venkata Pavan Kumar</strong>
                <span>Posted on {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            
            <button onClick={handleLike} disabled={isLiking} className="like-btn" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
              ❤️ <span style={{ color: '#0f172a' }}>{article.likes || 0}</span> Likes
            </button>
          </div>
        </header>
        
        <div className="article-body">
          {renderMarkdown(article.content)}
        </div>

        {/* COMMENTS SECTION */}
        <section style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '40px', marginTop: '60px' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: '800' }}>Discussion ({article.comments?.length || 0})</h3>
          
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px', background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <input 
              type="text" 
              placeholder="Your Name (Optional)" 
              value={commentName} 
              onChange={(e) => setCommentName(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #cbd5e1', color: '#0f172a', padding: '14px', borderRadius: '8px', outline: 'none', fontSize: '1rem', fontWeight: '600' }}
            />
            <textarea 
              placeholder="Add to the discussion..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #cbd5e1', color: '#0f172a', padding: '14px', borderRadius: '8px', minHeight: '120px', resize: 'vertical', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', fontWeight: '500' }}
            />
            <button type="submit" disabled={isSubmitting} style={{ background: '#2563eb', color: '#ffffff', fontWeight: 'bold', padding: '14px 28px', border: 'none', borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-start', fontSize: '1rem', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {article.comments && article.comments.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, border: '1px solid rgba(255,255,255,0.9)' }}>👤</div>
                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '16px', flex: 1, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', fontWeight: '500' }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ animation: 'float-sparkle 2s ease-in-out infinite', fontSize: '13px' }}>✨</span>
          <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', margin: 0, letterSpacing: '1.5px' }}>POWERED BY <span className="subhams-brand-text">SUBHAMS</span></p>
          <span style={{ animation: 'float-sparkle 2s ease-in-out infinite 1s', fontSize: '13px' }}>✨</span>
        </div>
        <div style={{ height: '3px', width: '30px', background: 'linear-gradient(90deg, transparent, #3b82f6, #a855f7, transparent)', margin: '8px auto 0 auto', borderRadius: '10px', animation: 'line-breathe 3s ease-in-out infinite' }}></div>
      </div>
    </div>
  );
}

// ==========================================
// 3. WHATSAPP-STYLE ADMIN DASHBOARD + CMS
// ==========================================
export function AdminDashboard() {
  const [adminView, setAdminView] = useState('chats'); 
  
  const [conversations, setConversations] = useState(() => {
    const savedChats = localStorage.getItem('admin_chats');
    return savedChats ? JSON.parse(savedChats) : {};
  });
  const [activeRoom, setActiveRoom] = useState(null); 
  const [replyInputs, setReplyInputs] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');

  useEffect(() => {
    if (messagesEndRef.current && adminView === 'chats') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, activeRoom, adminView]);

  useEffect(() => {
    localStorage.setItem('admin_chats', JSON.stringify(conversations));
  }, [conversations]);
  
  // SOCKET LOGIC
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join_admin');
    };

    const onAdminConfirmation = (payload) => {
      if (payload && payload.offlineHistory) {
        setConversations(prev => {
          const updatedConversations = { ...prev };
          Object.keys(payload.offlineHistory).forEach((roomId) => {
            const backendMsgs = payload.offlineHistory[roomId];
            updatedConversations[roomId] = backendMsgs.map(msg => ({
              sender: msg.sender === 'Visitor' ? 'visitor' : 'admin',
              text: msg.message,
              time: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
          });
          return updatedConversations;
        });
      }
    };

    const onNewVisitorMsg = (data) => {
      setConversations(prev => ({
        ...prev,
        [data.roomId]: [...(prev[data.roomId] || []), { 
          sender: 'visitor', 
          text: data.message, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]
      }));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('admin_joined_confirmation', onAdminConfirmation);
    socket.on('new_visitor_msg', onNewVisitorMsg);

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('join_admin');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect');
      socket.off('admin_joined_confirmation', onAdminConfirmation);
      socket.off('new_visitor_msg', onNewVisitorMsg);
    };
  }, []);

  const sendReply = (roomId) => {
    const text = replyInputs[roomId];
    if (!text || !text.trim()) return;
    socket.emit('admin_reply', { targetRoom: roomId, message: text });
    
    setConversations(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), { 
        sender: 'admin', 
        text: text, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]
    }));
    setReplyInputs(prev => ({ ...prev, [roomId]: '' }));
  };

  const closeConversation = (roomId) => {
    const updatedChats = { ...conversations };
    delete updatedChats[roomId];
    setConversations(updatedChats);
    if (activeRoom === roomId) setActiveRoom(null);
  };

  const handlePublishArticle = async (e) => {
    e.preventDefault();
    if(!articleTitle || !articleContent) return alert("Title and Content required.");
    try {
    const response = await fetch(`${BACKEND_URL}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: articleTitle, content: articleContent })
      });
      if (response.ok) {
        alert('✅ Article Published to Live Portfolio!');
        setArticleTitle('');
        setArticleContent('');
        setAdminView('chats');
      }
    } catch (err) {
      alert('Failed to publish. Check connection.');
    }
  };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-nav-tabs">
          <button className={`admin-tab ${adminView === 'chats' ? 'active-tab' : ''}`} onClick={() => setAdminView('chats')}>Live Chats</button>
          <button className={`admin-tab ${adminView === 'write' ? 'active-tab' : ''}`} onClick={() => setAdminView('write')}>Write Article</button>
        </div>

        {adminView === 'chats' && (
          <>
            <div className="sidebar-header">
              <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '800' }}>Active Tunnels</h2>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isConnected ? '#00a884' : '#ef4444', boxShadow: isConnected ? '0 0 10px rgba(0, 168, 132, 0.5)' : 'none' }} title={isConnected ? "Online" : "Offline"}></div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {Object.keys(conversations).length === 0 ? (
                  <div style={{ padding: '20px', color: '#8696a0', textAlign: 'center', fontWeight: '600' }}>No active users.</div>
              ) : (
                Object.keys(conversations).map(roomId => {
                  const lastMsg = conversations[roomId][conversations[roomId].length - 1];
                  return (
                    <button key={roomId} className={`room-item ${activeRoom === roomId ? 'active' : ''}`} onClick={() => setActiveRoom(roomId)}>
                      <div className="avatar">👤</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '800' }}>{roomId.replace('user_', 'User ')}</span>
                          <span style={{ fontSize: '0.75rem', color: '#8696a0', fontWeight: 'bold' }}>{lastMsg?.time}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                          {lastMsg?.sender === 'admin' ? '✓✓ ' : ''}{lastMsg?.text}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}
      </aside>

      <main className="admin-main">
        {adminView === 'write' ? (
          <div className="write-article-container">
            <h2 style={{ color: '#0f172a', marginBottom: '25px', fontWeight: '900', fontSize: '2.5rem', letterSpacing: '-1px' }}>Draft New Architecture Post</h2>
            <form onSubmit={handlePublishArticle} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <input className="admin-input-title" value={articleTitle} onChange={e => setArticleTitle(e.target.value)} placeholder="New post title here..." />
              <textarea className="admin-input-content" value={articleContent} onChange={e => setArticleContent(e.target.value)} placeholder="Write your content in Markdown... (e.g. ## Introduction)" />
              <button type="submit" className="admin-publish-btn" style={{ background: '#2563eb', color: '#ffffff', fontSize: '1.2rem', fontWeight: '800', padding: '18px', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', boxShadow: '0 8px 20px rgba(37,99,235,0.3)' }}>Publish Post to Live Portfolio</button>
            </form>
          </div>
        ) : (
              activeRoom ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* CHAT WINDOW HEADER */}
              <div className="chat-header" style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="avatar" style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,1)', color: '#0f172a' }}>👤</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '900' }}>{activeRoom.replace('user_', 'User ')}</h2>
                    <span style={{ fontSize: '0.85rem', color: '#00a884', fontWeight: 'bold' }}>Online</span>
                  </div>
                </div>
                
                {/* CLOSE CHAT BUTTON (Closes view, does NOT delete data) */}
                <button 
                  onClick={() => setActiveRoom(null)} 
                  style={{ 
                    background: 'rgba(239,68,68,0.1)', 
                    border: '1px solid rgba(239,68,68,0.3)', 
                    color: '#ef4444', 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    cursor: 'pointer', 
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ✕ Close Chat
                </button>
              </div>
              <div className="chat-window" style={{ flex: 1, padding: '30px 10%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ textAlign: 'center', margin: '15px 0' }}>
                  <span style={{ background: 'rgba(255,255,255,0.8)', color: '#475569', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(255,255,255,1)' }}>
                    End-to-end encrypted session
                  </span>
                </div>

                {conversations[activeRoom].map((m, i) => (
                  <div key={i} className={`bubble-wrapper ${m.sender === 'admin' ? 'sent-wrapper' : 'received-wrapper'}`} style={{ display: 'flex', width: '100%', marginBottom: '10px', justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      padding: '12px 18px', borderRadius: '16px', maxWidth: '65%', fontSize: '1rem', fontWeight: '500', lineHeight: '1.5',
                      background: m.sender === 'admin' ? '#3b82f6' : 'rgba(255,255,255,0.9)', 
                      color: m.sender === 'admin' ? 'white' : '#0f172a',
                      border: m.sender === 'admin' ? 'none' : '1px solid rgba(255,255,255,1)',
                      boxShadow: m.sender === 'admin' ? '0 10px 25px rgba(59,130,246,0.3)' : '0 10px 25px rgba(0,0,0,0.05)'
                    }}>
                      <span>{m.text}</span>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '5px', textAlign: 'right', fontWeight: 'bold' }}>{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="admin-input-area" style={{ padding: '20px 30px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.6)', display: 'flex', gap: '15px' }}>
                <input 
                  className="admin-input"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,1)', color: '#0f172a', padding: '16px 24px', borderRadius: '30px', outline: 'none', fontSize: '1.05rem', fontWeight: '600', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                  value={replyInputs[activeRoom] || ''} 
                  onChange={(e) => setReplyInputs(prev => ({ ...prev, [activeRoom]: e.target.value }))} 
                  onKeyDown={(e) => e.key === 'Enter' && sendReply(activeRoom)} 
                  placeholder="Type your reply to the user..." 
                />
                <button onClick={() => sendReply(activeRoom)} style={{ background: '#3b82f6', color: 'white', border: 'none', width: '55px', height: '55px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>➤</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>🛡️</div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Secure Admin Hub</h2>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>Select a user tunnel from the left or switch tabs to publish.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

// ==========================================
// 4. SECURE ROUTER
// ==========================================
export default function App() {
  const adminPath = import.meta.env.VITE_ADMIN_ROUTE || "/fallback-admin-route";
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArchitectPortfolio />} />
        <Route path="/article/:slug" element={<ArticleView />} />
        <Route path={adminPath} element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}