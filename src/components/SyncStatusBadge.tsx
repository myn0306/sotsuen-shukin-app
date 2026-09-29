import React from 'react';
import { SyncStatus } from '../hooks/useWarikanSync';
import { Cloud, Check, Loader2, WifiOff, AlertTriangle } from 'lucide-react';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  errorMessage?: string | null;
  className?: string;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ status, errorMessage, className = '' }) => {
  if (status === 'loading') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-[#FFF9E6]/95 border border-[#FFE199] text-[#946800] text-xs font-bold px-3 py-1 rounded-full shadow-2xs backdrop-blur-2xs transition-all ${className}`}
        title="Firestoreに接続しています..."
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D99B00]" />
        <span>接続中...</span>
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-[#EBF7FF]/95 border border-[#BDE0FE] text-[#1D6FA5] text-xs font-bold px-3 py-1 rounded-full shadow-2xs backdrop-blur-2xs transition-all ${className}`}
        title="リアルタイム同期中..."
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2B8CC4]" />
        <span>同期中</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-[#FFF0E6]/95 border border-[#FFCCB0] text-[#B84E1A] text-xs font-bold px-3 py-1 rounded-full shadow-2xs backdrop-blur-2xs transition-all ${className}`}
        title="オフライン状態です。通信が回復すると自動で同期されます。"
      >
        <WifiOff className="w-3.5 h-3.5 text-[#D9531E]" />
        <span>オフラインです</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-[#FFEBEF]/95 border border-[#FFB8C6] text-[#C42B47] text-xs font-bold px-3 py-1 rounded-full shadow-2xs backdrop-blur-2xs transition-all ${className}`}
        title={errorMessage || '同期エラーが発生しました'}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-[#D93856]" />
        <span>同期エラー</span>
      </div>
    );
  }

  // saved
  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-white/95 border border-[#CDEED5] text-[#337A47] text-xs font-bold px-3 py-1 rounded-full shadow-2xs backdrop-blur-2xs transition-all ${className}`}
      title="クラウドにリアルタイム保存されています。他の役員と共有中です。"
    >
      <Cloud className="w-3.5 h-3.5 text-[#48BB78]" />
      <span className="flex items-center gap-1">
        <Check className="w-3 h-3 text-[#38A169] stroke-[3]" />
        保存しました
      </span>
    </div>
  );
};
