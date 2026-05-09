import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import styles from './AIChat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI Assistant. You can ask me anything about attendance, or any general questions you have. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post('https://attendance-dtable.vercel.app/ai/chat', { query: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please check your internet or try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className={styles.toggleBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Chat"
      >
        {isOpen ? <X /> : <MessageSquare />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.title}>
              <Bot size={20} />
              <span>Attendance AI</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>

          <div className={styles.messages} ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.icon}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.icon}><Bot size={14} /></div>
                <div className={styles.bubble}>
                  <Loader2 className={styles.spin} size={16} />
                </div>
              </div>
            )}
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={!query.trim() || loading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChat;
