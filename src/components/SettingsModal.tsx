"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Save, AlertCircle } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("user-gemini-api-key");
    if (storedKey) setApiKey(storedKey);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("user-gemini-api-key", apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    localStorage.removeItem("user-gemini-api-key");
    setApiKey("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md overflow-hidden bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Key className="text-indigo-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">개인 API 설정</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                    * 입력하신 키는 브라우저의 로컬 저장소에만 보관되며 서버에는 저장되지 않습니다.<br/>
                    * 본인의 키를 입력하면 서비스 공용 할당량에 제한 없이 사용 가능합니다.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all ${
                      saved ? "bg-green-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    {saved ? <Save size={18} /> : null}
                    {saved ? "저장 완료!" : "설정 저장하기"}
                  </button>
                  {apiKey && (
                    <button
                      onClick={handleClear}
                      className="text-sm text-gray-400 hover:text-red-400 transition-colors py-2"
                    >
                      기존 키 삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-500/10 p-4 border-t border-indigo-500/20 flex gap-3">
              <AlertCircle className="text-indigo-400 shrink-0" size={18} />
              <p className="text-xs text-indigo-200/70">
                구글 로그인 후 자신의 키를 등록하면, 요약 결과가 본인의 구글 계정 사용량으로 집계됩니다.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
