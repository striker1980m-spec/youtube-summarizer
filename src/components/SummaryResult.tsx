"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, ExternalLink, Copy } from "lucide-react";

interface SummaryResultProps {
  result: {
    url: string;
    videoId?: string;
    summary?: string;
    error?: string;
    success: boolean;
    usage?: {
      promptTokens: number;
      candidatesTokens: number;
      totalTokens: number;
    };
  };
  type: "general" | "detailed";
}

export default function SummaryResult({ result, type }: SummaryResultProps) {
  const handleCopy = () => {
    if (result.summary) {
      navigator.clipboard.writeText(result.summary);
      alert("요약 내용이 클립보드에 복사되었습니다.");
    }
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-header-icons font-bold">
          {result.success ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : (
            <AlertCircle size={18} className="text-red-500" />
          )}
          <h3>{result.videoId ? `Video: ${result.videoId}` : "Invalid Result"}</h3>
        </div>
        
        <div className="result-actions">
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-400 no-underline text-sm hover:text-white transition-colors"
          >
            원본 보기 <ExternalLink size={14} />
          </a>
          {result.success && (
            <button 
              onClick={handleCopy}
              className="option-btn !py-1 !px-2 rounded-md"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="summary-content">
        {result.success ? (
          <div>
            <div className="text-[0.7rem] uppercase font-bold text-indigo-400 mb-2 tracking-wider">
              {type === "detailed" ? "상세 요약 리포트" : "核心 요약 포인트"}
            </div>
            <p className="text-base text-gray-200 leading-relaxed">{result.summary}</p>
            
            {result.usage && (
              <div className="token-usage-footer">
                <span>사용한 토큰: <strong>{result.usage.totalTokens.toLocaleString()}</strong></span>
                <span>(질문: {result.usage.promptTokens.toLocaleString()} / 답변: {result.usage.candidatesTokens.toLocaleString()})</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">
            에러 발생: {result.error || "자막을 추출할 수 없거나 분석에 실패했습니다."}
          </p>
        )}
      </div>
    </div>
  );
}
