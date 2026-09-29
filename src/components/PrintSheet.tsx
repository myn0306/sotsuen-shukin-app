import React from 'react';
import { OverallCalculation } from '../types';
import { formatYen } from '../utils/calculator';
import { Scissors } from 'lucide-react';

interface PrintSheetProps {
  calculation: OverallCalculation;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ calculation }) => {
  const {
    teacherCalculations,
    participantCalculations,
    totalExpenseAmount,
    totalCollectedExpected,
    totalReserveFund,
    totalParticipantsCount,
  } = calculation;

  const todayStr = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="print-only text-[#222222] bg-white p-2">
      {/* ページ1：役員・クラス控え用「集金集計一覧表」 */}
      <div className="print-break-inside-avoid mb-8">
        <div className="border-b-2 border-[#555555] pb-2 mb-4 text-center">
          <h1 className="text-xl font-bold tracking-wider">
            卒園記念イベント 先生への贈り物 集金集計表
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            発行日：{todayStr} ／ 保育園 卒園対策係
          </p>
        </div>

        {/* 概要サマリー */}
        <div className="border border-gray-400 p-3 mb-4 rounded-sm text-xs grid grid-cols-4 gap-2 text-center bg-gray-50">
          <div>
            <span className="block text-gray-600">備品代実費 合計</span>
            <strong className="text-sm">{formatYen(totalExpenseAmount)}</strong>
          </div>
          <div>
            <span className="block text-gray-600">集金予定総額</span>
            <strong className="text-sm">{formatYen(totalCollectedExpected)}</strong>
          </div>
          <div>
            <span className="block text-gray-600">予備費（余剰金）</span>
            <strong className="text-sm">+{formatYen(totalReserveFund)}</strong>
          </div>
          <div>
            <span className="block text-gray-600">対象保護者数</span>
            <strong className="text-sm">{totalParticipantsCount} 名</strong>
          </div>
        </div>

        {/* 先生ごとの備品と割勘内訳 */}
        <div className="mb-4">
          <h2 className="text-xs font-bold border-l-4 border-gray-600 pl-2 mb-1.5">
            1. 先生ごとの備品代と割り勘額（円単位切り上げ）
          </h2>
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 text-left">先生名</th>
                <th className="border border-gray-300 p-1 text-left">備品内訳</th>
                <th className="border border-gray-300 p-1 text-right">備品実費</th>
                <th className="border border-gray-300 p-1 text-center">参加人数</th>
                <th className="border border-gray-300 p-1 text-right font-bold">1人あたり金額</th>
                <th className="border border-gray-300 p-1 text-right">予備費</th>
              </tr>
            </thead>
            <tbody>
              {teacherCalculations.map((tc) => (
                <tr key={tc.teacher.id}>
                  <td className="border border-gray-300 p-1 font-bold">
                    {tc.teacher.name}
                  </td>
                  <td className="border border-gray-300 p-1 text-[11px]">
                    {tc.teacher.items
                      .map((i) =>
                        i.isBulk && i.bulkTotalCount && i.bulkUsedCount
                          ? `${i.name}(実費${formatYen(i.cost)} [${i.bulkTotalCount}個中${i.bulkUsedCount}個])`
                          : `${i.name}(${formatYen(i.cost)})`
                      )
                      .join('、')}
                  </td>
                  <td className="border border-gray-300 p-1 text-right font-mono">
                    {formatYen(tc.totalCost)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {tc.participantCount}名
                  </td>
                  <td className="border border-gray-300 p-1 text-right font-bold font-mono">
                    {formatYen(tc.costPerPerson)}
                  </td>
                  <td className="border border-gray-300 p-1 text-right font-mono text-gray-600">
                    +{formatYen(tc.reserveFund)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 保護者ごとの集金一覧表（チェック欄つき） */}
        <div className="mb-6">
          <h2 className="text-xs font-bold border-l-4 border-gray-600 pl-2 mb-1.5">
            2. 各保護者の請求額と集金チェック欄
          </h2>
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 w-8 text-center">No.</th>
                <th className="border border-gray-300 p-1 text-left">保護者名</th>
                <th className="border border-gray-300 p-1 text-left">参加先生・内訳</th>
                <th className="border border-gray-300 p-1 text-right font-bold">請求金額</th>
                <th className="border border-gray-300 p-1 w-16 text-center">領収日</th>
                <th className="border border-gray-300 p-1 w-14 text-center">受取印</th>
              </tr>
            </thead>
            <tbody>
              {participantCalculations.map((p, idx) => (
                <tr key={p.participant.id}>
                  <td className="border border-gray-300 p-1 text-center font-mono">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-300 p-1 font-bold">
                    {p.participant.name} 様
                  </td>
                  <td className="border border-gray-300 p-1 text-[11px] text-gray-700">
                    {p.breakdown
                      .map((b) => `${b.teacherName} ${formatYen(b.amount)}`)
                      .join(' ＋ ')}
                  </td>
                  <td className="border border-gray-300 p-1 text-right font-bold font-mono text-sm">
                    {formatYen(p.totalAmount)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-mono">
                    {p.participant.isPaid ? '済' : '　/　'}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {p.participant.isPaid ? '済' : '印'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 改ページ：保護者配布用・集金袋用スリップ（キリトリ線つき） */}
      <div className="page-break" />

      <div className="pt-2">
        <div className="border-b border-gray-400 pb-1 mb-4 text-center">
          <h2 className="text-base font-bold">
            【保護者様 配布用】集金袋貼付・お渡しスリップ
          </h2>
          <p className="text-[10px] text-gray-500">
            キリトリ線で切り取り、集金袋に貼るか封入してご使用ください。
          </p>
        </div>

        {/* 2列グリッドでキリトリ線付きカードを配置 */}
        <div className="grid grid-cols-2 gap-4">
          {participantCalculations.map((p, idx) => (
            <div
              key={p.participant.id}
              className="border-2 border-dashed border-gray-400 p-3 rounded-md relative text-xs print-break-inside-avoid bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-300 pb-1 mb-2">
                <span className="font-bold text-sm">{p.participant.name} 様</span>
                <span className="text-[10px] text-gray-500 font-mono">No.{idx + 1}</span>
              </div>

              <p className="text-[11px] text-gray-600 mb-2">
                卒園記念品代（花束・色紙等）の集金をお願いいたします。
              </p>

              <div className="bg-gray-50 border border-gray-200 p-2 rounded-xs mb-2">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-gray-700">ご請求金額：</span>
                  <span className="text-base font-bold font-mono">
                    {formatYen(p.totalAmount)}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600">
                  <span className="font-bold">内訳：</span>
                  {p.breakdown
                    .map((b) => `${b.teacherName}（${formatYen(b.amount)}）`)
                    .join('、')}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-200">
                <span>※お釣りのないようご協力願います</span>
                <div className="w-16 h-8 border border-gray-400 flex items-center justify-center text-[9px] text-gray-400">
                  受領印
                </div>
              </div>

              {/* はさみアイコン */}
              <div className="absolute -bottom-3 right-4 bg-white px-1 text-gray-400 flex items-center gap-0.5 text-[9px]">
                <Scissors className="w-3 h-3" />
                <span>キリトリ</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
