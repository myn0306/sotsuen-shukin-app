import React, { useState } from 'react';
import { Teacher, ExpenseItem } from '../types';
import { formatYen } from '../utils/calculator';
import { Plus, Trash2, Tag, Gift, Flower, FileText, Sparkles, UserPlus, Package, Calculator, ArrowRightLeft } from 'lucide-react';
import { CuteFlower } from './CloudDecorations';

interface Step1TeachersItemsProps {
  teachers: Teacher[];
  onUpdateTeachers: (teachers: Teacher[]) => void;
  onNext: () => void;
}

const PRESET_ITEMS = [
  { name: 'お花束（生花）', defaultCost: 3000, icon: Flower },
  { name: '色紙・アルバム', defaultCost: 1000, icon: FileText },
  { name: '記念プレゼント', defaultCost: 3000, icon: Gift },
  { name: 'ラッピング・手紙', defaultCost: 500, icon: Sparkles },
];

const PASTEL_COLORS = [
  '#FFDFE7', // さくらピンク
  '#E3F2FD', // そらブルー
  '#FFF2CC', // たまごイエロー
  '#E8F5E9', // わかばグリーン
  '#F3E5F5', // ラベンダー
];

export const Step1TeachersItems: React.FC<Step1TeachersItemsProps> = ({
  teachers,
  onUpdateTeachers,
  onNext,
}) => {
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherRole, setNewTeacherRole] = useState('先生');

  // 先生を追加
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;

    const newTeacher: Teacher = {
      id: `t-${Date.now()}`,
      name: newTeacherName.trim(),
      role: newTeacherRole.trim() || '先生',
      color: PASTEL_COLORS[teachers.length % PASTEL_COLORS.length],
      items: [], // 先生追加直後は備品0件
    };

    onUpdateTeachers([...teachers, newTeacher]);
    setNewTeacherName('');
  };

  // 先生を削除
  const handleDeleteTeacher = (teacherId: string) => {
    if (teachers.length <= 1) {
      alert('先生は最低1人必要です。');
      return;
    }
    const target = teachers.find((t) => t.id === teacherId);
    if (
      window.confirm(
        `「${target?.name || 'この先生'}」と登録された備品を削除しますか？`
      )
    ) {
      onUpdateTeachers(teachers.filter((t) => t.id !== teacherId));
    }
  };

  // 先生名を更新
  const handleUpdateTeacherName = (
    teacherId: string,
    name: string,
    role?: string
  ) => {
    onUpdateTeachers(
      teachers.map((t) =>
        t.id === teacherId ? { ...t, name, role: role ?? t.role } : t
      )
    );
  };

  // 備品を追加
  const handleAddItem = (
    teacherId: string,
    name: string = '新しい品目',
    cost: number = 1000
  ) => {
    const newItem: ExpenseItem = {
      id: `i-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      cost,
    };

    onUpdateTeachers(
      teachers.map((t) =>
        t.id === teacherId ? { ...t, items: [...t.items, newItem] } : t
      )
    );
  };

  // 備品を削除（確認ダイアログ付き）
  const handleDeleteItem = (teacherId: string, itemId: string) => {
    const targetTeacher = teachers.find((t) => t.id === teacherId);
    const targetItem = targetTeacher?.items.find((item) => item.id === itemId);
    const itemName = targetItem?.name ? `「${targetItem.name}」` : 'この備品';
    if (!window.confirm(`${itemName}を削除しますか？`)) {
      return;
    }

    onUpdateTeachers(
      teachers.map((t) => {
        if (t.id !== teacherId) return t;
        return {
          ...t,
          items: t.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  // 備品の品名・金額を更新
  const handleUpdateItem = (
    teacherId: string,
    itemId: string,
    field: 'name' | 'cost',
    value: string | number
  ) => {
    onUpdateTeachers(
      teachers.map((t) => {
        if (t.id !== teacherId) return t;
        return {
          ...t,
          items: t.items.map((item) => {
            if (item.id !== itemId) return item;
            if (field === 'cost') {
              const num = parseInt(String(value).replace(/[^0-9]/g, ''), 10);
              return { ...item, cost: isNaN(num) ? 0 : num };
            }
            return { ...item, [field]: value };
          }),
        };
      })
    );
  };

  // まとめ買いモードの切り替え（トグル）
  const handleToggleBulk = (teacherId: string, itemId: string) => {
    onUpdateTeachers(
      teachers.map((t) => {
        if (t.id !== teacherId) return t;
        return {
          ...t,
          items: t.items.map((item) => {
            if (item.id !== itemId) return item;
            const nextIsBulk = !item.isBulk;
            if (nextIsBulk) {
              // 初回切り替え時の初期値設定（既存の金額または1000円）
              const pkgCost =
                item.bulkPackageCost !== undefined
                  ? item.bulkPackageCost
                  : item.cost > 0
                  ? item.cost
                  : 1000;
              const totalCount =
                item.bulkTotalCount !== undefined ? item.bulkTotalCount : 10;
              const usedCount =
                item.bulkUsedCount !== undefined ? item.bulkUsedCount : 3;
              const calculatedCost =
                totalCount > 0
                  ? Math.round((pkgCost / totalCount) * usedCount)
                  : 0;

              return {
                ...item,
                isBulk: true,
                bulkPackageCost: pkgCost,
                bulkTotalCount: totalCount,
                bulkUsedCount: usedCount,
                cost: calculatedCost,
              };
            } else {
              // 通常入力に戻す（計算された実費はそのまま保持）
              return {
                ...item,
                isBulk: false,
              };
            }
          }),
        };
      })
    );
  };

  // まとめ買い用の入力値（購入金額・入り数・使用数）を更新し、実費を再計算
  const handleUpdateBulkField = (
    teacherId: string,
    itemId: string,
    field: 'bulkPackageCost' | 'bulkTotalCount' | 'bulkUsedCount',
    rawValue: string
  ) => {
    const num = parseInt(rawValue.replace(/[^0-9]/g, ''), 10);
    const cleanVal = isNaN(num) ? 0 : num;

    onUpdateTeachers(
      teachers.map((t) => {
        if (t.id !== teacherId) return t;
        return {
          ...t,
          items: t.items.map((item) => {
            if (item.id !== itemId) return item;

            const pkgCost =
              field === 'bulkPackageCost'
                ? cleanVal
                : item.bulkPackageCost ?? 1000;
            const totalCount =
              field === 'bulkTotalCount'
                ? cleanVal
                : item.bulkTotalCount ?? 10;
            const usedCount =
              field === 'bulkUsedCount'
                ? cleanVal
                : item.bulkUsedCount ?? 1;

            // 実費 ＝ 購入金額 ÷ 入り数 × 使用数（円未満は四捨五入）
            const calculatedCost =
              totalCount > 0
                ? Math.round((pkgCost / totalCount) * usedCount)
                : 0;

            return {
              ...item,
              [field]: cleanVal,
              cost: calculatedCost,
            };
          }),
        };
      })
    );
  };

  // 全先生の備品合計総額
  const totalAllExpenses = teachers.reduce(
    (sum, t) => sum + t.items.reduce((iSum, i) => iSum + (Number(i.cost) || 0), 0),
    0
  );

  return (
    <section className="space-y-6">
      {/* 見出しバッジ（ピル型・空背景の上でもクッキリ見える高コントラスト太字） */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 bg-[#FFECCC] border-2 border-[#FFC766] px-4 py-2 rounded-full shadow-xs">
          <CuteFlower className="w-5 h-5 text-[#D46B08]" />
          <span className="text-sm sm:text-base font-extrabold text-[#733B00] tracking-tight">
            ステップ 1：先生ごとに備品代を登録
          </span>
        </div>
        <div className="text-sm font-bold text-[#59363E] bg-white/95 px-4 py-1.5 rounded-full border border-[#D9BAC2] shadow-2xs">
          全備品代 合計：<span className="font-black text-[#D96B76] text-base ml-1">{formatYen(totalAllExpenses)}</span>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-xs rounded-3xl p-4 sm:p-6 border-2 border-[#FAD6DC] shadow-sm">
        <p className="text-sm sm:text-base text-[#5B3E45] leading-relaxed mb-4">
          花束・色紙・アルバムなど、先生への贈り物にかかった備品を登録してください。
          品名と金額を何個でも自由に追加でき、先生ごとの合計が自動計算されます。
        </p>

        {/* 先生カード一覧 */}
        <div className="space-y-5">
          {teachers.map((teacher, index) => {
            const teacherTotal = teacher.items.reduce(
              (sum, item) => sum + (Number(item.cost) || 0),
              0
            );

            return (
              <div
                key={teacher.id}
                className="bg-[#FFFDF9] rounded-2xl border-2 border-[#F6DCE1] p-4 sm:p-5 transition-all shadow-xs"
              >
                {/* 先生ヘッダー */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F7E4E7]">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: teacher.color }}
                    />
                    <span className="text-xs sm:text-xs font-bold text-[#8C5260] bg-[#FFF2F4] px-2.5 py-1 rounded-full">
                      先生 {index + 1}
                    </span>
                    <input
                      type="text"
                      value={teacher.name}
                      onChange={(e) =>
                        handleUpdateTeacherName(teacher.id, e.target.value)
                      }
                      className="font-bold text-base sm:text-lg text-[#4B3138] bg-transparent border-b border-dashed border-[#DE9DA9] focus:border-[#D96B76] focus:bg-white/90 px-1 py-1 outline-hidden transition-all rounded-xs w-full max-w-[240px]"
                      placeholder="先生のお名前"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs text-[#8C5260] block leading-tight font-medium">
                        この先生の備品合計
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-[#D96B76]">
                        {formatYen(teacherTotal)}
                      </span>
                    </div>

                    {teachers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#B47C88] hover:text-[#C93B4E] hover:bg-[#FFEAEF] rounded-full transition-colors cursor-pointer"
                        title="この先生を削除"
                        aria-label="この先生を削除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 備品リスト */}
                <div className="mt-3 space-y-2.5">
                  {teacher.items.length === 0 ? (
                    <p className="text-sm text-[#9C757F] italic py-3 px-2 text-center bg-[#FFF7F8] rounded-xl border border-dashed border-[#FAD6DC]">
                      まだ備品が登録されていません。「＋ 品目を自由に追加」から登録してください。
                    </p>
                  ) : (
                    teacher.items.map((item, iIdx) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all ${
                          item.isBulk
                            ? 'bg-[#FFFDF7] border-[#FCD8A8] shadow-xs p-3 sm:p-3.5'
                            : 'bg-white/90 border-[#F2DEE2] hover:border-[#E8B8C2] p-2.5 sm:px-3'
                        }`}
                      >
                        {/* メイン行 */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                          <span className="text-sm font-mono text-[#A87B86] w-5 shrink-0 text-center font-bold">
                            {iIdx + 1}.
                          </span>

                          {/* 品名 */}
                          <div className="flex-1 min-w-[140px]">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleUpdateItem(
                                  teacher.id,
                                  item.id,
                                  'name',
                                  e.target.value
                                )
                              }
                              className="w-full text-base sm:text-sm text-[#4B3138] bg-transparent border border-transparent hover:border-[#E3C8CE] focus:border-[#D96B76] focus:bg-white rounded-lg px-2.5 py-1.5 outline-hidden min-h-[40px]"
                              placeholder="品名（例: 色紙代）"
                            />
                          </div>

                          {/* まとめ買い切り替えボタン */}
                          <button
                            type="button"
                            onClick={() => handleToggleBulk(teacher.id, item.id)}
                            className={`inline-flex items-center gap-1.5 text-xs sm:text-xs px-3 py-2 min-h-[40px] rounded-full font-bold transition-all cursor-pointer shrink-0 ${
                              item.isBulk
                                ? 'bg-[#FFF1DE] text-[#9E5A0B] border border-[#FAD09E] hover:bg-[#FFE5C7]'
                                : 'bg-[#FBF8F5] text-[#7E655B] border border-[#E8DACB] hover:bg-[#FFF3E3] hover:text-[#9E5A0B] hover:border-[#FAD09E]'
                            }`}
                            title={
                              item.isBulk
                                ? '通常の金額直接入力に戻す'
                                : 'パックやまとめ買いの実費を計算する'
                            }
                          >
                            <Package className="w-4 h-4 text-[#E67E22]" />
                            <span>
                              {item.isBulk ? '直接入力に戻す' : '📦 まとめ買い計算'}
                            </span>
                          </button>

                          {/* 金額エリア：通常時は直接入力欄、まとめ買い時は計算された実費表示 */}
                          {!item.isBulk ? (
                            <div className="w-32 sm:w-36 flex items-center bg-[#FFF8EE] rounded-xl px-2.5 py-1.5 border border-[#F5E2C4] shrink-0 min-h-[44px]">
                              <span className="text-sm font-bold text-[#8C5E2D] mr-1">¥</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={item.cost === 0 ? '' : item.cost}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    teacher.id,
                                    item.id,
                                    'cost',
                                    e.target.value
                                  )
                                }
                                className="w-full text-base sm:text-sm font-bold text-right text-[#4B3138] bg-transparent outline-hidden"
                                placeholder="0"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-[#FFF0DB] border border-[#FCD29F] rounded-xl px-3 py-1.5 shrink-0 min-h-[44px]">
                              <span className="text-xs text-[#8C541B] font-bold">
                                実費:
                              </span>
                              <span className="text-base sm:text-lg font-black text-[#D96B76]">
                                {formatYen(item.cost)}
                              </span>
                            </div>
                          )}

                          {/* 削除ボタン */}
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(teacher.id, item.id)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#C4929D] hover:text-[#C93B4E] hover:bg-[#FFE8ED] rounded-full transition-colors cursor-pointer shrink-0"
                            title="この品目を削除"
                            aria-label="この品目を削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* まとめ買い計算モード時の3つの入力欄（購入金額・入り数・使用数） */}
                        {item.isBulk && (
                          <div className="mt-3 pt-3 border-t border-dashed border-[#FAD8B0] bg-[#FFFBF5] rounded-xl p-3 sm:p-3.5 space-y-2.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Calculator className="w-4 h-4 text-[#E67E22]" />
                              <span className="text-sm font-bold text-[#8C521E]">
                                パックまとめ買い 実費計算
                              </span>
                              <span className="text-xs text-[#A6754B]">
                                （使った分だけを贈り物費用として自動計算）
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                              {/* 1. 購入金額 */}
                              <div className="bg-white rounded-xl p-2.5 border border-[#F2D7B3] shadow-2xs">
                                <label className="block text-xs font-bold text-[#7D4D1F] mb-1">
                                  ① パック購入金額
                                </label>
                                <div className="flex items-center bg-[#FFFCF7] border border-[#EBD6BC] rounded-lg px-2.5 py-1.5 min-h-[42px]">
                                  <span className="text-sm font-bold text-[#9B6A38] mr-1">¥</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                      item.bulkPackageCost !== undefined
                                        ? item.bulkPackageCost === 0
                                          ? ''
                                          : item.bulkPackageCost
                                        : ''
                                    }
                                    onChange={(e) =>
                                      handleUpdateBulkField(
                                        teacher.id,
                                        item.id,
                                        'bulkPackageCost',
                                        e.target.value
                                      )
                                    }
                                    placeholder="1000"
                                    className="w-full text-base sm:text-sm font-bold text-right text-[#4B3138] outline-hidden bg-transparent"
                                  />
                                </div>
                              </div>

                              {/* 2. 入り数 */}
                              <div className="bg-white rounded-xl p-2.5 border border-[#F2D7B3] shadow-2xs">
                                <label className="block text-xs font-bold text-[#7D4D1F] mb-1">
                                  ② 入り数（全数）
                                </label>
                                <div className="flex items-center bg-[#FFFCF7] border border-[#EBD6BC] rounded-lg px-2.5 py-1.5 min-h-[42px]">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                      item.bulkTotalCount !== undefined
                                        ? item.bulkTotalCount === 0
                                          ? ''
                                          : item.bulkTotalCount
                                        : ''
                                    }
                                    onChange={(e) =>
                                      handleUpdateBulkField(
                                        teacher.id,
                                        item.id,
                                        'bulkTotalCount',
                                        e.target.value
                                      )
                                    }
                                    placeholder="10"
                                    className="w-full text-base sm:text-sm font-bold text-right text-[#4B3138] outline-hidden bg-transparent"
                                  />
                                  <span className="text-xs text-[#9B6A38] ml-1 shrink-0 font-medium">
                                    個/枚
                                  </span>
                                </div>
                              </div>

                              {/* 3. 使用数 */}
                              <div className="bg-white rounded-xl p-2.5 border border-[#F2D7B3] shadow-2xs">
                                <label className="block text-xs font-bold text-[#7D4D1F] mb-1">
                                  ③ 実際に使用した数
                                </label>
                                <div className="flex items-center bg-[#FFFCF7] border border-[#EBD6BC] rounded-lg px-2.5 py-1.5 min-h-[42px]">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                      item.bulkUsedCount !== undefined
                                        ? item.bulkUsedCount === 0
                                          ? ''
                                          : item.bulkUsedCount
                                        : ''
                                    }
                                    onChange={(e) =>
                                      handleUpdateBulkField(
                                        teacher.id,
                                        item.id,
                                        'bulkUsedCount',
                                        e.target.value
                                      )
                                    }
                                    placeholder="3"
                                    className="w-full text-base sm:text-sm font-bold text-right text-[#4B3138] outline-hidden bg-transparent"
                                  />
                                  <span className="text-xs text-[#9B6A38] ml-1 shrink-0 font-medium">
                                    個/枚
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 計算結果バー */}
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFF3E2] px-3.5 py-2 rounded-xl border border-[#FBD9B0]">
                              <div className="text-xs text-[#8C5E2D]">
                                実費 ＝ ¥{item.bulkPackageCost ?? 0} ÷{' '}
                                {item.bulkTotalCount ?? 1} ×{' '}
                                {item.bulkUsedCount ?? 0}（円未満四捨五入）
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#6D3F12]">
                                  計上される実費:
                                </span>
                                <span className="text-base sm:text-lg font-black text-[#D96B76]">
                                  {formatYen(item.cost)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* 品目追加バー ＆ クイックプリセット */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dashed border-[#F3DFE3]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#9A707A] font-bold flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#D96B76]" />
                      よく使う品目:
                    </span>
                    {PRESET_ITEMS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          handleAddItem(teacher.id, preset.name, preset.defaultCost)
                        }
                        className="text-xs font-medium bg-[#FFF2F4] hover:bg-[#FFE0E6] text-[#8C4656] px-3 py-1.5 min-h-[36px] flex items-center rounded-full border border-[#F8CCD5] transition-colors cursor-pointer active:scale-95"
                      >
                        ＋ {preset.name}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddItem(teacher.id, '色紙・プレゼント代', 1000)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8C3C4E] hover:text-[#5E222F] bg-[#FFE8ED] hover:bg-[#FED1DC] px-4 py-2.5 min-h-[44px] rounded-full transition-colors cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    品目を自由に追加
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 先生を追加するフォーム */}
        <form
          onSubmit={handleAddTeacher}
          className="mt-6 bg-[#FFF8EE]/90 rounded-2xl border-2 border-dashed border-[#FAD8A8] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 flex-1 min-w-[220px]">
            <div className="w-10 h-10 rounded-full bg-[#FFE8BD] flex items-center justify-center text-[#8C5E2D] shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label
                htmlFor="newTeacherInput"
                className="text-sm font-bold text-[#8C5E2D] block mb-1"
              >
                先生を新しく追加する
              </label>
              <input
                id="newTeacherInput"
                type="text"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                placeholder="例: ひまわり組 すずき先生"
                className="w-full text-base sm:text-sm bg-white border border-[#EAC28E] rounded-xl px-3.5 py-2 min-h-[44px] text-[#4B3138] focus:border-[#D96B76] outline-hidden shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newTeacherName.trim()}
            className="inline-flex items-center gap-1.5 text-sm font-bold bg-[#D96B76] text-white hover:bg-[#C94F5C] disabled:bg-[#E3B8BF] disabled:cursor-not-allowed px-5 py-2.5 min-h-[44px] rounded-full shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            先生を追加
          </button>
        </form>
      </div>

      {/* 次へボタン */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 font-bold text-base bg-[#D96B76] text-white hover:bg-[#C85461] hover:scale-102 px-7 py-3 min-h-[48px] rounded-full shadow-md transition-all cursor-pointer"
        >
          <span>ステップ 2：参加者を登録へ進む</span>
          <span>→</span>
        </button>
      </div>
    </section>
  );
};
