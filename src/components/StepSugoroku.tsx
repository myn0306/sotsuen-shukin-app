import React from 'react';
import { StepId } from '../types';
import { CuteStar } from './CloudDecorations';

interface StepSugorokuProps {
  currentStep: StepId;
  onSelectStep: (step: StepId) => void;
  summaryData?: {
    teacherCount: number;
    participantCount: number;
    totalExpense: number;
  };
}

const STEPS: { id: StepId; title: string; subtitle: string; iconLabel: string }[] = [
  { id: 1, title: '備品代の登録', subtitle: '品名と金額を何個でも', iconLabel: 'お花・色紙' },
  { id: 2, title: '参加者を登録', subtitle: '先生ごとの対象者チェック', iconLabel: '保護者わりあて' },
  { id: 3, title: '先生ごとの割勘', subtitle: '1人あたり金額と予備費', iconLabel: '切り上げ計算' },
  { id: 4, title: '集金まとめ・印刷', subtitle: '保護者別請求額＆印刷', iconLabel: 'お便り・控え' },
];

export const StepSugoroku: React.FC<StepSugorokuProps> = ({
  currentStep,
  onSelectStep,
}) => {
  return (
    <nav aria-label="計算ステップ" className="w-full no-print select-none">
      {/* 双六の雲の道（横スクロール可能 / デスクトップではゆったり均等） */}
      <div className="relative py-2 px-1">
        {/* つなぐ点線（すごろくの道） */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 border-t-2 border-dashed border-[#F4BAC5] -z-0 hidden sm:block" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 relative z-10">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelectStep(step.id)}
                className={`group relative text-left p-3.5 sm:p-3 min-h-[64px] sm:min-h-[56px] rounded-2xl transition-all duration-200 border-2 cursor-pointer ${
                  isActive
                    ? 'bg-white shadow-md border-[#D96B76] scale-[1.02] ring-2 ring-[#FFD6DC]'
                    : isCompleted
                    ? 'bg-[#FFF8EE]/90 border-[#FAD2CF] hover:bg-white'
                    : 'bg-white/70 border-white/80 hover:bg-white/90 opacity-85'
                }`}
              >
                {/* 雲のもこもこ感の演出バッジ */}
                <div className="flex items-center gap-2 mb-1">
                  {/* 星型丸バッジ */}
                  <div
                    className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-sm sm:text-xs shadow-xs shrink-0 transition-transform ${
                      isActive
                        ? 'bg-[#D96B76] text-white scale-105 ring-2 ring-[#FFE8EC]'
                        : isCompleted
                        ? 'bg-[#FFD56B] text-[#784D12]'
                        : 'bg-[#F2E3E6] text-[#8C626C]'
                    }`}
                  >
                    <span className="flex items-center">
                      <CuteStar className="w-3.5 h-3.5 mr-0.5 inline-block" fill={isActive ? '#FFE17D' : '#FFF9D2'} />
                      {step.id}
                    </span>
                  </div>

                  <span
                    className={`text-sm sm:text-xs font-bold truncate leading-tight ${
                      isActive ? 'text-[#D96B76]' : 'text-[#4B3138]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                <p className="text-xs text-[#7A5A62] pl-1 sm:pl-8 leading-snug line-clamp-1">
                  {step.subtitle}
                </p>

                {/* アクティブ時の下部ちいさな三角ポインタ */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#D96B76]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
