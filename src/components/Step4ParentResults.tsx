import React, { useState } from 'react';
import { OverallCalculation, Participant } from '../types';
import { formatYen } from '../utils/calculator';
import {
  Printer,
  FileText,
  Copy,
  Check,
  CheckCircle,
  Circle,
  Search,
  Sparkles,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { CuteStar, CuteFlower, CuteCloudBalloon } from './CloudDecorations';

// 登録名（例:「井出（はるき）」）からカッコと子どもの名前を省いて苗字のみを抽出するヘルパー関数
// カッコ書きがない名前（例:「アイン」「サンモ」「ムハンマド」）はそのままの名前を使用
export const getNoticeSurname = (registeredName: string): string => {
  const trimmed = registeredName.trim();
  // 全角カッコ（...）または半角カッコ(...)で囲まれた部分を除去
  const surname = trimmed.replace(/[（(].*?[）)]/g, '').trim();
  return surname || trimmed;
};

interface Step4ParentResultsProps {
  calculation: OverallCalculation;
  participants: Participant[];
  onUpdateParticipants: (participants: Participant[], immediate?: boolean) => void;
  onPrev: () => void;
  onGoToStep2?: () => void;
}

export const Step4ParentResults: React.FC<Step4ParentResultsProps> = ({
  calculation,
  participants,
  onUpdateParticipants,
  onPrev,
  onGoToStep2,
}) => {
  const {
    participantCalculations,
    totalExpenseAmount,
    totalCollectedExpected,
    totalReserveFund,
    totalParticipantsCount,
    paidParticipantsCount,
    totalCollectedActual,
  } = calculation;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaid, setFilterPaid] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // 保護者が1人も登録されていない場合の案内画面
  if (participants.length === 0) {
    return (
      <section className="space-y-6">
        {/* 見出しバッジ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 bg-[#FFECCC] border border-[#FFD382] px-4 py-1.5 rounded-full shadow-xs">
            <CuteFlower className="w-5 h-5 text-[#E67E22]" />
            <span className="text-sm font-bold text-[#8C4A00]">
              ステップ 4：保護者ごとの集金請求額＆集金管理
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
                まだ保護者が登録されていません
              </h3>
              <p className="text-sm text-[#704851] leading-relaxed">
                まだ保護者が登録されていません。ステップ2に戻って登録してください。
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToStep2 || onPrev}
                className="inline-flex items-center gap-2 text-sm font-bold bg-[#D96B76] text-white hover:bg-[#C94F5C] hover:scale-102 px-6 py-3 min-h-[44px] rounded-full shadow-xs transition-all cursor-pointer"
              >
                <span>← ステップ 2（保護者登録）に戻る</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 印刷・PDF保存を実行
  const handlePrint = () => {
    window.print();
  };

  // 集金ステータストグル（ワンタップチェック：即時反映・保存）
  const handleTogglePaid = (participantId: string) => {
    onUpdateParticipants(
      participants.map((p) =>
        p.id === participantId ? { ...p, isPaid: !p.isPaid } : p
      ),
      true
    );
  };

  // 個別の保護者への案内文をコピー
  const handleCopyNotice = (
    name: string,
    total: number,
    breakdown: { teacherName: string; amount: number }[]
  ) => {
    const breakdownText = breakdown
      .map((b) => `・${b.teacherName}: ${formatYen(b.amount)}`)
      .join('\n');

    // 連絡文内のお名前をカッコ抜きの「苗字」に変換（例: 井出（はるき）→ 井出さん、アイン → アインさん）
    const surname = getNoticeSurname(name);

    const text = `【卒園記念品代 集金のお願い】
${surname}さん

日頃より保育園の活動にご協力いただきありがとうございます。
先生方への卒園記念品（花束・色紙等）の集金代金についてご案内いたします。

■ ご請求金額：${formatYen(total)}
■ 内訳：
${breakdownText}

※端数は円単位で切り上げており、余剰金はリボン等の追加資材や予備費に充当いたします。
集金袋にお釣りのないようご用意いただけますと幸いです。よろしくお願いいたします。`;

    navigator.clipboard.writeText(text);
    setCopiedId(name);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 全体まとめ文面（役員連絡網用）をコピー
  const handleCopyAllSummary = () => {
    const summaryLines = participantCalculations
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.participant.name} 様: ${formatYen(p.totalAmount)} (${p.breakdown
            .map((b) => `${b.teacherName} ${formatYen(b.amount)}`)
            .join(' + ')})`
      )
      .join('\n');

    const text = `【卒園記念品 集金内訳一覧】
・備品代合計（実費）: ${formatYen(totalExpenseAmount)}
・集金予定総額: ${formatYen(totalCollectedExpected)}
・予備費: ${formatYen(totalReserveFund)}
・参加保護者数: ${totalParticipantsCount}名

■ 各家庭の集金金額と内訳：
${summaryLines}`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // フィルタリング
  const filteredCalculations = participantCalculations.filter((p) => {
    const matchesSearch =
      p.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.participant.childName &&
        p.participant.childName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterPaid === 'paid') return p.participant.isPaid;
    if (filterPaid === 'unpaid') return !p.participant.isPaid;
    return true;
  });

  return (
    <section className="space-y-6">
      {/* 見出しバッジ（ピル型・空背景の上でもクッキリ見える高コントラスト太字） */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="inline-flex items-center gap-2 bg-[#FFECCC] border-2 border-[#FFC766] px-4 py-2 rounded-full shadow-xs">
          <CuteStar className="w-5 h-5 text-[#D46B08]" />
          <span className="text-sm sm:text-base font-extrabold text-[#733B00] tracking-tight">
            ステップ 4：保護者ごとの請求額・集金一覧
          </span>
        </div>

        {/* 印刷/PDF保存ボタン（目立つカプセルボタン：押しやすい44px以上） */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-sm font-bold bg-[#D96B76] text-white hover:bg-[#C85461] px-5 py-2.5 min-h-[44px] rounded-full shadow-md transition-all cursor-pointer hover:scale-102 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            印刷 / PDF保存
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="bg-white/85 backdrop-blur-xs rounded-3xl p-4 sm:p-6 border-2 border-[#FAD6DC] shadow-sm space-y-6">
        {/* 全体集計ダッシュボード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FFF8EE] p-3.5 rounded-2xl border border-[#F6E5CF]">
            <span className="text-xs text-[#8C5E2D] block mb-1 font-bold">
              備品代 合計（実費）
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-[#4B3138]">
              {formatYen(totalExpenseAmount)}
            </span>
          </div>

          <div className="bg-[#FFF2F4] p-3.5 rounded-2xl border border-[#F8CCD5]">
            <span className="text-xs text-[#8C4656] block mb-1 font-bold">
              集金予定 総額
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-[#D96B76]">
              {formatYen(totalCollectedExpected)}
            </span>
          </div>

          <div className="bg-[#FFFDE8] p-3.5 rounded-2xl border border-[#F7ECC0]">
            <span className="text-xs text-[#82690E] block mb-1 font-bold">
              予備費（余剰金）
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-[#996D09]">
              +{formatYen(totalReserveFund)}
            </span>
          </div>

          <div className="bg-[#EBF7EE] p-3.5 rounded-2xl border border-[#CBE5D2]">
            <span className="text-xs text-[#29683B] block mb-1 font-bold">
              集金進捗
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-[#1B612F]">
                {paidParticipantsCount}
              </span>
              <span className="text-xs text-[#427C52] font-bold">/ {totalParticipantsCount}名</span>
            </div>
            <div className="text-xs text-[#427C52] font-mono mt-0.5">
              済: {formatYen(totalCollectedActual)}
            </div>
          </div>
        </div>

        {/* 予備費の案内 */}
        {totalReserveFund > 0 && (
          <CuteCloudBalloon className="bg-[#FFF9F3] border-[#FCE2B3]">
            <p className="text-sm sm:text-base text-[#704B14] leading-relaxed">
              💡 <strong>お知らせ：</strong>各先生の割り勘端数を円単位で切り上げているため、
              <strong>予備費として【 {formatYen(totalReserveFund)} 】多く集まります。</strong>
              集金袋やメッセージカードの購入、予期せぬ備品代、卒園式当日の予備費にご活用いただけます。
            </p>
          </CuteCloudBalloon>
        )}

        {/* 絞り込み ＆ 検索バー ＆ 全体コピー */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F5DFE3] no-print">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-[#A87985] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="保護者名で検索..."
                className="w-full pl-10 pr-4 py-2.5 text-base sm:text-sm min-h-[44px] bg-white border border-[#EAC28E] rounded-full text-[#4B3138] focus:border-[#D96B76] outline-hidden shadow-2xs"
              />
            </div>

            {/* 状態フィルター */}
            <div className="flex bg-[#FFF5F6] p-1 rounded-full border border-[#F5D2D8] text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setFilterPaid('all')}
                className={`px-3.5 py-1.5 min-h-[36px] rounded-full cursor-pointer transition-colors ${
                  filterPaid === 'all'
                    ? 'bg-[#D96B76] text-white font-bold shadow-2xs'
                    : 'text-[#7A5A62] hover:text-black'
                }`}
              >
                全員
              </button>
              <button
                type="button"
                onClick={() => setFilterPaid('unpaid')}
                className={`px-3.5 py-1.5 min-h-[36px] rounded-full cursor-pointer transition-colors ${
                  filterPaid === 'unpaid'
                    ? 'bg-[#D96B76] text-white font-bold shadow-2xs'
                    : 'text-[#7A5A62] hover:text-black'
                }`}
              >
                未集金
              </button>
              <button
                type="button"
                onClick={() => setFilterPaid('paid')}
                className={`px-3.5 py-1.5 min-h-[36px] rounded-full cursor-pointer transition-colors ${
                  filterPaid === 'paid'
                    ? 'bg-[#D96B76] text-white font-bold shadow-2xs'
                    : 'text-[#7A5A62] hover:text-black'
                }`}
              >
                集金済
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyAllSummary}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#7A4B56] hover:text-[#522D35] bg-[#FFF2F4] hover:bg-[#FFE5EA] border border-[#F4BAC5] px-4 py-2.5 min-h-[44px] rounded-full transition-colors cursor-pointer active:scale-95"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-[#329A51]" />
                <span className="text-[#329A51] font-bold">一覧文面をコピー済</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#D96B76]" />
                <span>一覧まとめ文面をコピー</span>
              </>
            )}
          </button>
        </div>

        {/* 保護者ごとの請求額一覧（カード形式でスマホで見やすい） */}
        <div className="space-y-3">
          {filteredCalculations.length === 0 ? (
            <p className="text-sm text-center py-8 text-[#9E737D] bg-[#FFF7F8] rounded-2xl border border-dashed border-[#FAD6DC]">
              該当する保護者が見つかりませんでした。
            </p>
          ) : (
            filteredCalculations.map((pCalc, idx) => {
              const { participant, breakdown, totalAmount } = pCalc;
              const isCopied = copiedId === participant.name;

              return (
                <div
                  key={participant.id}
                  className={`rounded-2xl border-2 p-4 sm:p-4.5 transition-all ${
                    participant.isPaid
                      ? 'bg-[#FAFCFA] border-[#D6EBDC]'
                      : 'bg-[#FFFDF9] border-[#F6DCE1] hover:border-[#E8B8C2]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* 左：集金チェック ＆ お名前 */}
                    <div className="flex items-center gap-2.5">
                      {/* 集金完了トグルボタン（押しやすい44px四方） */}
                      <button
                        type="button"
                        onClick={() => handleTogglePaid(participant.id)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer rounded-full hover:bg-black/5 transition-colors shrink-0 active:scale-95"
                        title={
                          participant.isPaid
                            ? '集金済（クリックで未集金に戻す）'
                            : '未集金（クリックで集金済にする）'
                        }
                        aria-label={participant.isPaid ? '集金済' : '未集金'}
                      >
                        {participant.isPaid ? (
                          <CheckCircle className="w-7 h-7 text-[#329A51] fill-[#E5F7EB]" />
                        ) : (
                          <Circle className="w-7 h-7 text-[#C9A0A8] hover:text-[#D96B76]" />
                        )}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs sm:text-sm text-[#A87A84] font-mono font-bold">
                            {idx + 1}.
                          </span>
                          <span className="font-bold text-base sm:text-lg text-[#4B3138]">
                            {participant.name}
                          </span>
                          {participant.isPaid && (
                            <span className="text-xs bg-[#E1F5E6] text-[#1E6B34] font-bold px-2.5 py-0.5 rounded-full border border-[#BDE7C6]">
                              集金完了
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 右：請求額 ＆ コピーボタン */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-[#8C5E2D] block leading-none font-bold">
                          ご請求額
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-[#D96B76]">
                          {formatYen(totalAmount)}
                        </span>
                      </div>

                      {/* LINE/連絡網用個別コピーボタン（押しやすい44px以上） */}
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyNotice(
                            participant.name,
                            totalAmount,
                            breakdown
                          )
                        }
                        className={`text-xs sm:text-sm px-3.5 py-2.5 min-h-[44px] rounded-full border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isCopied
                            ? 'bg-[#E5F7EB] text-[#1E6B34] border-[#BDE7C6] font-bold'
                            : 'bg-white hover:bg-[#FFF2F4] text-[#8C4656] border-[#F5CCD5]'
                        }`}
                        title="この保護者宛の集金お願いメッセージをコピー"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-[#329A51]" />
                            <span>コピー済</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>連絡文コピー</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 先生ごとの内訳（例：たなか先生 ¥375 ＋ さとう先生 ¥400） */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-[#F3DFE3] flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <span className="text-[#8C626C] font-bold">
                      内訳：
                    </span>
                    {breakdown.length === 0 ? (
                      <span className="text-[#9E737D] italic">
                        参加する先生が選択されていません
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {breakdown.map((item, bIdx) => (
                          <React.Fragment key={item.teacherId}>
                            {bIdx > 0 && <span className="text-[#DEB0BA] font-bold">＋</span>}
                            <span className="inline-flex items-center bg-[#FFF5F6] px-3 py-1 rounded-xl border border-[#F7D2DA] text-[#59303A]">
                              <span className="font-medium mr-1.5">
                                {item.teacherName}
                              </span>
                              <strong className="text-[#D96B76] font-bold font-mono">
                                {formatYen(item.amount)}
                              </strong>
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 印刷用プレビュー案内 */}
      <div className="bg-[#FFFDF8] rounded-2xl p-4 sm:p-5 border border-[#F5E5C9] flex flex-wrap items-center justify-between gap-3 text-sm text-[#7A5A62] no-print">
        <div className="flex items-center gap-3">
          <Printer className="w-5 h-5 text-[#D96B76] shrink-0" />
          <span className="leading-relaxed">
            <strong>印刷機能：</strong>
            「印刷 / PDF保存」を押すと、入力欄を非表示にし、集金内訳一覧表と保護者への配布用スリップがA4で出力されます。
          </span>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="text-sm font-bold text-[#8C3C4E] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
        >
          今すぐ印刷プレビューを開く →
        </button>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm font-bold text-[#7A4B56] hover:text-[#522D35] bg-white/90 hover:bg-white px-5 py-3 min-h-[48px] rounded-full border border-[#F2CAD2] transition-all cursor-pointer shadow-xs"
        >
          ← ステップ 3（割勘一覧）に戻る
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 font-bold text-base bg-[#D96B76] text-white hover:bg-[#C85461] hover:scale-102 px-7 py-3 min-h-[48px] rounded-full shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>集金表を印刷 / PDF保存</span>
        </button>
      </div>
    </section>
  );
};
