import { Teacher, Participant } from '../types';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'さくら組 たなか先生',
    role: '担任',
    color: '#FFDFE7',
    items: [
      { id: 'i-1-1', name: '花束（生花ブーケ）', cost: 3500 },
      {
        id: 'i-1-2',
        name: '寄せ書き色紙（まとめ買い）',
        cost: 300,
        isBulk: true,
        bulkPackageCost: 1000,
        bulkTotalCount: 10,
        bulkUsedCount: 3,
      },
      { id: 'i-1-3', name: '記念ギフト（真空タンブラー）', cost: 3300 },
    ],
  },
  {
    id: 't-2',
    name: '副担任 さとう先生',
    role: '副担任',
    color: '#E3F2FD',
    items: [
      { id: 'i-2-1', name: 'ミニブーケ', cost: 2000 },
      { id: 'i-2-2', name: 'メッセージ色紙', cost: 800 },
      { id: 'i-2-3', name: 'ハンドケアギフト', cost: 2200 },
    ],
  },
  {
    id: 't-3',
    name: '園長先生',
    role: '園長',
    color: '#FFF2CC',
    items: [
      { id: 'i-3-1', name: '感謝のアレンジメント花', cost: 3500 },
      { id: 'i-3-2', name: '卒園生一同の色紙', cost: 1000 },
    ],
  },
];

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p-1',
    name: '井出（はるき）',
    childName: 'はるき',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: true,
  },
  {
    id: 'p-2',
    name: '阪本（ななせ）',
    childName: 'ななせ',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: true,
  },
  {
    id: 'p-3',
    name: '宍戸（いちか）',
    childName: 'いちか',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: false,
  },
  {
    id: 'p-4',
    name: '芝野（あおと）',
    childName: 'あおと',
    teacherIds: ['t-1', 't-2'],
    isPaid: true,
  },
  {
    id: 'p-5',
    name: '竹辺（ゆい）',
    childName: 'ゆい',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: false,
  },
  {
    id: 'p-6',
    name: '津田（りあな）',
    childName: 'りあな',
    teacherIds: ['t-1', 't-2'],
    isPaid: false,
  },
  {
    id: 'p-7',
    name: '中村（そうすけ）',
    childName: 'そうすけ',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: true,
  },
  {
    id: 'p-8',
    name: '藤本（なお）',
    childName: 'なお',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: false,
  },
  {
    id: 'p-9',
    name: '松村（りく）',
    childName: 'りく',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: true,
  },
  {
    id: 'p-10',
    name: '丸橋（りつき）',
    childName: 'りつき',
    teacherIds: ['t-1', 't-2', 't-3'],
    isPaid: false,
  },
];
