import { useState, useEffect, useRef } from 'react';
import { socket } from './socket'; // Ensure this points to your socket setup

// ==========================================
// 2. WHATSAPP-STYLE ADMIN DASHBOARD
// ==========================================
export function AdminDashboard() {
  const [conversations, setConversations] = useState(() => {
    const savedChats = localStorage.getItem('admin_chats');
    return savedChats ? JSON.parse(savedChats) : {};
  });
  
  // THIS IS THE MAGIC STATE FOR THE MENU: It tracks which chat you clicked
  const [activeRoom, setActiveRoom] = useState(null); 
  const [replyInputs, setReplyInputs] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, activeRoom]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('admin_chats', JSON.stringify(conversations));
  }, [conversations]);

  // Unified Socket Logic (BUG FIXED with Offline History Sync)
  useEffect(() => {
    // Shared callback when admin connects or joins
    const handleJoinAdmin = () => {
      setIsConnected(true);
      socket.emit('join_admin');
      console.log("[SYSTEM] Admin join requested");
    };

    // THE FIX: Catch history dump from backend on successful login
    const onAdminConfirmation = (payload) => {
      console.log("[SYSTEM] Admin access confirmed. Syncing history:", payload);
      
      if (payload && payload.offlineHistory) {
        setConversations(prev => {
          const updatedConversations = { ...prev };

          // Loop over rooms in backend data cache
          Object.keys(payload.offlineHistory).forEach((roomId) => {
            const backendMsgs = payload.offlineHistory[roomId];
            
            // Format backend messages to match dashboard structural fields
            const formattedMsgs = backendMsgs.map(msg => ({
              sender: msg.sender === 'Visitor' ? 'visitor' : 'admin',
              text: msg.message,
              time: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            // Complete synchronization without erasing prior data blocks
            updatedConversations[roomId] = formattedMsgs;
          });

          return updatedConversations;
        });
      }
    };

    // Check if socket is ALREADY connected when dashboard opens
    if (socket.connected) {
      handleJoinAdmin();
    }

    socket.on('connect', handleJoinAdmin);
    socket.on('disconnect', () => setIsConnected(false));
    
    // Register historical data synchronization trigger
    socket.on('admin_joined_confirmation', onAdminConfirmation);

    socket.on('new_visitor_msg', (data) => {
      console.log("Live message arrived:", data);
      setConversations(prev => ({
        ...prev,
        [data.roomId]: [...(prev[data.roomId] || []), { 
          sender: 'visitor', 
          text: data.message, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]
      }));
    });

    return () => {
      socket.off('connect', handleJoinAdmin);
      socket.off('disconnect');
      socket.off('admin_joined_confirmation', onAdminConfirmation);
      socket.off('new_visitor_msg');
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
    if (activeRoom === roomId) setActiveRoom(null); // Close the right side if deleted
  };

  return (
    <div className="admin-wrapper">
      {/* ALL WHATSAPP STYLES INCLUDED HERE FOR GUARANTEED RENDERING */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-wrapper { display: flex; height: 100vh; width: 100vw; background: #0b141a; color: white; font-family: 'Segoe UI', sans-serif; overflow: hidden; position: fixed; top:0; left:0; z-index: 9999; }
        
        /* LEFT MENU (CONTACTS) */
        .admin-sidebar { width: 350px; border-right: 1px solid #222d34; display: flex; flex-direction: column; background: #111b21; }
        .sidebar-header { padding: 15px 20px; background: #202c33; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222d34; }
        .room-item { padding: 15px; background: transparent; border: none; border-bottom: 1px solid #222d34; cursor: pointer; color: #e9edef; text-align: left; display: flex; align-items: center; gap: 15px; transition: 0.2s; width: 100%; }
        .room-item:hover { background: #202c33; }
        .room-item.active { background: #2a3942; }
        .avatar { width: 45px; height: 45px; background: #6b7c85; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
        
        /* RIGHT CHAT AREA */
        .admin-main { flex: 1; display: flex; flex-direction: column; background: #0b141a; position: relative; }
        .chat-header { padding: 10px 20px; background: #202c33; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222d34; }
        .chat-window { flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 20px 5%; background-color: #0b141a; background-image: radial-gradient(#202c33 1px, transparent 1px); background-size: 20px 20px; }
        
        /* BUBBLE ANIMATION & TAILS */
        @keyframes popIn { 0% { opacity: 0; transform: translateY(10px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .bubble-wrapper { display: flex; flex-direction: column; width: 100%; margin-bottom: 8px; animation: popIn 0.2s ease forwards; }
        .bubble-wrapper.sent-wrapper { align-items: flex-end; }
        .bubble-wrapper.received-wrapper { align-items: flex-start; }
        .bubble { padding: 8px 12px; border-radius: 8px; max-width: 65%; position: relative; font-size: 0.95rem; line-height: 1.4; }
        
        .sent { background: #005c4b; color: #e9edef; border-top-right-radius: 0; margin-right: 10px; }
        .sent::before { content: ""; position: absolute; top: 0; right: -8px; border-bottom: 12px solid transparent; border-left: 10px solid #005c4b; }
        
        .received { background: #202c33; color: #e9edef; border-top-left-radius: 0; margin-left: 10px; }
        .received::before { content: ""; position: absolute; top: 0; left: -8px; border-bottom: 12px solid transparent; border-right: 10px solid #202c33; }
        
        .msg-time { font-size: 0.65rem; color: rgba(255,255,255,0.6); float: right; margin-left: 15px; margin-top: 5px; }

        /* INPUT BAR */
        .admin-input-area { padding: 12px 20px; background: #202c33; display: flex; gap: 12px; align-items: center; }
        .admin-input { flex: 1; background: #2a3942; border: none; color: white; padding: 14px 20px; border-radius: 24px; outline: none; font-size: 1rem; }
        .admin-btn { background: #00a884; color: #111b21; border: none; width: 45px; height: 45px; border-radius: 50%; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .admin-btn:hover { background: #06cf9c; }
      `}} />

      {/* --- LEFT SIDE: THE MENU --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Chats</h2>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? '#00a884' : '#ef4444' }} title="Server Status"></div>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {Object.keys(conversations).length === 0 ? (
             <div style={{ padding: '20px', color: '#8696a0', textAlign: 'center' }}>No active users.</div>
          ) : (
            Object.keys(conversations).map(roomId => {
              const lastMsg = conversations[roomId][conversations[roomId].length - 1];
              return (
                <button 
                  key={roomId} 
                  className={`room-item ${activeRoom === roomId ? 'active' : ''}`}
                  onClick={() => setActiveRoom(roomId)}
                >
                  <div className="avatar">👤</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>{roomId.replace('room_', 'User ')}</span>
                      <span style={{ fontSize: '0.75rem', color: '#8696a0' }}>{lastMsg?.time}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lastMsg?.sender === 'admin' ? '✓✓ ' : ''}{lastMsg?.text}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* --- RIGHT SIDE: THE CHAT --- */}
      <main className="admin-main">
        {activeRoom ? (
          <>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px' }}>👤</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem' }}>{activeRoom.replace('room_', 'User ')}</h2>
                  <span style={{ fontSize: '0.8rem', color: '#8696a0' }}>Online</span>
                </div>
              </div>
              <button onClick={() => closeConversation(activeRoom)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold' }}>Close Chat</button>
            </div>
            
            <div className="chat-window">
              <div style={{ textAlign: 'center', margin: '15px 0' }}>
                <span style={{ background: '#182229', color: '#8696a0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                  End-to-end encrypted session
                </span>
              </div>

              {conversations[activeRoom].map((m, i) => (
                <div key={i} className={`bubble-wrapper ${m.sender === 'admin' ? 'sent-wrapper' : 'received-wrapper'}`}>
                  <div className={`bubble ${m.sender === 'admin' ? 'sent' : 'received'}`}>
                    <span>{m.text}</span>
                    <span className="msg-time">{m.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="admin-input-area">
              <input 
                className="admin-input"
                value={replyInputs[activeRoom] || ''} 
                onChange={(e) => setReplyInputs(prev => ({ ...prev, [activeRoom]: e.target.value }))} 
                onKeyDown={(e) => e.key === 'Enter' && sendReply(activeRoom)} 
                placeholder="Type a message" 
              />
              <button onClick={() => sendReply(activeRoom)} className="admin-btn">➤</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8696a0' }}>
            <h2>WhatsApp Web Layout</h2>
            <p>Click a user on the left menu to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
}