import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './index.css';
import { Helmet } from 'react-helmet-async';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const socket = io(BACKEND_URL);

// ==========================================
// STRICT TIMEZONE CONTROLLER 
// ==========================================
const getCleanTime = () => {
  try {
    return new Intl.DateTimeFormat('en-US', { 
      timeZone: 'Asia/Kolkata', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    }).format(new Date());
  } catch (e) {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
};

const cleanTimestamp = (ts) => {
  if (!ts) return getCleanTime();
  return ts.replace(/:(\d{2}):\d{2}/, ':$1'); 
};

// ==========================================
// CUSTOM AI & DEV.TO STYLE MARKDOWN PARSER
// ==========================================
const parseInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="md-bold" style={{ fontWeight: '800' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="md-link" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{match[1]}</a>;
    }
    return part;
  });
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="md-spacer" style={{ height: '10px' }} />;
    if (line.startsWith('# ')) return <h1 key={i} className="md-h1" style={{ fontWeight: '900', fontSize: '2rem', margin: '20px 0 10px 0' }}>{parseInline(line.slice(2))}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="md-h2" style={{ fontWeight: '900', fontSize: '1.6rem', margin: '18px 0 10px 0' }}>{parseInline(line.slice(3))}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="md-h3" style={{ fontWeight: '900', fontSize: '1.3rem', margin: '15px 0 8px 0' }}>{parseInline(line.slice(4))}</h3>;
    if (line.startsWith('> ')) return <blockquote key={i} className="md-quote" style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '15px', fontStyle: 'italic', opacity: 0.8, margin: '10px 0' }}>{parseInline(line.slice(2))}</blockquote>;
    if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="md-li" style={{ marginLeft: '20px', marginBottom: '5px' }}>{parseInline(line.slice(2))}</li>;
    return <p key={i} className="md-p" style={{ marginBottom: '10px', lineHeight: '1.6' }}>{parseInline(line)}</p>;
  });
};

// ==========================================
// 1. PREMIUM DASHBOARD PORTFOLIO (CLIENT)
// ==========================================
export function ArchitectPortfolio() {
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
  };
  
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);
  const [showBanner] = useState(true); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // BUG FIX 4: TAP ANIMATION STATE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasTappedMenu, setHasTappedMenu] = useState(false); 
  
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected); 

  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [showBootOverlay, setShowBootOverlay] = useState(false);
  
  const aiResponseRef = useRef(null);
  const prevLengthRef = useRef(0);

  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const quickReactions = ['👍', '❤️', '😂', '🔥', '👀'];

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

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleMobileRemovers = (e) => {
      if (!isMobileMenuOpen) return;
      if (e.target.closest('.mobile-menu-btn')) return;
      if (!e.target.closest('.sidebar')) {
        setIsMobileMenuOpen(false);
      }
    };

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
            setShowBootOverlay(false); 
            clearInterval(pollInterval); 
          }
        }
      } catch (err) {}
    };

    checkServer(); 

    pollInterval = setInterval(() => {
      if (!isBackendReady) checkServer();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isBackendReady]);

  useEffect(() => {
    localStorage.setItem('vpk_chat_history', JSON.stringify(chatLog));
    if (chatLog.length > prevLengthRef.current) {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevLengthRef.current = chatLog.length;
  }, [chatLog]);

  useEffect(() => {
    if (socket.connected) {
      setIsConnected(true);
      socket.emit('join_visitor', { visitorId });
    }
    
    const onConnect = () => {
        setIsConnected(true);
        socket.emit('join_visitor', { visitorId });
    };

    const onDisconnect = () => setIsConnected(false);
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    const onAdminMsg = (data) => {
      const isObj = typeof data === 'object';
      setChatLog(prev => [...prev, { 
        _id: isObj ? data._id : `msg_${Date.now()}`,
        type: 'received', 
        sender: 'admin', 
        text: isObj ? data.message : data, 
        time: cleanTimestamp(isObj ? data.timestamp : getCleanTime()),
        reaction: isObj ? data.reaction : null
      }]);
    };

    const onBotReply = (data) => {
      setChatLog(prev => [...prev, { 
        _id: data._id || `bot_${Date.now()}`,
        type: 'received', 
        sender: 'bot', 
        text: data.message, 
        time: cleanTimestamp(data.timestamp || getCleanTime()),
        reaction: null
      }]);
    };

    const onMsgSaved = (data) => {
      setChatLog(prev => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].type === 'sent' && updated[i].text === data.message && updated[i]._id?.startsWith('temp')) {
            updated[i]._id = data._id;
            updated[i].time = cleanTimestamp(data.timestamp);
            break;
          }
        }
        return updated;
      });
    };

    const onReaction = (data) => {
      setChatLog(prev => prev.map(msg => msg._id === data.messageId ? { ...msg, reaction: data.reaction } : msg));
    };
    
    socket.on('admin_msg_received', onAdminMsg);
    socket.on('bot_reply', onBotReply);
    socket.on('msg_saved_confirmation', onMsgSaved);
    socket.on('reaction_updated', onReaction);
    
    return () => { 
      socket.off('connect', onConnect); 
      socket.off('disconnect', onDisconnect);
      socket.off('admin_msg_received', onAdminMsg); 
      socket.off('bot_reply', onBotReply);
      socket.off('msg_saved_confirmation', onMsgSaved);
      socket.off('reaction_updated', onReaction);
    };
  }, [visitorId]);

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
        setTimeout(() => {
          if (aiResponseRef.current) {
            aiResponseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      } else {
        setAiResponse('### ⚠️ System Alert\n**AI Agent unreachable.**');
      }
    } catch { 
      setAiResponse('### ⚠️ Connection Terminated\n**Infrastructure Unreachable.**'); 
    }
    setIsAiLoading(false);
    setPrompt('');
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!isBackendReady) {
      setShowBootOverlay(true);
      return;
    }

    const tempId = `temp_${Date.now()}`;
    socket.emit('stream_secure_msg', { visitorId, message }); 
    setChatLog((prev) => [...prev, { _id: tempId, type: 'sent', text: message, time: getCleanTime(), reaction: null }]);
    setMessage('');
    setShowEmojiPicker(false);
  };

  const handleReact = (messageId, reaction) => {
    if(!messageId || messageId.startsWith('temp')) return; 
    socket.emit('react_to_msg', { messageId, reaction, roomId: visitorId });
    setChatLog(prev => prev.map(msg => msg._id === messageId ? { ...msg, reaction: reaction } : msg));
    setHoveredMsgId(null);
  };
  
  return (
    <div className="dashboard-layout">
     <style dangerouslySetInnerHTML={{ __html: `
        /* 1. PREMIUM WIDGET CONTAINER */
        .wa-widget { position: relative; border-radius: 24px; overflow: hidden; display: flex; flex-direction: column; height: 550px; background: linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(5, 10, 21, 0.95)); backdrop-filter: blur(24px) saturate(200%); -webkit-backdrop-filter: blur(24px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1); margin-top: 10px; font-family: 'Inter', sans-serif; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); width: 100%; max-width: 100%; box-sizing: border-box; }
        .wa-widget::before { content: 'SUBHAMS NETWORKS'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2.8rem; font-weight: 900; color: rgba(255, 255, 255, 0.02); white-space: nowrap; z-index: 0; pointer-events: none; letter-spacing: 8px; }
        
        /* BUG FIX 3: EXPANDED CHAT FILLS PERFECTLY */
        .expanded-chat { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; max-width: 100vw !important; height: 100vh !important; height: 100dvh !important; max-height: none !important; z-index: 100000 !important; border-radius: 0 !important; margin: 0 !important; background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(5, 10, 21, 1)) !important; }
        
        .wa-header { position: relative; z-index: 2; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); padding: 16px 20px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-wrap: nowrap; box-sizing: border-box; width: 100%; }
        .wa-avatar-container { position: relative; flex-shrink: 0; }
        .wa-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .status-dot { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; border: 2px solid #0f172a; box-shadow: 0 0 8px rgba(34, 197, 94, 0.6); transition: background 0.3s ease; }
        .wa-header-text { flex: 1; min-width: 0; }
        .wa-header-text h3 { margin: 0; color: #f8fafc; font-size: 1.1rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wa-header-text p { margin: 0; color: #94a3b8; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 5px; }
        .chat-expand-btn { flex-shrink: 0; margin-left: auto; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; transition: all 0.3s ease; z-index: 10; }
        .chat-expand-btn:hover { background: #3b82f6; border-color: #3b82f6; transform: scale(1.08); box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }
        .wa-body { position: relative; z-index: 1; flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px; background-color: transparent; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px; display: flex; flex-direction: column; gap: 18px; width: 100%; box-sizing: border-box; }
        .wa-body::-webkit-scrollbar { width: 6px; }
        .wa-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        
        .wa-bubble { position: relative; z-index: 2; padding: 12px 16px; border-radius: 16px; max-width: 85%; font-size: 0.95rem; line-height: 1.5; color: #f8fafc; word-break: break-word; white-space: pre-wrap; animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        .wa-sent { background: linear-gradient(135deg, #2563eb, #3b82f6); align-self: flex-end; border-bottom-right-radius: 4px; }
        .wa-received { background: linear-gradient(135deg, #1e293b, #0f172a); align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.08); }
        .wa-time { font-size: 0.7rem; color: rgba(255,255,255,0.5); float: right; margin-left: 12px; margin-top: 6px; font-weight: 600; }
        
        /* REACTION SYSTEM CSS */
        .msg-emoji-trigger { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: all 0.2s ease; font-size: 0.8rem; z-index: 20; }
        .bubble-wrapper:hover .msg-emoji-trigger { opacity: 1; }
        .msg-emoji-trigger:hover { background: #3b82f6; border-color: #3b82f6; transform: translateY(-50%) scale(1.1); }
        .reaction-menu { position: absolute; top: -38px; background: rgba(30, 41, 59, 0.95); padding: 6px 12px; border-radius: 20px; display: flex; gap: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); z-index: 50; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .reaction-menu button { background: transparent; border: none; font-size: 1.3rem; cursor: pointer; transition: transform 0.2s ease; padding: 0; outline: none;}
        .reaction-menu button:hover { transform: scale(1.4) translateY(-3px); }
        .msg-reaction { position: absolute; bottom: -12px; background: #0f172a; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; padding: 4px 6px; font-size: 0.85rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 5; }

        /* BUG FIX: INPUT BUTTON OVERFLOW */
        .wa-footer { position: relative; z-index: 2; padding: 15px 20px; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); display: flex; gap: 12px; border-top: 1px solid rgba(255,255,255,0.08); width: 100%; box-sizing: border-box; }
        .wa-input { flex: 1; min-width: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: white; padding: 14px 20px; border-radius: 30px; outline: none; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box; }
        .wa-input:focus { background: rgba(255,255,255,0.1); border-color: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
        .wa-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; width: 48px; height: 48px; border-radius: 50%; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: all 0.3s ease; flex-shrink: 0; }
        .wa-btn:hover { transform: scale(1.08) translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6); }
        
        @keyframes popIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes customSpinner { to { transform: rotate(360deg); } }
        
        .finger-indicator { position: absolute; bottom: -30px; right: 5px; font-size: 1.8rem; animation: tapBounce 1s infinite alternate; z-index: 100; text-shadow: 0 4px 10px rgba(0,0,0,0.5); pointer-events: none; }
        @keyframes tapBounce { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-10px) scale(1.1); opacity: 0.8; } }

        /* UPGRADED MOBILE MEDIA QUERY TO PREVENT SEND BUTTON OVERFLOW */
        @media (max-width: 1024px) {
          .wa-widget::before { font-size: 1.5rem !important; letter-spacing: 4px !important; white-space: normal !important; text-align: center; padding: 0 20px; line-height: 1.4; width: 90%; }
          .msg-emoji-trigger { opacity: 1 !important; width: 24px; height: 24px; font-size: 0.7rem; }
          .typewriter-text { white-space: normal !important; border-right: none !important; animation: none !important; max-width: 100% !important; }
          .top-nav-glass { position: fixed !important; top: 85px !important; left: 5% !important; z-index: 9998 !important; display: flex !important; flex-direction: column !important; gap: 12px !important; padding: 15px !important; margin: 0 !important; width: 90% !important; }
          .top-nav-links { display: flex !important; width: 100% !important; justify-content: center !important; flex-wrap: wrap !important; gap: 15px !important; } 
          .top-nav-link { font-size: 0.85rem !important; }
          .top-search-wrapper { margin: 0 !important; width: 100% !important; max-width: 100% !important; padding: 12px 15px !important;}
          .wa-widget { height: 80vh; max-height: 600px; border-radius: 16px; max-width: 100vw !important; overflow: hidden; box-sizing: border-box; } 
          .articles-container, .projects-container { display: flex !important; flex-direction: column !important; width: 100% !important; }
          
          /* PERFECT MOBILE INPUT ALIGNMENT */
          .wa-footer { padding: 10px 12px !important; gap: 8px !important; }
          .wa-input { padding: 12px 16px !important; font-size: 0.95rem !important; }
          .wa-btn { width: 42px !important; height: 42px !important; font-size: 1rem !important; }
        }
        @media (min-width: 1025px) {
          .finger-indicator { display: none !important; }
        }
      `}} />

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
            <button onClick={() => setShowBootOverlay(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}>✕</button>
            <div style={{ width: '45px', height: '45px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'customSpinner 1s linear infinite', margin: '0 auto 25px auto' }}></div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>Initializing Server</h2>
            <p style={{ fontWeight: '600', opacity: 0.8, lineHeight: '1.6', fontSize: '0.95rem' }}>
              The secure architecture is waking up from its standby state. Please hold on...
            </p>
          </div>
        </div>
      )}
      
      {!isChatExpanded && (
        <div className="ui-controls" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 999999 }}>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="ui-btn">
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          
          <button 
            className="ui-btn mobile-menu-btn"
            onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setHasTappedMenu(true); // BUG FIX 4: DISMISSES FINGER PERMANENTLY
            }}
            style={{ position: 'relative' }}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
            {!isMobileMenuOpen && !hasTappedMenu && <div className="finger-indicator">👆</div>}
          </button>
        </div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <img src="/profile.png" alt="Venkata Pavan Kumar Profile" className="profile-img" />
        <h1>Venkata Pavan Kumar</h1>
        <p className="title"><span className="typewriter-text">Systems Architect & Backend Engineer</span></p>

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

      <main className="main-content">
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
        
        {isAiLoading && <div className="loading-text" style={{ padding: '0 28px 20px 28px', color: '#3b82f6', fontWeight: '600' }}><div className="loading-dot"></div> Analyzing query infrastructure...</div>}
        {aiResponse && !isAiLoading && (
          <div 
            ref={aiResponseRef} 
            className="ai-response-window ai-jump-target" 
            style={{ margin: '0 auto 30px auto', maxWidth: '1300px', width: '96%' }}
          >
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

        <div className="hero-section">
          <h1>Welcome to my Engineering Portfolio.</h1>
          <p>I am <strong>Venkata Pavan Kumar Amarthaluri</strong>, a Systems Architect specialized in high-performance backend infrastructure.</p>
        </div>

        {showBanner && (
          <div className="scrolling-ticker">
            <div className="scrolling-text">
              🚀 ARCHITECTING ROBUST BACKEND INFRASTRUCTURE • SECURE SYSTEM DESIGN & SCALABILITY • DEPLOYING HIGH-PERFORMANCE SOLUTIONS
            </div>
          </div>
        )}

        <div className="grid-layout">
          <section id="projects" className="projects-container">
            <h2 className="main-heading">✦ Live Architecture Projects</h2>
            <div className="projects-grid">
              <a href="https://subhams-agent-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-card card-blue">
                <h3>🌐 Subhams Secure Networks</h3>
                <p>RAM-based transient state architecture.</p>
                <div className="project-metrics">⚡ Processes 10k+ ops/sec</div>
              </a>
              <a href="https://bhavyams-vendor-hub-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-card card-orange">
                <h3>🛒 Bhavyams VendorHub</h3>
                <p>Scalable E-commerce ecosystem engine.</p>
                <div className="project-metrics">🚀 Handles 5k+ concurrent requests</div>
              </a>
              <a href="https://subhams-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" className="project-card card-green">
                <h3>🔒 PMMS System</h3>
                <p>Secure financial tracking infrastructure.</p>
                <div className="project-metrics">🛡️ Zero-disk data retention</div>
              </a>
            </div>
          </section>

          <section id="articles" className="articles-container">
            <h2 className="main-heading" style={{ marginTop: '20px' }}>📝 Technical Publications</h2>
            <div className="articles-list">
              {Array.isArray(publishedArticles) && publishedArticles.length > 0 ? (
                publishedArticles.map((article) => (
                  <Link to={`/article/${article.slug}`} key={article._id} className="article-preview-line">
                    <div className="article-meta">
                      <span className="article-date">{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    
                    <h3 className="article-title" style={{ fontWeight: '900' }}>{article.title}</h3>
                    
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

          <section id="contact" style={{ display: 'flex', flexDirection: 'column', marginTop: '40px', paddingBottom: '40px' }}>
            <h2 style={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: '1.4rem', fontWeight: '900', display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <span className="live-dot" style={{ background: isConnected ? '#22c55e' : '#f59e0b', display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', marginRight: '10px', boxShadow: isConnected ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none', animation: isConnected ? 'pulse 2s infinite' : 'none' }}></span>
              Direct Secure Line
            </h2>
            
            <div className={`wa-widget ${isChatExpanded ? 'expanded-chat' : ''}`}>
              <div className="wa-header">
                <div className="wa-avatar-container">
                  <img src="/profile.png" alt="Venkata Pavan Kumar" className="wa-avatar" />
                  <span className="status-dot" style={{ background: isConnected ? '#22c55e' : '#f59e0b', boxShadow: isConnected ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none' }}></span>
                </div>
             <div
  className="wa-header-text"
  style={{
    minWidth: 0,
    flex: 1
  }}
>
  <h3
    style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      margin: 0,
      fontSize: '1rem'
    }}
  >
    Venkata Pavan Kumar
  </h3>

  <p>
    <span style={{ color: isConnected ? '#22c55e' : '#f59e0b', fontSize: '1.2rem' }}>•</span>
    {isConnected ? 'System Architect Online' : 'Connecting to Server...'}
  </p>
</div>
                <button 
                  className="chat-expand-btn"
                  onClick={() => setIsChatExpanded(!isChatExpanded)} 
                  title={isChatExpanded ? "Minimize Chat" : "Expand Chat"}
                >
                  {isChatExpanded ? '✕' : '⛶'}
                </button>
              </div>

              <div className="wa-body">
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                    🔒 End-to-end encrypted connection
                  </span>
                </div>
                
                {chatLog.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.95rem', marginTop: '30px', fontWeight: '500' }}>Send a message to connect securely.</div>}
                
                {chatLog.map((log, i) => (
                  <div 
                    key={i} 
                    className="bubble-wrapper"
                    style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMsgId(log._id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                    onClick={() => setHoveredMsgId(hoveredMsgId === log._id ? null : log._id)}
                  >
                    <div className={`wa-bubble ${log.type === 'sent' ? 'wa-sent' : 'wa-received'}`}>
                        {log._id && !log._id.includes('temp') && (
                            <button 
                                className="msg-emoji-trigger" 
                                style={{ [log.type === 'sent' ? 'left' : 'right']: '-40px' }}
                                onClick={(e) => { e.stopPropagation(); setHoveredMsgId(hoveredMsgId === log._id ? null : log._id); }}
                            >
                                +
                            </button>
                        )}

                        {hoveredMsgId === log._id && log._id && !log._id.includes('temp') && (
                            <div className="reaction-menu" style={{ [log.type === 'sent' ? 'right' : 'left']: '10px' }}>
                                {quickReactions.map(emoji => (
                                    <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReact(log._id, emoji); }}>{emoji}</button>
                                ))}
                            </div>
                        )}

                      {log.type === 'received' && (
                        <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: '900', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {log.sender === 'bot' ? 'Subhams AI Agent' : 'Venkata Pavan Kumar'}
                        </div>
                      )}
                      {log.text}
                      <span className="wa-time">{log.time}</span>

                      {log.reaction && (
                          <div className="msg-reaction" style={{ [log.type === 'sent' ? 'right' : 'left']: '5px' }}>
                              {log.reaction}
                          </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="wa-footer" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', outline: 'none', padding: '0 5px' }}
                  title="Insert Emoji"
                >
                  +
                </button>

                {showEmojiPicker && (
                  <div style={{ position: 'absolute', bottom: '75px', left: '20px', background: 'rgba(15,23,42,0.95)', padding: '12px', borderRadius: '16px', display: 'flex', gap: '12px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100 }}>
                    {['👍', '❤️', '😂', '🔥', '👀', '✅', '🚀', '💯'].map(emoji => (
                      <button key={emoji} onClick={() => insertEmoji(emoji)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', transition: '0.2s' }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <input 
                  className="wa-input" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  placeholder="Type a message to Pavan..." 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                />
                <button onClick={handleSendMessage} className="wa-btn">➤</button>
              </div>
            </div>
          </section>

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
  
  const [isLiking, setIsLiking] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch (err) {}
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
    } catch (err) {}
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
        <title>{article.title} | Venkata Pavan Kumar</title>
        <meta name="description" content={cleanDescription} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={`${article.title} | Venkata Pavan Kumar`} />
        <meta property="og:description" content={cleanDescription} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
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
            <div className="author-card">
              <img src="/profile.png" alt="Pavan" className="author-avatar" />
              <div className="author-info">
                <strong>Venkata Pavan Kumar</strong>
                <span>Posted on {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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

  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  const quickReactions = ['👍', '❤️', '😂', '🔥', '👀'];

  useEffect(() => {
    if (messagesEndRef.current && adminView === 'chats') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, activeRoom, adminView]);

  useEffect(() => {
    localStorage.setItem('admin_chats', JSON.stringify(conversations));
  }, [conversations]);
  
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join_admin');
    };
    const onDisconnect = () => setIsConnected(false);

    const onAdminConfirmation = (payload) => {
      if (payload && payload.offlineHistory) {
        const updatedConversations = {};
        Object.keys(payload.offlineHistory).forEach((roomId) => {
          const backendMsgs = payload.offlineHistory[roomId];
          updatedConversations[roomId] = backendMsgs.map(msg => ({
            _id: msg._id,
            sender: msg.sender === 'Visitor' ? 'visitor' : 'admin',
            text: msg.message,
            time: cleanTimestamp(msg.timestamp), 
            reaction: msg.reaction
          }));
        });
        setConversations(updatedConversations);
      }
    };

    const onNewVisitorMsg = (data) => {
      setConversations(prev => ({
        ...prev,
        [data.roomId]: [...(prev[data.roomId] || []), { 
          _id: data._id,
          sender: 'visitor', 
          text: data.message, 
          time: cleanTimestamp(data.timestamp), 
          reaction: data.reaction 
        }]
      }));
    };

    const onReaction = (data) => {
      setConversations(prev => {
        const roomHistory = prev[data.roomId];
        if (!roomHistory) return prev;
        return {
          ...prev,
          [data.roomId]: roomHistory.map(msg => msg._id === data.messageId ? { ...msg, reaction: data.reaction } : msg)
        };
      });
    };

    const onAdminSaved = (data) => {
      setConversations(prev => {
        const roomHistory = prev[data.targetRoom];
        if (!roomHistory) return prev;
        const updatedRoom = [...roomHistory];
        for(let i = updatedRoom.length - 1; i >= 0; i--) {
          if (updatedRoom[i].sender === 'admin' && updatedRoom[i].text === data.message && updatedRoom[i]._id?.startsWith('temp')) {
              updatedRoom[i]._id = data._id;
              updatedRoom[i].time = cleanTimestamp(data.timestamp); 
              break;
          }
        }
        return { ...prev, [data.targetRoom]: updatedRoom };
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('admin_joined_confirmation', onAdminConfirmation);
    socket.on('new_visitor_msg', onNewVisitorMsg);
    socket.on('reaction_updated', onReaction);
    socket.on('admin_msg_saved', onAdminSaved);

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('join_admin');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('admin_joined_confirmation', onAdminConfirmation);
      socket.off('new_visitor_msg', onNewVisitorMsg);
      socket.off('reaction_updated', onReaction);
      socket.off('admin_msg_saved', onAdminSaved);
    };
  }, []);

  const sendReply = (roomId) => {
    const text = replyInputs[roomId];
    if (!text || !text.trim()) return;
    
    socket.emit('admin_reply', { targetRoom: roomId, message: text });
    
    setConversations(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), { 
        _id: `temp_${Date.now()}`, 
        sender: 'admin', 
        text: text, 
        time: getCleanTime(), 
        reaction: null
      }]
    }));
    setReplyInputs(prev => ({ ...prev, [roomId]: '' }));
    setShowEmojiPicker(false);
  };

  const closeConversation = (roomId) => {
    const updatedChats = { ...conversations };
    delete updatedChats[roomId];
    setConversations(updatedChats);
    if (activeRoom === roomId) setActiveRoom(null);
  };

  const handleReact = (messageId, reaction, roomId) => {
    if(!messageId || messageId.startsWith('temp')) return; 
    
    socket.emit('react_to_msg', { messageId, reaction, roomId });
    
    setConversations(prev => {
      const roomHistory = prev[roomId];
      if (!roomHistory) return prev;
      return {
        ...prev,
        [roomId]: roomHistory.map(msg => msg._id === messageId ? { ...msg, reaction: reaction } : msg)
      };
    });

    setHoveredMsgId(null);
  };

  const insertEmoji = (emoji) => {
    setReplyInputs(prev => ({ ...prev, [activeRoom]: (prev[activeRoom] || '') + emoji }));
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
    <div className="admin-wrapper" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#050a15', fontFamily: "'Inter', sans-serif" }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 350px; flex-shrink: 0; background: rgba(15, 23, 42, 0.95); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; z-index: 10; backdrop-filter: blur(20px); }
        .admin-main { flex: 1; display: flex; flex-direction: column; position: relative; background: radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 1) 0%, rgba(5, 10, 21, 1) 100%); }
        .room-item:hover { background: rgba(255,255,255,0.05); }
        .room-item.active { background: rgba(59, 130, 246, 0.15); border-left: 4px solid #3b82f6; }
        
        .wa-bubble { position: relative; z-index: 2; padding: 12px 16px; border-radius: 16px; max-width: 85%; font-size: 0.95rem; line-height: 1.5; color: #f8fafc; word-break: break-word; white-space: pre-wrap; animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        .wa-sent { background: linear-gradient(135deg, #2563eb, #3b82f6); align-self: flex-end; border-bottom-right-radius: 4px; }
        .wa-received { background: linear-gradient(135deg, #1e293b, #0f172a); align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.08); }
        .wa-time { font-size: 0.7rem; color: rgba(255,255,255,0.5); float: right; margin-left: 12px; margin-top: 6px; font-weight: 600; }

        .msg-emoji-trigger { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: all 0.2s ease; font-size: 0.8rem; z-index: 20; }
        .bubble-wrapper:hover .msg-emoji-trigger { opacity: 1; }
        .msg-emoji-trigger:hover { background: #3b82f6; border-color: #3b82f6; transform: translateY(-50%) scale(1.1); }

        .reaction-menu { position: absolute; top: -38px; background: rgba(30, 41, 59, 0.95); padding: 6px 12px; border-radius: 20px; display: flex; gap: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); z-index: 50; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .reaction-menu button { background: transparent; border: none; font-size: 1.3rem; cursor: pointer; transition: transform 0.2s ease; padding: 0; outline: none;}
        .reaction-menu button:hover { transform: scale(1.4) translateY(-3px); }
        .msg-reaction { position: absolute; bottom: -12px; background: #0f172a; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; padding: 4px 6px; font-size: 0.85rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 5; }

        /* BUG FIX: Mobile Back Button Logic */
        .mobile-back-btn { display: none !important; }

        @media (max-width: 768px) {
          .msg-emoji-trigger { opacity: 1 !important; width: 24px; height: 24px; font-size: 0.7rem; }
          .admin-wrapper { flex-direction: column; }
          .admin-sidebar { width: 100%; flex: 1; display: ${activeRoom || adminView === 'write' ? 'none' : 'flex'} !important; border-right: none; }
          .admin-main { display: ${activeRoom || adminView === 'write' ? 'flex' : 'none'} !important; height: 100%; width: 100%; }
          .chat-window { padding: 20px 5% !important; }
          .write-article-container { padding: 20px !important; } /* Better padding on mobile */
          .mobile-back-btn { display: flex !important; } /* Show back button only on mobile */
        }
      `}} />

      <aside className="admin-sidebar">
        <div className="admin-nav-tabs" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button className={`admin-tab ${adminView === 'chats' ? 'active-tab' : ''}`} onClick={() => setAdminView('chats')} style={{ flex: 1, padding: '18px', background: adminView === 'chats' ? 'rgba(255,255,255,0.1)' : 'transparent', color: adminView === 'chats' ? '#fff' : '#94a3b8', border: 'none', borderBottom: adminView === 'chats' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: 'bold' }}>Live Chats</button>
          <button className={`admin-tab ${adminView === 'write' ? 'active-tab' : ''}`} onClick={() => { setAdminView('write'); setActiveRoom(null); }} style={{ flex: 1, padding: '18px', background: adminView === 'write' ? 'rgba(255,255,255,0.1)' : 'transparent', color: adminView === 'write' ? '#fff' : '#94a3b8', border: 'none', borderBottom: adminView === 'write' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: 'bold' }}>Write Article</button>
        </div>

        {adminView === 'chats' && (
          <>
            <div className="sidebar-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800', color: '#f8fafc' }}>Active Tunnels</h2>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isConnected ? '#22c55e' : '#ef4444', boxShadow: isConnected ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none' }} title={isConnected ? "Online" : "Offline"}></div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {Object.keys(conversations).length === 0 ? (
                  <div style={{ padding: '30px', color: '#64748b', textAlign: 'center', fontWeight: '600' }}>No active users detected.</div>
              ) : (
                Object.keys(conversations).map(roomId => {
                  const lastMsg = conversations[roomId][conversations[roomId].length - 1];
                  return (
                    <button key={roomId} className={`room-item ${activeRoom === roomId ? 'active' : ''}`} onClick={() => setActiveRoom(roomId)} style={{ width: '100%', padding: '15px 20px', background: activeRoom === roomId ? 'rgba(59,130,246,0.1)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: '0.2s', textAlign: 'left' }}>
                      <div className="avatar" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '800', color: '#f8fafc' }}>{roomId.replace('user_', 'User ')}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{lastMsg?.time}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
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
          <div className="write-article-container" style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            
            {/* BUG FIX: Added Back Button for Mobile Article Writer */}
            <button 
              className="mobile-back-btn" 
              onClick={() => setAdminView('chats')}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', padding: '10px 15px', borderRadius: '12px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold', alignItems: 'center', gap: '8px', width: 'fit-content' }}
            >
              ← Back to Chats
            </button>

            <h2 style={{ color: '#f8fafc', marginBottom: '25px', fontWeight: '900', fontSize: '2.5rem', letterSpacing: '-1px' }}>Draft New Architecture Post</h2>
            <form onSubmit={handlePublishArticle} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <input className="admin-input-title" value={articleTitle} onChange={e => setArticleTitle(e.target.value)} placeholder="New post title here..." style={{ background: 'transparent', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.2)', fontSize: '2rem', color: 'white', padding: '10px 0', marginBottom: '20px', outline: 'none', fontWeight: 'bold' }} />
              <textarea className="admin-input-content" value={articleContent} onChange={e => setArticleContent(e.target.value)} placeholder="Write your content in Markdown... (e.g. ## Introduction)" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', color: 'white', fontSize: '1.1rem', fontFamily: 'monospace', outline: 'none', resize: 'none', marginBottom: '20px' }} />
              <button type="submit" className="admin-publish-btn" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', fontSize: '1.2rem', fontWeight: '800', padding: '18px', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', boxShadow: '0 8px 20px rgba(37,99,235,0.3)' }}>Publish Post to Live Portfolio</button>
            </form>
          </div>
        ) : (
              activeRoom ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="chat-header" style={{ padding: '15px 30px', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="avatar" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: '900' }}>{activeRoom.replace('user_', 'User ')}</h2>
                    <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%'}}></span>
                      Active Tunnel
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveRoom(null)} 
                  style={{ 
                    background: 'rgba(239,68,68,0.15)', 
                    border: '1px solid rgba(239,68,68,0.3)', 
                    color: '#ef4444', 
                    padding: '10px 18px', 
                    borderRadius: '20px', 
                    cursor: 'pointer', 
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                >
                  ✕ Close Chat
                </button>
              </div>
              
              <div className="chat-window" style={{ flex: 1, padding: '30px 10%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ textAlign: 'center', margin: '15px 0' }}>
                  <span style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🔒 Secure Admin Channel
                  </span>
                </div>

                {conversations[activeRoom].map((m, i) => (
                  <div 
                    key={i} 
                    className="bubble-wrapper"
                    style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '16px', position: 'relative', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMsgId(m._id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                    onClick={() => setHoveredMsgId(hoveredMsgId === m._id ? null : m._id)}
                  >
                    
                    <div className={`wa-bubble ${m.sender === 'admin' ? 'wa-sent' : 'wa-received'}`}>

                      {m._id && !m._id.includes('temp') && (
                          <button 
                              className="msg-emoji-trigger" 
                              style={{ [m.sender === 'admin' ? 'left' : 'right']: '-40px' }}
                              onClick={(e) => { e.stopPropagation(); setHoveredMsgId(hoveredMsgId === m._id ? null : m._id); }}
                          >
                              +
                          </button>
                      )}

                      {hoveredMsgId === m._id && m._id && !m._id.includes('temp') && (
                          <div className="reaction-menu" style={{ [m.sender === 'admin' ? 'right' : 'left']: '10px', top: '-40px' }}>
                              {quickReactions.map(emoji => (
                                  <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReact(m._id, emoji, activeRoom); }}>{emoji}</button>
                              ))}
                          </div>
                      )}

                      {m.sender !== 'admin' && (
                        <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: '900', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Visitor
                        </div>
                      )}
                      
                      {m.text}
                      <span className="wa-time">{m.time}</span>
                      
                      {m.reaction && (
                          <div className="msg-reaction" style={{ [m.sender === 'admin' ? 'right' : 'left']: '5px', position: 'absolute', bottom: '-12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '4px 6px', fontSize: '0.85rem' }}>
                              {m.reaction}
                          </div>
                      )}

                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="admin-input-area" style={{ padding: '20px 30px', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '15px', position: 'relative' }}>
                
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', outline: 'none', transition: '0.2s', padding: '0 5px' }}
                  title="Insert Emoji"
                >
                  +
                </button>

                {showEmojiPicker && (
                  <div style={{ position: 'absolute', bottom: '80px', left: '30px', background: 'rgba(15,23,42,0.95)', padding: '12px', borderRadius: '16px', display: 'flex', gap: '12px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100 }}>
                    {['👍', '❤️', '😂', '🔥', '👀', '✅', '🚀', '💯'].map(emoji => (
                      <button key={emoji} onClick={() => insertEmoji(emoji)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', transition: '0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.3)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <input 
                  className="admin-input"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#f8fafc', padding: '16px 24px', borderRadius: '30px', outline: 'none', fontSize: '1.05rem', fontWeight: '500', transition: '0.3s' }}
                  value={replyInputs[activeRoom] || ''} 
                  onChange={(e) => setReplyInputs(prev => ({ ...prev, [activeRoom]: e.target.value }))} 
                  onKeyDown={(e) => e.key === 'Enter' && sendReply(activeRoom)} 
                  placeholder="Message the visitor..." 
                  onFocus={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                />
                <button onClick={() => sendReply(activeRoom)} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', width: '55px', height: '55px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(59,130,246,0.4)', transition: '0.2s', flexShrink: 0 }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>➤</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
              <div style={{ width: '90px', height: '90px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>🛡️</div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#f8fafc', marginBottom: '10px' }}>Secure Admin Hub</h2>
              <p style={{ fontWeight: '500', fontSize: '1.1rem' }}>Select an active tunnel to establish a secure connection.</p>
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