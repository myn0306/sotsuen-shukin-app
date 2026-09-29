export interface ExpenseItem {
  id: string;
  name: string;
  cost: number;
  isBulk?: boolean; // まとめ買い計算モード
  bulkPackageCost?: number; // パック・まとめ購入金額（例: 1000円）
  bulkTotalCount?: number; // 入り数・総数（例: 10枚）
  bulkUsedCount?: number; // 実際に使用する数（例: 3枚）
}

export interface Teacher {
  id: string;
  name: string;
  role?: string; // 例: 担任、副担任、フリー、園長など
  items: ExpenseItem[];
  color: string; // バッジやアイコン用パステルカラー
}

export interface Participant {
  id: string;
  name: string;
  childName?: string; // 園児のお名前（例: たなか あおい くん）
  teacherIds: string[]; // 参加する先生のIDリスト
  isPaid?: boolean; // 集金完了チェック
  memo?: string;
}

export interface TeacherCalculation {
  teacher: Teacher;
  totalCost: number;
  participantCount: number;
  costPerPerson: number; // 切り上げ後の一人あたり金額
  totalCollected: number; // costPerPerson * participantCount
  reserveFund: number; // totalCollected - totalCost (余剰・予備費)
}

export interface ParticipantBreakdownItem {
  teacherId: string;
  teacherName: string;
  amount: number;
}

export interface ParticipantCalculation {
  participant: Participant;
  breakdown: ParticipantBreakdownItem[];
  totalAmount: number;
}

export interface OverallCalculation {
  teacherCalculations: TeacherCalculation[];
  participantCalculations: ParticipantCalculation[];
  totalExpenseAmount: number; // 備品代の純粋合計
  totalCollectedExpected: number; // 集金予定総額
  totalReserveFund: number; // 予備費の合計
  totalParticipantsCount: number; // 保護者の人数
  paidParticipantsCount: number; // 集金完了人数
  totalCollectedActual: number; // 現在集金済みの金額
}

export type StepId = 1 | 2 | 3 | 4;
