import {
  Teacher,
  Participant,
  TeacherCalculation,
  ParticipantCalculation,
  OverallCalculation,
} from '../types';

/**
 * 先生ごとの備品合計、参加人数、切り上げ後の一人当たり金額、予備費を計算
 */
export function calculateTeacher(
  teacher: Teacher,
  participants: Participant[]
): TeacherCalculation {
  // 1. 備品代合計
  const totalCost = teacher.items.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );

  // 2. この先生に参加している保護者数
  const participantCount = participants.filter((p) =>
    p.teacherIds.includes(teacher.id)
  ).length;

  // 3. 一人当たりの金額（円単位で切り上げ）
  const costPerPerson =
    participantCount > 0 ? Math.ceil(totalCost / participantCount) : 0;

  // 集金される予定の金額
  const totalCollected = costPerPerson * participantCount;

  // 切り上げにより多く集まった予備費
  const reserveFund = Math.max(0, totalCollected - totalCost);

  return {
    teacher,
    totalCost,
    participantCount,
    costPerPerson,
    totalCollected,
    reserveFund,
  };
}

/**
 * すべての計算（先生別・保護者別・全体統計）を実行
 */
export function calculateOverall(
  teachers: Teacher[],
  participants: Participant[]
): OverallCalculation {
  // 先生ごとの計算マップ
  const teacherCalculations = teachers.map((teacher) =>
    calculateTeacher(teacher, participants)
  );
  const teacherCostMap = new Map<string, number>();
  const teacherObjMap = new Map<string, Teacher>();

  teacherCalculations.forEach((tc) => {
    teacherCostMap.set(tc.teacher.id, tc.costPerPerson);
    teacherObjMap.set(tc.teacher.id, tc.teacher);
  });

  // 保護者ごとの計算
  const participantCalculations: ParticipantCalculation[] = participants.map(
    (participant) => {
      const breakdown = participant.teacherIds
        .map((tId) => {
          const teacher = teacherObjMap.get(tId);
          const amount = teacherCostMap.get(tId) || 0;
          return {
            teacherId: tId,
            teacherName: teacher ? teacher.name : '不明な先生',
            amount,
          };
        })
        // 先生が実際に存在するものだけ
        .filter((b) => teacherObjMap.has(b.teacherId));

      const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);

      return {
        participant,
        breakdown,
        totalAmount,
      };
    }
  );

  // 全体集計
  const totalExpenseAmount = teacherCalculations.reduce(
    (sum, t) => sum + t.totalCost,
    0
  );

  const totalCollectedExpected = participantCalculations.reduce(
    (sum, p) => sum + p.totalAmount,
    0
  );

  const totalReserveFund = Math.max(0, totalCollectedExpected - totalExpenseAmount);

  const totalParticipantsCount = participants.length;
  const paidParticipantsCount = participants.filter((p) => p.isPaid).length;

  const totalCollectedActual = participantCalculations
    .filter((p) => p.participant.isPaid)
    .reduce((sum, p) => sum + p.totalAmount, 0);

  return {
    teacherCalculations,
    participantCalculations,
    totalExpenseAmount,
    totalCollectedExpected,
    totalReserveFund,
    totalParticipantsCount,
    paidParticipantsCount,
    totalCollectedActual,
  };
}

/**
 * 日本円のフォーマット表示 (例: ¥1,200)
 */
export function formatYen(amount: number): string {
  return `¥${(amount || 0).toLocaleString('ja-JP')}`;
}
