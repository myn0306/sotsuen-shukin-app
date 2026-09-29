import React from 'react';
import { Teacher, Participant } from '../types';
import { Plus, Trash2, Users, CheckSquare, Square, Sparkles, AlertCircle, Check, UserCheck } from 'lucide-react';
import { CuteStar } from './CloudDecorations';

// =========================================================================
// 今年度の保護者名簿 クイック選択リスト（20名）
// 表示ラベル（〇〇ママ）と、リストに登録される名前（苗字（子どもの名前））の対応
// ※来年以降にメンバーが変わった際は、ここの配列の中身を差し替えて更新できます
// =========================================================================
export interface RosterPreset {
  label: string; // チップに表示される名前（例: はるきママ）
  registeredName: string; // リストに登録される名前（例: 井出（はるき））
}

export const ROSTER_PRESETS: RosterPreset[] = [
  { label: 'はるきママ', registeredName: '井出（はるき）' },
  { label: 'ななせちゃんママ', registeredName: '阪本（ななせ）' },
  { label: 'いっちゃんママ', registeredName: '宍戸（いちか）' },
  { label: 'あおちゃんママ', registeredName: '芝野（あおと）' },
  { label: 'ゆいちゃんママ', registeredName: '竹辺（ゆい）' },
  { label: 'りぃちゃんママ', registeredName: '津田（りあな）' },
  { label: 'そうちゃんママ', registeredName: '中村（そうすけ）' },
  { label: 'なおちゃんママ', registeredName: '藤本（なお）' },
  { label: 'りっ君ママ', registeredName: '松村（りく）' },
  { label: 'りつき君ママ', registeredName: '丸橋（りつき）' },
  { label: 'あかりちゃんママ', registeredName: '南村（あかり）' },
  { label: 'きほちゃんママ', registeredName: '宮島（きほ）' },
  { label: 'いちや君ママ', registeredName: '森（いちや）' },
  { label: 'しょうへい君ママ', registeredName: '森田（しょうへい）' },
  { label: 'ゆいと君ママ', registeredName: '山尾（ゆいと）' },
  { label: 'かいせい君ママ', registeredName: '吉野（かいせい）' },
  { label: 'ひなちゃんママ', registeredName: '吉原（ひなと）' },
  { label: 'アイン君ママ', registeredName: 'アイン' },
  { label: 'サンモちゃんママ', registeredName: 'サンモ' },
  { label: 'ムハンマド君ママ', registeredName: 'ムハンマド' },
];

export const ROSTER_PRESET_NAMES = ROSTER_PRESETS.map((p) => p.registeredName);

interface Step2ParticipantsProps {
  teachers: Teacher[];
  participants: Participant[];
  onUpdateParticipants: (participants: Participant[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2Participants: React.FC<Step2ParticipantsProps> = ({
  teachers,
  participants,
  onUpdateParticipants,
  onNext,
  onPrev,
}) => {
  // クイック選択名簿からの追加 / 解除トグル
  const handleToggleRosterPreset = (preset: RosterPreset) => {
    const existing = participants.find((p) => p.name.trim() === preset.registeredName.trim());
    if (existing) {
      // すでにリストにある場合：削除
      // 「個別に先生のチェックなどを入れていた場合」の安全確認
      const allTeacherIds = teachers.map((t) => t.id);
      const isCustomized =
        existing.isPaid ||
        existing.teacherIds.length !== allTeacherIds.length ||
        !allTeacherIds.every((id) => existing.teacherIds.includes(id));

      if (isCustomized) {
        if (
          !window.confirm(
            `「${preset.label}（${existing.name}）」には個別の先生チェック設定や集金情報があります。参加者リストから削除してもよろしいですか？`
          )
        ) {
          return;
        }
      }
      onUpdateParticipants(participants.filter((p) => p.id !== existing.id));
    } else {
      // まだリストにない場合：追加（全員参加状態で追加、名前は registeredName で登録）
      const newP: Participant = {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: preset.registeredName.trim(),
        teacherIds: teachers.map((t) => t.id),
        isPaid: false,
      };
      onUpdateParticipants([...participants, newP]);
    }
  };

  // 名簿20名を全員一括追加
  const handleAddAllRosterPresets = () => {
    const existingNames = new Set(participants.map((p) => p.name.trim()));
    const missingNames = ROSTER_PRESET_NAMES.filter((name) => !existingNames.has(name));
    if (missingNames.length === 0) return;

    const newItems: Participant[] = missingNames.map((name, idx) => ({
      id: `p-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      teacherIds: teachers.map((t) => t.id),
      isPaid: false,
    }));

    onUpdateParticipants([...participants, ...newItems]);
  };

  // 名簿メンバーを一括解除
  const handleRemoveAllRosterPresets = () => {
    const rosterSet = new Set(ROSTER_PRESET_NAMES);
    const targetParticipants = participants.filter((p) => rosterSet.has(p.name.trim()));
    if (targetParticipants.length === 0) return;

    if (
      !window.confirm(
        `名簿から追加された保護者（${targetParticipants.length}名）をリストから解除しますか？`
      )
    ) {
      return;
    }
    onUpdateParticipants(participants.filter((p) => !rosterSet.has(p.name.trim())));
  };

  // 保護者を削除（確認ダイアログ付き）
  const handleDeleteParticipant = (id: string) => {
    const target = participants.find((p) => p.id === id);
    const targetName = target?.name ? `「${target.name}」` : 'この保護者';
    if (!window.confirm(`${targetName}を削除しますか？`)) {
      return;
    }
    onUpdateParticipants(participants.filter((p) => p.id !== id));
  };

  // 先生の参加トグル
  const handleToggleTeacher = (participantId: string, teacherId: string) => {
    onUpdateParticipants(
      participants.map((p) => {
        if (p.id !== participantId) return p;
        const exists = p.teacherIds.includes(teacherId);
        const newTeacherIds = exists
          ? p.teacherIds.filter((id) => id !== teacherId)
          : [...p.teacherIds, teacherId];
        return {
          ...p,
          teacherIds: newTeacherIds,
        };
      })
    );
  };

  // 全員を特定の先生に一括選択/解除
  const handleToggleAllForTeacher = (teacherId: string, selectAll: boolean) => {
    onUpdateParticipants(
      participants.map((p) => {
        const has = p.teacherIds.includes(teacherId);
        if (selectAll && !has) {
          return { ...p, teacherIds: [...p.teacherIds, teacherId] };
        } else if (!selectAll && has) {
          return { ...p, teacherIds: p.teacherIds.filter((id) => id !== teacherId) };
        }
        return p;
      })
    );
  };

  // 先生ごとの集計人数
  const getTeacherCount = (teacherId: string) => {
    return participants.filter((p) => p.teacherIds.includes(teacherId)).length;
  };

  // 参加人数0人の先生が存在するか
  const hasZeroParticipantTeacher =
    participants.length > 0 &&
    teachers.some((t) => getTeacherCount(t.id) === 0);

  // 名簿クイック選択から現在何人登録されているか
  const rosterSelectedCount = ROSTER_PRESET_NAMES.filter((name) =>
    participants.some((p) => p.name.trim() === name.trim())
  ).length;

  return (
    <section className="space-y-6">
      {/* 見出しバッジ（ピル型・空背景の上でもクッキリ見える高コントラスト太字） */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 bg-[#FFECCC] border-2 border-[#FFC766] px-4 py-2 rounded-full shadow-xs">
          <CuteStar className="w-5 h-5 text-[#D46B08]" />
          <span className="text-sm sm:text-base font-extrabold text-[#733B00] tracking-tight">
            ステップ 2：先生ごとの参加者（保護者）を登録
          </span>
        </div>
        <div className="text-sm font-bold text-[#59363E] bg-white/95 px-4 py-1.5 rounded-full border border-[#D9BAC2] shadow-2xs">
          登録保護者：<span className="font-black text-[#D96B76] text-base ml-1">{participants.length}名</span>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-xs rounded-3xl p-4 sm:p-6 border-2 border-[#FAD6DC] shadow-sm space-y-5">
        <p className="text-sm sm:text-base text-[#5B3E45] leading-relaxed">
          名簿リストから参加する保護者をタップして登録し、それぞれどの先生の贈り物に参加するかチェックを入れてください。
          先生ごとに参加人数が自動集計され、次のステップで一人当たり金額を割り勘します。
        </p>

        {/* 先生ごとの参加人数プレビューバッジ */}
        <div className="bg-[#FFF8EE] p-3.5 sm:p-4 rounded-2xl border border-[#F6DEBC] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-sm font-bold text-[#8C5E2D]">
              現在の先生ごとの参加人数（自動集計）：
            </span>
            {hasZeroParticipantTeacher && (
              <span className="text-xs font-bold text-[#D46B08] bg-[#FFF2E0] px-3 py-1 rounded-full border border-[#FFD591]">
                ⚠️ 参加0名の先生がいます
              </span>
            )}
          </div>

          {/* 参加人数0人がある場合の親切な案内カード */}
          {hasZeroParticipantTeacher && (
            <div className="bg-[#FFF9EE] border border-[#FFD08A] rounded-xl p-3 text-xs sm:text-sm text-[#8C521E] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#E67E22] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm">新しく追加された先生は、まだ参加者が0人です。</span>
                  <p className="text-xs text-[#A36D3B] mt-0.5 leading-relaxed">
                    クラス全員が参加する場合は、下のオレンジ枠の「全員ONにする」を押すと一括で登録できます。
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {teachers.map((teacher) => {
              const count = getTeacherCount(teacher.id);
              const isZero = count === 0 && participants.length > 0;

              return (
                <div
                  key={teacher.id}
                  className={`p-3 sm:p-3.5 rounded-xl transition-all ${
                    isZero
                      ? 'bg-[#FFF7E8] border-2 border-[#FFA940] shadow-xs ring-1 ring-[#FFD591]'
                      : 'bg-white border border-[#F2DEBF] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: teacher.color }}
                      />
                      <span className="text-sm sm:text-xs font-bold text-[#4B3138] truncate">
                        {teacher.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm sm:text-xs px-3 py-0.5 rounded-full font-black shrink-0 ${
                        isZero
                          ? 'bg-[#FF5722] text-white'
                          : 'bg-[#FFEAEF] text-[#D96B76]'
                      }`}
                    >
                      {count} 名
                    </span>
                  </div>

                  {/* 参加人数が0人の場合の警告メッセージと「全員ON」ボタンの強調 */}
                  {isZero ? (
                    <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#FCD29F] flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-[#C84E00]">
                        ※まだ誰もチェックされていません
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAllForTeacher(teacher.id, true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#FF8C00] hover:bg-[#E07B00] text-white px-3 py-1.5 min-h-[36px] rounded-full shadow-xs cursor-pointer transition-transform active:scale-95 shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        全員ONにする
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleToggleAllForTeacher(teacher.id, count < participants.length)}
                        className="text-xs text-[#A6754B] hover:text-[#D96B76] hover:underline cursor-pointer py-0.5"
                      >
                        {count === participants.length ? '全員チェック中' : '全員ONにする'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 今年度の保護者名簿 クイック選択セクション（20名） */}
        {/* ========================================================= */}
        <div className="bg-[#FFF8EE]/85 rounded-2xl p-4 sm:p-5 border-2 border-[#F7DFC1] shadow-2xs space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#F5D8B8] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FFE4C4] flex items-center justify-center text-[#8C4A00] shrink-0">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#703D0D]">
                    今年度の保護者名簿からクイック選択
                  </h3>
                  <span className="text-xs font-bold text-[#8C4A00] bg-[#FFECCC] border border-[#FFD382] px-2.5 py-0.5 rounded-full">
                    {ROSTER_PRESET_NAMES.length}名
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#8C5E2D] mt-0.5">
                  お名前をタップすると参加者リストに追加されます（※タップで「苗字（名前）」として登録／もう一度タップで解除）。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs sm:text-sm font-bold text-[#703D0D] bg-white/90 px-3 py-1.5 rounded-full border border-[#ECD1B0] shadow-2xs">
                登録中：
                <span className="text-[#D96B76] font-black text-sm sm:text-base ml-1">
                  {rosterSelectedCount}
                </span>
                <span className="text-[#8C5E2D] font-medium"> / {ROSTER_PRESETS.length}名</span>
              </div>
              {rosterSelectedCount < ROSTER_PRESETS.length ? (
                <button
                  type="button"
                  onClick={handleAddAllRosterPresets}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold bg-[#D96B76] hover:bg-[#C94F5C] text-white px-3.5 py-2 min-h-[38px] rounded-full shadow-xs cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  名簿全員を追加
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveAllRosterPresets}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#8C4656] hover:text-[#C93B4E] bg-white border border-[#F5CCD5] hover:bg-[#FFF2F4] px-3.5 py-2 min-h-[38px] rounded-full transition-colors cursor-pointer"
                >
                  名簿を一括解除
                </button>
              )}
            </div>
          </div>

          {/* チップ一覧（ピル型の丸いボタン） */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            {ROSTER_PRESETS.map((preset) => {
              const isAdded = participants.some(
                (p) => p.name.trim() === preset.registeredName.trim()
              );
              return (
                <button
                  key={preset.registeredName}
                  type="button"
                  onClick={() => handleToggleRosterPreset(preset)}
                  className={`inline-flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-2 min-h-[40px] rounded-full border transition-all cursor-pointer select-none active:scale-95 ${
                    isAdded
                      ? 'bg-[#D96B76] text-white font-bold border-[#BA4250] shadow-xs ring-2 ring-[#FFCCD5]'
                      : 'bg-[#FFF2F4] hover:bg-[#FFE0E6] text-[#8C4656] border-[#F8CCD5]'
                  }`}
                  title={
                    isAdded
                      ? `「${preset.label}（${preset.registeredName}）」をリストから解除`
                      : `「${preset.label}」を「${preset.registeredName}」として追加`
                  }
                >
                  {isAdded ? (
                    <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-[#C47585] shrink-0" />
                  )}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 保護者一覧テーブル / リスト（スマホ最適化） */}
        <div className="space-y-3">
          {participants.length === 0 ? (
            <div className="text-center py-8 px-4 bg-[#FFF8EE]/60 rounded-2xl border border-dashed border-[#FAD8A8]">
              <Users className="w-9 h-9 mx-auto text-[#D96B76] opacity-60 mb-2" />
              <p className="text-sm text-[#8C626C]">
                まだ保護者が登録されていません。上の名簿チップをタップして追加してください。
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F7E4E7] border border-[#F2D7DC] rounded-2xl overflow-hidden bg-white shadow-2xs">
              {/* テーブルヘッダー */}
              <div className="bg-[#FFF2F4] px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm font-bold text-[#8C4656]">
                <span className="w-36 sm:w-48 shrink-0">保護者・園児名</span>
                <span className="flex-1 text-center">参加する先生を選択</span>
                <span className="w-12 text-right">操作</span>
              </div>

              {/* 行リスト */}
              {participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="px-3.5 py-3 flex flex-wrap sm:flex-nowrap items-center gap-2.5 hover:bg-[#FFFDF9] transition-colors"
                >
                  {/* お名前表示（名簿の名称をそのまま使用するため編集不可・固定表示） */}
                  <div className="w-full sm:w-48 shrink-0 flex items-center gap-2">
                    <span className="text-xs font-mono text-[#B38590] w-5 font-bold">
                      {idx + 1}.
                    </span>
                    <span
                      className="w-full text-base sm:text-sm font-bold text-[#4B3138] px-1.5 py-1 min-h-[40px] flex items-center truncate select-none"
                      title={p.name}
                    >
                      {p.name}
                    </span>
                  </div>

                  {/* 先生ごとの選択チェックボックス（押しやすいピル型：高さ42px以上） */}
                  <div className="flex-1 flex flex-wrap items-center gap-2 py-1">
                    {teachers.map((t) => {
                      const isChecked = p.teacherIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleTeacher(p.id, t.id)}
                          className={`inline-flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-2 min-h-[42px] rounded-full border transition-all cursor-pointer select-none active:scale-95 ${
                            isChecked
                              ? 'bg-[#FFEBF0] text-[#A33045] font-bold border-[#F2AAB8] shadow-2xs'
                              : 'bg-[#FCFAF8] text-[#8C6D75] border-[#E8D4D8] opacity-80 hover:opacity-100 hover:bg-white'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#D96B76] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-[#B8989F] shrink-0" />
                          )}
                          <span className="truncate max-w-[120px]">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 削除ボタン（指で押しやすい44px四方） */}
                  <div className="w-full sm:w-12 flex justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteParticipant(p.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#C4929D] hover:text-[#C93B4E] hover:bg-[#FFE8ED] rounded-full transition-colors cursor-pointer"
                      title="この保護者を削除"
                      aria-label="この保護者を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 先生ごとの一括オン・オフ操作バー */}
        {participants.length > 0 && teachers.length > 0 && (
          <div className="bg-[#FFFDF8] p-3.5 sm:p-4 rounded-2xl border border-[#F5E5C9] flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm text-[#7A5A62]">
            <span className="font-bold text-[#8C5E2D] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D96B76]" />
              クイック一括設定:
            </span>
            <div className="flex flex-wrap gap-2">
              {teachers.map((t) => {
                const count = getTeacherCount(t.id);
                const isZero = count === 0;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                      isZero
                        ? 'bg-[#FFF4E6] border-[#FFA940] shadow-2xs ring-1 ring-[#FFD591]'
                        : 'bg-white border-[#F0DDC5]'
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm text-[#4B3138]">{t.name}:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllForTeacher(t.id, true)}
                      className={`text-xs font-bold cursor-pointer rounded-md px-2 py-1 min-h-[32px] flex items-center transition-colors ${
                        isZero
                          ? 'bg-[#FF8C00] text-white hover:bg-[#E07B00] shadow-2xs'
                          : 'text-[#D96B76] hover:underline'
                      }`}
                    >
                      {isZero ? '👉 全員ON' : '全員ON'}
                    </button>
                    <span className="text-[#DEB2BD]">/</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllForTeacher(t.id, false)}
                      className="text-xs text-[#8C6D75] hover:underline cursor-pointer min-h-[32px] flex items-center px-1"
                    >
                      全員OFF
                    </button>
                  </div>
                );
              })}
            </div>
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
          ← ステップ 1（備品代）に戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 font-bold text-base bg-[#D96B76] text-white hover:bg-[#C85461] hover:scale-102 px-7 py-3 min-h-[48px] rounded-full shadow-md transition-all cursor-pointer"
        >
          <span>ステップ 3：割勘結果を見る</span>
          <span>→</span>
        </button>
      </div>
    </section>
  );
};
