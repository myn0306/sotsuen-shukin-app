import React from 'react';
import { TeacherCalculation, OverallCalculation } from '../types';
import { formatYen } from '../utils/calculator';
import { Calculator, Sparkles, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { CuteCandy, CuteCloudBalloon } from './CloudDecorations';

interface Step3TeacherSummaryProps {
  calculation: OverallCalculation;
  onNext: () => void;
  onPrev: () => void;
  onGoToStep1?: () => void;
}

export const Step3TeacherSummary: React.FC<Step3TeacherSummaryProps> = ({
  calculation,
  onNext,
  onPrev,
  onGoToStep1,
}) => {
  const {
    teacherCalculations,
    totalExpenseAmount,
    totalCollectedExpected,
    totalReserveFund,
  } = calculation;

  // 先生が1人も登録されていない場合の案内画面
  if (teacherCalculations.length === 0) {
    return (
      <section className="space-y-6">
        {/* 見出しバッジ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 bg-[#FFECCC] border border-[#FFD382] px-4 py-1.5 rounded-full shadow-xs">
            <CuteCandy className="w-5 h-5" />
            <span className="text-sm font-bold text-[#8C4A00]">
              ステップ 3：先生ごとの一人当たり金額の算出
            </span>
          </div>
        </div>

        <div className="bg-white/85 backdrop-blur-xs rounded-3xl p-6 sm:p-10 border-2 border-[#FAD6DC] shadow-sm text-center">
          {/* やさしい雰囲気の案内カード（予備費ボックス踏襲） */}
          <div className="max-w-md mx-auto bg-gradient-to-r from-[#FFF4E6] to-[#FFEBEF] rounded-2xl p-6 border-2 border-[#FBD6A4] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFD88F] text-[#8A4612] flex items-center justify-center mx-auto shadow-2xs">
              <AlertCircle className="w-6 h-6 text-[#D96B76]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-[#5C2B36]">
                まだ先生が登録されていません
              </h3>
              <p className="text-sm text-[#704851] leading-relaxed">
                まだ先生が登録されていません。ステップ1に戻って登録してください。
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToStep1 || onPrev}
                className="inline-flex items-center gap-2 text-sm font-bold bg-[#D96B76] text-white hover:bg-[#C94F5C] hover:scale-102 px-6 py-3 min-h-[44px] rounded-full shadow-xs transition-all cursor-pointer"
              >
                <span>← ステップ 1（先生・備品登録）に戻る</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* 見出しバッジ（ピル型・空背景の上でもクッキリ見える高コントラスト太字） */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 bg-[#FFECCC] border-2 border-[#FFC766] px-4 py-2 rounded-full shadow-xs">
          <CuteCandy className="w-5 h-5 text-[#D46B08]" />
          <span className="text-sm sm:text-base font-extrabold text-[#733B00] tracking-tight">
            ステップ 3：先生ごとの一人当たり金額の算出
          </span>
        </div>
        <div className="text-sm font-bold text-[#59363E] bg-white/95 px-4 py-1.5 rounded-full border border-[#D9BAC2] shadow-2xs">
          切り上げ予備費 合計：
          <span className="font-black text-[#D96B76] text-base ml-1">
            +{formatYen(totalReserveFund)}
          </span>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-xs rounded-3xl p-4 sm:p-6 border-2 border-[#FAD6DC] shadow-sm space-y-6">
        {/* 説明吹き出し */}
        <CuteCloudBalloon className="border-[#FAD6DC] bg-[#FFFBFD]">
          <p className="text-sm sm:text-base text-[#5B3E45] leading-relaxed">
            🌸 <strong>計算ルール：</strong>
            「その先生の備品合計 ÷ 参加人数 ＝ 一人当たり金額」です。
            小銭の端数が出た場合は<strong>円単位で切り上げ</strong>ています。
          </p>
        </CuteCloudBalloon>

        {/* 予備費のご案内ボックス（目立つ親しみやすいカード） */}
        {totalReserveFund > 0 ? (
          <div className="bg-gradient-to-r from-[#FFF4E6] to-[#FFEBEF] rounded-2xl p-4 sm:p-5 border-2 border-[#FBD6A4] shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FFD88F] flex items-center justify-center text-[#7E4C06] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-sm sm:text-base">
              <div className="font-extrabold text-[#8A4612] text-base sm:text-lg flex items-center gap-1.5">
                <span>予備費として【 {formatYen(totalReserveFund)} 】多く集まります</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6D4222] leading-relaxed">
                円単位で切り上げて割り勘するため、実際の備品総額（{formatYen(totalExpenseAmount)}）に対し、集金総額は（{formatYen(totalCollectedExpected)}）となります。
                余剰金はリボン・メッセージカードの追加費や、次年度への繰り越し・役員雑費などの「予備費」として安全に充当できます。
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#EBF7EE] rounded-2xl p-4 border border-[#C5E8CE] flex items-center gap-3 text-sm sm:text-base text-[#246237]">
            <CheckCircle2 className="w-5 h-5 text-[#329A51] shrink-0" />
            <span>端数なくぴったり割り切れました！（予備費の発生はありません）</span>
          </div>
        )}

        {/* 先生ごとの割勘カード一覧 */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#4B3138] flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#D96B76]" />
            先生ごとの割り勘計算の内訳
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherCalculations.map((tc, idx) => {
              const {
                teacher,
                totalCost,
                participantCount,
                costPerPerson,
                totalCollected,
                reserveFund,
              } = tc;

              const exactCostPerPerson =
                participantCount > 0 ? totalCost / participantCount : 0;
              const hasCeil = costPerPerson > exactCostPerPerson;

              return (
                <div
                  key={teacher.id}
                  className="bg-[#FFFDF9] rounded-2xl border-2 border-[#F6DCE1] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[#E8B8C2] transition-all"
                >
                  <div>
                    {/* 先生タイトル */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F5E2E6]">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: teacher.color }}
                        />
                        <span className="font-bold text-[#4B3138] text-base sm:text-lg">
                          {teacher.name}
                        </span>
                      </div>
                      <span className="text-xs bg-[#FFF2F4] text-[#A63F53] font-bold px-2.5 py-1 rounded-full border border-[#FAD2DA]">
                        先生 {idx + 1}
                      </span>
                    </div>

                    {/* 計算式ボックス */}
                    <div className="mt-3.5 bg-white p-3.5 rounded-xl border border-[#F0D8DE] space-y-2.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B4B53]">
                        <span>備品代 合計：</span>
                        <span className="font-bold text-[#4B3138] text-sm sm:text-base">
                          {formatYen(totalCost)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B4B53]">
                        <span>参加する保護者：</span>
                        <span className="font-bold text-[#4B3138] text-sm sm:text-base">
                          {participantCount} 名
                        </span>
                      </div>

                      <div className="border-t border-dashed border-[#F0D8DE] pt-2.5 flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-[#8C4656] font-bold">
                          一人あたり金額：
                        </span>
                        <div className="text-right">
                          <span className="text-xl sm:text-2xl font-black text-[#D96B76]">
                            {formatYen(costPerPerson)}
                          </span>
                          {hasCeil && (
                            <span className="text-xs text-[#A8727E] block leading-tight mt-0.5">
                              （実計算: ¥{exactCostPerPerson.toFixed(2)} → 切り上げ）
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 備品内訳のミニプレビュー */}
                    <div className="mt-3.5 text-xs sm:text-sm text-[#7A5A62] bg-[#FFFBF7] p-3 rounded-xl border border-[#F6E5CF] space-y-1.5">
                      <span className="font-bold text-[#8C5E2D] block">
                        登録された備品（{teacher.items.length}品）:
                      </span>
                      <ul className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {teacher.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between text-[#5B3E45]"
                          >
                            <span className="truncate pr-2 flex items-center gap-1">
                              ・{item.name}
                              {item.isBulk && item.bulkTotalCount && item.bulkUsedCount ? (
                                <span className="text-[11px] bg-[#FFF0DB] text-[#8C521E] px-1.5 py-0.5 rounded-xs border border-[#FCD29F] shrink-0 font-medium">
                                  まとめ({item.bulkTotalCount}中{item.bulkUsedCount})
                                </span>
                              ) : null}
                            </span>
                            <span className="font-mono font-bold shrink-0">
                              {formatYen(item.cost)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 予備費のミニ注記 */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#F5E2E6] flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#8C626C]">集金予定総額: {formatYen(totalCollected)}</span>
                    {reserveFund > 0 ? (
                      <span className="font-bold text-[#A85816] bg-[#FFF4DC] px-2.5 py-1 rounded-md border border-[#FCE2B3]">
                        予備費: +{formatYen(reserveFund)}
                      </span>
                    ) : (
                      <span className="text-[#6D8A74]">端数なし</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 参加人数が0人の先生がいる場合の注意警告 */}
        {teacherCalculations.some((t) => t.participantCount === 0) && (
          <div className="bg-[#FFF0F2] border border-[#F7B8C2] p-3.5 rounded-2xl flex items-center gap-2 text-xs sm:text-sm text-[#A82B3E]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              参加者が0名の先生がいます。ステップ2に戻って対象の保護者にチェックをつけてください。
            </span>
          </div>
        )}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm font-bold text-[#7A4B56] hover:text-[#522D35] bg-white/90 hover:bg-white px-5 py-3 min-h-[48px] rounded-full border border-[#F2CAD2] transition-all cursor-pointer shadow-xs"
        >
          ← ステップ 2（参加者設定）に戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 font-bold text-base bg-[#D96B76] text-white hover:bg-[#C85461] hover:scale-102 px-7 py-3 min-h-[48px] rounded-full shadow-md transition-all cursor-pointer"
        >
          <span>ステップ 4：保護者ごとの請求額へ進む</span>
          <span>→</span>
        </button>
      </div>
    </section>
  );
};
