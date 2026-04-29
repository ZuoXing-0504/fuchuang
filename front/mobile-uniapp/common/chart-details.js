import { getApiBase } from './config';

const CHART_DETAIL_MAP = {
  '01': {
    xAxis: '学习时长分组区间',
    yAxis: '学生人数',
    use: '展示全样本学习投入的总体分布，帮助理解系统对学习投入结构的判断。',
    scene: '适用于说明学习投入分布、整体画像结构和样本分层。',
    guide: '先看峰值主要落在哪个区间，再看是否存在明显长尾。'
  },
  '02': {
    xAxis: '图书馆打卡次数分组区间',
    yAxis: '学生人数',
    use: '展示线下学习资源利用情况，补充线上行为之外的学习场景。',
    scene: '适用于说明资源利用分层和线下学习参与度。',
    guide: '重点看低打卡区间是否集中了更多学生。'
  },
  '03': {
    xAxis: '健康指数分组区间',
    yAxis: '学生人数',
    use: '展示健康发展维度的整体结构，说明系统不只看成绩。',
    scene: '适用于说明身心发展结构和健康维度分布。',
    guide: '观察中低健康区间占比是否偏高。'
  },
  '04': {
    xAxis: '夜间上网占比分组区间',
    yAxis: '学生人数',
    use: '展示夜间活跃和作息偏移情况，是行为规律的重要证据。',
    scene: '适用于说明作息规律和夜间行为偏移。',
    guide: '高夜间占比如果呈长尾，通常意味着少部分学生夜间偏移明显。'
  },
  '05': {
    xAxis: '学习时长',
    yAxis: '风险概率',
    use: '展示学习投入与风险之间的关系，支撑风险解释。',
    scene: '适用于说明学习投入和风险关联。',
    guide: '看低学习时长区域是否更容易出现高风险点。'
  },
  '06': {
    xAxis: '图书馆打卡次数',
    yAxis: '风险概率',
    use: '展示资源利用与风险之间的关系，支撑线下场景解释。',
    scene: '适用于说明资源利用和风险关联。',
    guide: '看低图书馆利用区域是否更容易出现高风险点。'
  },
  '07': {
    xAxis: '学生画像类别',
    yAxis: '人数',
    use: '展示系统识别出的主要画像类别及其样本占比。',
    scene: '适用于说明群体模式识别结果。',
    guide: '这张图重点回答系统识别出了哪些群体，每类人数有多少。'
  },
  '08': {
    xAxis: '核心特征维度',
    yAxis: '各群体标准化均值',
    use: '比较不同画像群体在关键维度上的差异。',
    scene: '适用于说明不同群体在学习投入、行为规律、健康发展等维度的差异。',
    guide: '重点看不同群体在哪些维度上的差异最大。'
  }
};

export function chartUrl(url) {
  if (!url) {
    return '';
  }
  if (url.startsWith('http')) {
    return url;
  }
  const base = String(getApiBase() || '').replace(/\/+$/, '');
  const path = String(url).startsWith('/') ? String(url) : `/${String(url)}`;
  if (!base) {
    return path;
  }
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    return `${base}${path.slice(4)}`;
  }
  return `${base}${path}`;
}

export function getChartDetail(chart) {
  const title = String((chart && chart.title) || '');
  const id = String((chart && chart.id) || '');
  const guess = id || title.slice(0, 2) || title.split('_')[0];
  return CHART_DETAIL_MAP[guess] || {
    xAxis: '图表横轴',
    yAxis: '图表纵轴',
    use: '用于展示系统的全样本分析结果。',
    scene: '适用于说明整体分布和关键差异。',
    guide: '建议结合峰值、分布和异常点来解释这张图。'
  };
}
