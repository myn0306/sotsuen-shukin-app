import React, { useState, useMemo } from 'react';
import { Teacher, Participant, StepId } from './types';
import { calculateOverall } from './utils/calculator';
import {
  BackgroundClouds,
  CuteStar,
  CuteFlower,
} from './components/CloudDecorations';
import { StepSugoroku } from './components/StepSugoroku';
import { Step1TeachersItems } from './components/Step1TeachersItems';
import { Step2Participants } from './components/Step2Participants';
import { Step3TeacherSummary } from './components/Step3TeacherSummary';
import { Step4ParentResults } from './components/Step4ParentResults';
import { PrintSheet } from './components/PrintSheet';
import { SyncStatusBadge } from './components/SyncStatusBadge';
import { useWarikanSync } from './hooks/useWarikanSync';
import { RotateCcw, Users2 } from 'lucide-react';

export default function App() {
  const {
    teachers,
    participants,
    updateTeachers,
    updateParticipants,
    syncStatus,
    errorMessage,
    resetToSample,
    clearAll,
    flushPendingSave,
  } = useWarikanSync();

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ステップ移動時に保留中の入力があれば即時保存
  const handleStepChange = (step: StepId) => {
    flushPendingSave();
    setCurrentStep(step);
  };

  // 全体計算のメモ化
  const overallCalculation = useMemo(() => {
    return calculateOverall(teachers, participants);
  }, [teachers, participants]);

  // 初期サンプルデータに戻す
  const handleResetToSample = async () => {
    await resetToSample();
    setCurrentStep(1);
    setShowResetConfirm(false);
  };

  // 全てクリアして新規作成
  const handleClearAll = async () => {
    await clearAll();
    setCurrentStep(1);
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E3F5] via-[#E6F4FB] to-[#FFF8EE] text-[#4B3138] relative overflow-x-hidden selection:bg-[#FAD6DC] selection:text-[#7A2838]">
      {/* 画面右上の固定ステータス表示（スクロールしても常に見える安心設計） */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 no-print flex items-center gap-2">
        <SyncStatusBadge status={syncStatus} errorMessage={errorMessage} className="shadow-md" />
      </div>

      {/* 背景に浮かぶもこもこ雲たち */}
      <BackgroundClouds />

      {/* 画面コンテンツコンテナ（スマホ幅380px最優先、PCではmax-w-3xlで綺麗に収まる） */}
      <main className="relative z-10 max-w-3xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
        {/* ヘッダーエリア */}
        <header className="text-center mb-6 no-print space-y-3.5">
          {/* 上部ピルバッジ */}
          <div className="inline-flex items-center gap-1.5 bg-[#FFF2CC] border border-[#F5DC8C] text-[#7A4E00] text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full shadow-xs">
            <CuteStar className="w-4 h-4 text-[#D48806]" />
            <span>保育園の卒園記念イベント・保護者係用</span>
            <CuteStar className="w-4 h-4 text-[#D48806]" />
          </div>

          {/* メインタイトル（常に2行で固定表示） */}
          <h1 className="font-black text-[#381E25] tracking-tight leading-tight flex flex-col items-center justify-center gap-1 drop-shadow-2xs">
            <span className="text-xl sm:text-2xl md:text-3xl whitespace-nowrap flex items-center gap-1.5">
              <span className="text-[#D96B76] shrink-0 text-lg sm:text-2xl">🌸</span>
              <span>先生への贈り物</span>
              <span className="text-[#D96B76] shrink-0 text-lg sm:text-2xl">🌸</span>
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl text-[#D96B76] whitespace-nowrap">
              集金計算アプリ
            </span>
          </h1>

          {/* 説明文（画面幅に関わらず指定の3行で固定表示） */}
          <div className="font-bold text-[#4F2D36] mx-auto leading-relaxed drop-shadow-2xs flex flex-col items-center justify-center text-[12px] sm:text-sm md:text-base space-y-0.5">
            <span className="whitespace-nowrap">
              色紙・お花・プレゼントにかかった費用を、
            </span>
            <span className="whitespace-nowrap">
              参加する保護者で正しく割り勘計算。役員同士でURLを開くだけで、
            </span>
            <span className="whitespace-nowrap">
              リアルタイムにデータが共有・同期されます。
            </span>
          </div>

          {/* クラウドリアルタイム同期ステータス & リセットボタン */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs sm:text-sm">
            {/* リアルタイム同期バッジ */}
            <SyncStatusBadge status={syncStatus} errorMessage={errorMessage} />

            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#57353E] bg-white/80 px-3 py-1.5 rounded-full border border-[#D9BAC2] shadow-2xs">
              <Users2 className="w-3.5 h-3.5 text-[#D96B76]" />
              <span>URL共有で複数人編集可能</span>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#633943] hover:text-[#3B1A22] bg-white/90 hover:bg-white px-3.5 py-1.5 min-h-[36px] rounded-full border border-[#DCBEC5] transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>データのリセット</span>
            </button>
          </div>
        </header>

        {/* リセット確認モーダル */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 no-print">
            <div className="bg-[#FFFDFB] w-full max-w-sm rounded-3xl p-5 border-2 border-[#F6D2D8] shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FFE8ED] text-[#D96B76] flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#4B3138]">
                データをリセットしますか？
              </h3>
              <p className="text-sm text-[#7A5A62] leading-relaxed">
                共有中のクラウドデータをリセットします。他の役員画面にも反映されます。サンプルの内容に戻すか、空の新規作成にするかをお選びいただけます。
              </p>
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleResetToSample}
                  className="w-full text-sm font-bold bg-[#D96B76] text-white hover:bg-[#C94F5C] py-3 min-h-[44px] rounded-full shadow-xs cursor-pointer"
                >
                  分かりやすいサンプルデータに戻す
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full text-sm font-bold bg-[#FFF2F4] text-[#8C3C4E] hover:bg-[#FFE2E7] py-2.5 min-h-[44px] rounded-full border border-[#F4BAC5] cursor-pointer"
                >
                  すべて空にして新しく入力する
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-800 py-2 min-h-[40px] cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 双六（すごろく）風ステップナビゲーション */}
        <div className="mb-6">
          <StepSugoroku
            currentStep={currentStep}
            onSelectStep={(s) => handleStepChange(s)}
          />
        </div>

        {/* 各ステップのコンテンツ */}
        <div className="no-print">
          {currentStep === 1 && (
            <Step1TeachersItems
              teachers={teachers}
              onUpdateTeachers={updateTeachers}
              onNext={() => handleStepChange(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2Participants
              teachers={teachers}
              participants={participants}
              onUpdateParticipants={updateParticipants}
              onNext={() => handleStepChange(3)}
              onPrev={() => handleStepChange(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3TeacherSummary
              calculation={overallCalculation}
              onNext={() => handleStepChange(4)}
              onPrev={() => handleStepChange(2)}
              onGoToStep1={() => handleStepChange(1)}
            />
          )}

          {currentStep === 4 && (
            <Step4ParentResults
              calculation={overallCalculation}
              participants={participants}
              onUpdateParticipants={updateParticipants}
              onPrev={() => handleStepChange(3)}
              onGoToStep2={() => handleStepChange(2)}
            />
          )}
        </div>

        {/* フッター */}
        <footer className="text-center mt-12 pt-6 border-t-2 border-[#E5BFC6] text-xs sm:text-sm font-bold text-[#6D424C] no-print space-y-2">
          <div className="flex items-center justify-center gap-2">
            <CuteFlower className="w-4 h-4 text-[#D96B76]" />
            <span className="font-extrabold text-[#522933]">ご卒園おめでとうございます！ 素敵な記念イベントになりますように。</span>
            <CuteFlower className="w-4 h-4 text-[#D96B76]" />
          </div>
          <p className="text-xs text-[#7A505A] font-semibold">
            保育園 卒園記念品 集金計算アプリ（リアルタイム共同編集・端数切り上げ・予備費自動算出・A4印刷対応）
          </p>
        </footer>
      </main>

      {/* 印刷・PDF保存専用ビュー（印刷時のみ表示） */}
      <PrintSheet calculation={overallCalculation} />
    </div>
  );
}

