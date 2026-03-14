"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Youtube, Loader2, ListTree, FileText, Settings, LogIn, LogOut, User } from "lucide-react";
import SummaryResult from "@/components/SummaryResult";
import SettingsModal from "@/components/SettingsModal";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [inputUrls, setInputUrls] = useState("");
  const [summaryType, setSummaryType] = useState<"general" | "detailed">("general");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nextResetSeconds, setNextResetSeconds] = useState(60);
  const isMounted = useRef(false);

  // Simple token estimation (approx 4 chars per token)
  useEffect(() => {
    const chars = inputUrls.trim().length;
    setEstimatedTokens(Math.ceil(chars / 3)); // Slightly more conservative for mixed content
  }, [inputUrls]);
  
  // Quota reset timer logic (TPM resets every minute)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNextResetSeconds(60 - now.getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const savedTokens = localStorage.getItem("session-total-tokens");
    if (savedTokens) {
      setTotalTokens(parseInt(savedTokens, 10));
    }
  }, []);

  // Save total tokens to localStorage whenever it changes, but skip the initial 0-state mount
  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem("session-total-tokens", totalTokens.toString());
    } else {
      isMounted.current = true;
    }
  }, [totalTokens]);

  const FREE_TIER_LIMIT = 1000000; // 1M TPM for Gemini 1.5 Flash

  const handleSummarize = async () => {
    if (!inputUrls.trim()) return;

    setLoading(true);
    setResults([]);

    const urls = inputUrls
      .split(/[\s\n]+/)
      .filter((url) => url.includes("youtube.com") || url.includes("youtu.be"));

    const userApiKey = localStorage.getItem("user-gemini-api-key");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(userApiKey ? { "X-Gemini-API-Key": userApiKey } : {})
        },
        body: JSON.stringify({ urls, type: summaryType }),
      });

      const data = await response.json();
      if (data.results) {
        setResults(data.results);
        const batchTokens = data.results.reduce((acc: number, res: any) => {
          return acc + (res.usage?.totalTokens || 0);
        }, 0);
        setTotalTokens(prev => prev + batchTokens);
      }
    } catch (error) {
      console.error("Summarization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <header className="app-header">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="glass-btn icon-btn hover:scale-110 transition-transform"
          title="설정"
        >
          <Settings size={14} className="text-gray-300" />
        </button>
        
        {session ? (
          <div className="user-profile">
            {session.user?.image ? (
              <img src={session.user.image} alt="User" className="user-avatar" />
            ) : (
              <User size={12} className="text-indigo-400" />
            )}
            <span className="user-name-text">{session.user?.name?.charAt(0) || "U"}</span>
            <button onClick={() => signOut()} className="logout-btn">로그아웃</button>
          </div>
        ) : (
          <button 
            onClick={() => signIn("google")}
            className="glass-btn login-btn-wide hover:bg-white/10 transition-colors"
            title="로그인"
          >
            <LogIn size={12} />
            <span className="login-btn-text ml-1">로그인</span>
          </button>
        )}
      </header>

      <header className="hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>AI 유튜브 텍스트 요약</h1>
          <p>
            유튜브 영상을 스마트하게 분석하여 텍스트로 요약해 드립니다. <br />
            여러 개의 링크를 입력하고 핵심 내용만 빠르게 확인하세요.
          </p>
        </motion.div>
      </header>

      <motion.section 
        className="input-area"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="mb-4 flex items-center justify-between gap-2" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Youtube size={20} />
            <span>유튜브 영상 주소 (여러 개 가능)</span>
          </div>
          {inputUrls.trim() && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md border border-indigo-500/30"
            >
              예상 사용량: ~{estimatedTokens.toLocaleString()} Tokens
            </motion.div>
          )}
        </div>
        
        <textarea
          placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/..."
          value={inputUrls}
          onChange={(e) => setInputUrls(e.target.value)}
        />

        <div className="controls">
          <div className="option-group">
            <button 
              className={`option-btn ${summaryType === "general" ? "active" : ""}`}
              onClick={() => setSummaryType("general")}
              type="button"
            >
              <FileText size={16} />
              일반 요약
            </button>
            <button 
              className={`option-btn ${summaryType === "detailed" ? "active" : ""}`}
              onClick={() => setSummaryType("detailed")}
              type="button"
            >
              <ListTree size={16} />
              세부 요약
            </button>
          </div>

          <button 
            disabled={loading || !inputUrls.trim()} 
            onClick={handleSummarize}
            style={{ marginLeft: 'auto' }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                요약 시작하기
              </>
            )}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="quota-section"
        >
          <div className="quota-header">
            <span className="quota-label">FREE TIER QUOTA (TPM)</span>
            <span className="text-sm">
              <span className="text-white font-bold">{totalTokens.toLocaleString()}</span> / {FREE_TIER_LIMIT.toLocaleString()} <small>Tokens</small>
            </span>
          </div>
          
          <div className="progress-bar-container">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalTokens / FREE_TIER_LIMIT) * 100, 100)}%` }}
              className="progress-bar-fill"
            />
          </div>

          <div className="usage-details">
            <div className="flex flex-col gap-1">
              <span>* 사용 기록은 브라우저에 자동 저장됩니다.</span>
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <span className="flex items-center gap-1">
                  <Loader2 size={12} className={nextResetSeconds > 58 ? "animate-spin" : ""} />
                  다음 갱신까지: {nextResetSeconds}초
                </span>
                <span className="opacity-40">|</span>
                <span>일일 초기화: 오전 09:00 (KST)</span>
              </div>
            </div>
            <span>Gemini 1.5 Flash 기준</span>
          </div>
        </motion.div>
      </motion.section>

      <section className="results">
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={result.url + index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <SummaryResult result={result} type={summaryType} />
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </main>
  );
}
