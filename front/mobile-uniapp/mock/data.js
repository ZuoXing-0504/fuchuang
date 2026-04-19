export const studentHome = {
  name: '林晨',
  profileCategory: '自律待提升型',
  riskLevel: '高风险',
  scorePrediction: '71.4',
  healthLevel: '中',
  scholarshipProbability: '22%'
};

export const trendList = [
  { month: '11月', learning: 52, risk: 56, health: 66, score: 76 },
  { month: '12月', learning: 49, risk: 60, health: 64, score: 74 },
  { month: '1月', learning: 45, risk: 63, health: 62, score: 72 },
  { month: '2月', learning: 47, risk: 61, health: 63, score: 73 },
  { month: '3月', learning: 44, risk: 66, health: 59, score: 71 },
  { month: '4月', learning: 46, risk: 68, health: 58, score: 71.4 }
];

export const recommendationGroups = [
  { category: '学习', items: ['完成本周课程作业清单', '固定晚间 2 小时学习时段'] },
  { category: '作息', items: ['连续两周提前 30 分钟入睡', '减少深夜娱乐上网'] },
  { category: '健康', items: ['每周 3 次有氧运动', '维持稳定早餐习惯'] },
  { category: '综合', items: ['参加一次班级活动', '与辅导员沟通阶段目标'] }
];

export const adminOverview = {
  kpis: [
    { label: '高风险', value: '286' },
    { label: '中风险', value: '534' },
    { label: '重点跟进', value: '96' },
    { label: '已干预', value: '182' }
  ],
  warnings: [
    { studentId: '20230001', name: '林晨', college: '计算机学院', riskLevel: '高风险' },
    { studentId: '20230008', name: '陈瑶', college: '计算机学院', riskLevel: '高风险' },
    { studentId: '20220016', name: '赵宇', college: '计算机学院', riskLevel: '中风险' }
  ]
};
