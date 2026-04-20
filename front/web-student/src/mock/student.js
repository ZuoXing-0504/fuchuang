export const studentUser = {
    id: 'student-demo',
    username: 'student-demo',
    studentId: 'student-demo',
    name: '示例学生',
    role: 'student',
    token: 'student-demo-token'
};
export const homeData = {
    studentId: 'student-demo',
    studentName: '示例学生',
    profileCategory: '示例画像',
    profileSubtype: '示例细分子类',
    riskLevel: '低风险',
    performanceLevel: '中表现',
    scholarshipProbability: 0.5,
    healthLevel: '良',
    trendSummary: [
        { label: '学习投入指数', value: '60分' },
        { label: '风险概率', value: '12%' },
        { label: '群体画像', value: '示例画像' },
        { label: '综合发展', value: '68分' }
    ],
    insights: ['当前为占位 mock 数据，正常运行时会由后端真实数据覆盖。'],
    chartStatus: {
        ready: false,
        message: 'mock 环境未加载真实图表。',
        missingCount: 8,
        availableCount: 0,
        installHint: ''
    },
    analysisCharts: []
};
export const profileData = {
    studentId: 'student-demo',
    profileCategory: '示例画像',
    profileSubtype: '示例细分子类',
    profileExplanation: '当前为占位 mock 数据，正常运行时会由后端真实数据覆盖。',
    profileHighlights: ['示例亮点 1', '示例亮点 2'],
    description: '当前为占位 mock 数据，正常运行时会由后端真实数据覆盖。',
    radar: [
        { indicator: '学习投入', value: 60 },
        { indicator: '行为规律', value: 55 },
        { indicator: '健康发展', value: 62 },
        { indicator: '风险安全', value: 70 },
        { indicator: '综合发展', value: 68 }
    ],
    strengths: ['学习投入'],
    weaknesses: ['行为规律'],
    scholarshipProbability: 0.5,
    riskLevel: '低风险',
    healthLevel: '良'
};
export const reportData = {
    studentId: 'student-demo',
    title: '示例个性化报告',
    summary: '当前为占位 mock 数据，正常运行时会由后端真实数据覆盖。',
    reportMeta: {
        studentName: '示例学生',
        college: '示例学院',
        major: '示例专业',
        profileCategory: '示例画像',
        profileSubtype: '示例细分子类',
        riskLevel: '低风险',
        reportDate: '2026-04-16'
    },
    sections: ['示例段落'],
    evaluations: ['示例解释'],
    suggestions: ['示例建议'],
    profileExplanation: '当前为占位 mock 数据，正常运行时会由后端真实数据覆盖。',
    profileHighlights: ['示例亮点 1', '示例亮点 2'],
    behaviorDetails: [
        { label: '学习时长', value: '18小时', note: '当前为占位 mock 数据' },
        { label: '图书馆打卡次数', value: '12次', note: '当前为占位 mock 数据' }
    ],
    academicDetails: [
        { label: '考试平均分', value: '82分', note: '当前为占位 mock 数据' },
        { label: '风险概率', value: '12%', note: '当前为占位 mock 数据' }
    ],
    dimensionBasis: [
        {
            dimension: '学习投入',
            selfScore: 60,
            overallScore: 58,
            clusterScore: 62,
            judgement: '介于群体与全样本均值之间',
            summary: '当前为占位 mock 数据'
        }
    ],
    predictionSteps: [
        {
            title: '原始特征采集',
            summary: '当前为占位 mock 数据',
            items: ['学习时长', '图书馆打卡次数', '风险概率']
        }
    ],
    predictionEvidence: [
        {
            label: '学习时长',
            value: '18小时',
            effect: '投入依据',
            reason: '当前为占位 mock 数据'
        }
    ],
    featureTables: [
        {
            title: '原始行为与成绩特征',
            description: '当前为占位 mock 数据',
            rows: [
                {
                    label: '学习时长',
                    key: 'analysis_master.study_time',
                    value: '18小时',
                    unit: '小时',
                    source: 'analysis_master.csv',
                    usedInPrediction: true,
                    description: '当前为占位 mock 数据'
                }
            ]
        }
    ],
    featureFormulas: [
        {
            feature: '学习投入指数',
            formula: '当前为占位 mock 数据',
            explanation: '当前为占位 mock 数据',
            source: 'mock'
        }
    ],
    scoreCards: [
        { label: '学习投入', score: 60 },
        { label: '行为规律', score: 55 },
        { label: '健康发展', score: 62 },
        { label: '综合发展', score: 68 }
    ]
};
export const recommendationGroups = {
    studentId: 'student-demo',
    recommendations: [
        {
            id: 'REC-1',
            category: '综合',
            priority: 'medium',
            title: '示例建议',
            description: '当前为占位 mock 数据，正常运行时会由后端真实数据覆盖。'
        }
    ]
};
