<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getStudentHome } from '../../api/student';
import type { StudentHomeData } from '../../types';

const data = ref<StudentHomeData>();
const chartDrawerVisible = ref(false);
const activeChart = ref<StudentHomeData['analysisCharts'][number]>();

onMounted(async () => {
  data.value = await getStudentHome();
});

const summaryCards = computed(() => [
  { label: '分析图表', value: data.value?.analysisCharts?.length ?? 0 },
  { label: '已就绪图表', value: data.value?.chartStatus?.availableCount ?? 0 },
  { label: '缺失图表', value: data.value?.chartStatus?.missingCount ?? 0 }
]);

function chartUrl(url: string) {
  return url;
}

const chartDetailMap: Record<string, { xAxis: string; yAxis: string; competitionUse: string; requirementFit: string; readingGuide: string }> = {
  '01': {
    xAxis: '学习时长分组区间',
    yAxis: '学生人数',
    competitionUse: '用来展示全体学生的学习投入分布，让你知道自己处在整个样本里的什么位置。',
    requirementFit: '适用于展示学习投入分布和群体画像能力。',
    readingGuide: '先看多数学生集中在哪个区间，再看高投入或低投入是否形成长尾。'
  },
  '02': {
    xAxis: '图书馆打卡次数分组区间',
    yAxis: '学生人数',
    competitionUse: '用来展示线下学习资源利用情况，帮助理解系统为什么会关注图书馆活跃度。',
    requirementFit: '适用于展示资源利用和线下学习场景。',
    readingGuide: '如果低打卡区间人数很多，说明线下资源利用分层明显。'
  },
  '03': {
    xAxis: '健康指数分组区间',
    yAxis: '学生人数',
    competitionUse: '用来展示样本整体健康发展结构，说明系统不是只看成绩。',
    requirementFit: '适用于展示健康发展维度。',
    readingGuide: '重点看中低健康区间是否占比偏高。'
  },
  '04': {
    xAxis: '夜间上网占比分组区间',
    yAxis: '学生人数',
    competitionUse: '用来展示作息和夜间活跃情况，帮助理解行为规律维度。',
    requirementFit: '适用于展示行为规律和夜间活跃特征。',
    readingGuide: '如果高夜间占比呈长尾，说明一部分学生存在更明显的夜间偏移。'
  },
  '05': {
    xAxis: '学习时长',
    yAxis: '风险概率',
    competitionUse: '用来说明学习投入和风险之间的关系，是风险解释的重要图。',
    requirementFit: '适用于展示学习投入和风险之间的关系。',
    readingGuide: '看低学习时长区域是否更容易出现高风险点。'
  },
  '06': {
    xAxis: '图书馆打卡次数',
    yAxis: '风险概率',
    competitionUse: '用来说明资源利用和风险之间的关系，支撑后续干预建议。',
    requirementFit: '适用于展示资源利用和风险之间的关系。',
    readingGuide: '看低图书馆利用区域是否更容易落在高风险一侧。'
  },
  '07': {
    xAxis: '学生画像类别',
    yAxis: '人数',
    competitionUse: '用来展示系统识别出的主要学生群体，以及各类群体的人数占比。',
    requirementFit: '适用于展示当前识别出的主要学生群体分布。',
    readingGuide: '这张图重点回答“系统识别出了哪些群体，每类各有多少人”。'
  },
  '08': {
    xAxis: '核心特征维度',
    yAxis: '各群体标准化均值',
    competitionUse: '用来比较不同画像群体在关键维度上的差异。',
    requirementFit: '适用于展示不同群体在关键维度上的差异。',
    readingGuide: '重点看不同群体在哪些维度上差异最大。'
  }
};

function chartDetail(chart: StudentHomeData['analysisCharts'][number]) {
  return chartDetailMap[chart.title.slice(0, 2)] ?? chartDetailMap[chart.title] ?? chartDetailMap[String(chart.title).split('_')[0]] ?? chartDetailMap[(chart as any).id] ?? {
    xAxis: '图表横轴',
    yAxis: '图表纵轴',
    competitionUse: '用于展示全样本分析成果。',
    requirementFit: '适用于展示系统的全样本分析结果。',
    readingGuide: '建议结合整体分布和异常点来解释这张图。'
  };
}

function openChartDrawer(chart: StudentHomeData['analysisCharts'][number]) {
  activeChart.value = chart;
  chartDrawerVisible.value = true;
}
</script>

<template>
  <section class="page-shell analysis-page">
    <div class="hero panel-card">
      <div class="hero-copy">
        <div class="hero-eyebrow">全样本分析</div>
        <h1 class="hero-title">全样本分析</h1>
        <p class="hero-subtitle">这里展示的是全体学生的整体图表。它们既能帮助你理解自己在全体样本中的位置，也能帮助你从群体视角理解系统的分析逻辑。</p>
      </div>
      <div class="hero-side">
        <div class="hero-side-item">
          <span>图表状态</span>
          <strong>{{ data?.chartStatus?.ready ? '已准备完成' : '待补齐' }}</strong>
        </div>
        <div class="hero-side-item">
          <span>展示用途</span>
          <strong>全样本图表</strong>
        </div>
      </div>
    </div>

    <div class="summary-grid">
      <div v-for="card in summaryCards" :key="card.label" class="summary-card panel-card">
        <div class="summary-label">{{ card.label }}</div>
        <div class="summary-value">{{ card.value }}</div>
      </div>
    </div>

    <div v-if="data?.chartStatus?.installHint" class="chart-helper panel-card">
      <div class="helper-title">图表状态提示</div>
      <div class="helper-copy">{{ data.chartStatus.installHint }}</div>
    </div>

    <div v-if="data?.chartStatus && !data.chartStatus.ready" class="chart-alert panel-card">
      {{ data.chartStatus.message || '分析图表暂未准备完成' }}
    </div>

    <div v-else class="chart-grid">
      <article v-for="chart in data?.analysisCharts ?? []" :key="chart.title" class="chart-card panel-card" @click="openChartDrawer(chart)">
        <div class="chart-top">
          <div>
            <div class="chart-title">{{ chart.title }}</div>
            <div class="chart-category">{{ chart.category }}</div>
          </div>
          <span class="chart-badge">分析图</span>
        </div>
        <img :src="chartUrl(chart.url)" :alt="chart.title" class="chart-image" />
        <div class="chart-desc">{{ chart.description }}</div>
        <div class="chart-insight">{{ chart.insight }}</div>
        <div class="chart-entry">点击图片进入抽屉查看横轴、纵轴和详细解释</div>
      </article>
    </div>

    <el-drawer v-model="chartDrawerVisible" :title="activeChart?.title || '图表说明'" size="620px">
      <div v-if="activeChart" class="chart-drawer">
        <img :src="chartUrl(activeChart.url)" :alt="activeChart.title" class="drawer-chart-image" />
        <div class="drawer-grid">
          <div class="drawer-card">
            <div class="drawer-label">横轴</div>
            <div class="drawer-copy">{{ chartDetail(activeChart).xAxis }}</div>
          </div>
          <div class="drawer-card">
            <div class="drawer-label">纵轴</div>
            <div class="drawer-copy">{{ chartDetail(activeChart).yAxis }}</div>
          </div>
        </div>
        <div class="drawer-card">
          <div class="drawer-label">图表用途</div>
          <div class="drawer-copy">{{ chartDetail(activeChart).competitionUse }}</div>
        </div>
        <div class="drawer-card">
          <div class="drawer-label">适用场景</div>
          <div class="drawer-copy">{{ chartDetail(activeChart).requirementFit }}</div>
        </div>
        <div class="drawer-card">
          <div class="drawer-label">怎么理解这张图</div>
          <div class="drawer-copy">{{ chartDetail(activeChart).readingGuide }}</div>
        </div>
        <div class="drawer-card success">
          <div class="drawer-label">图中结论</div>
          <div class="drawer-copy">{{ activeChart.insight }}</div>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<style scoped>
.analysis-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
  border: 1px solid #dbe9f6;
}

.hero-eyebrow,
.summary-label,
.chart-category {
  font-size: 12px;
  color: #64748b;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.hero-subtitle,
.helper-copy,
.chart-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: #475569;
}

.hero-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.hero-side-item {
  padding: 16px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e3eefb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.hero-side-item strong,
.chart-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.summary-grid,
.chart-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-card,
.chart-card {
  padding: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.summary-value {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
}

.chart-helper,
.chart-alert {
  padding: 16px 18px;
  font-size: 13px;
  line-height: 1.7;
}

.chart-helper {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.chart-alert {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
}

.helper-title {
  font-weight: 800;
  margin-bottom: 4px;
}

.chart-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chart-card {
  cursor: pointer;
}

.chart-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.chart-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1677ff;
  font-size: 12px;
  font-weight: 700;
}

.chart-image {
  width: 100%;
  height: 240px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #dbe3ea;
  margin-bottom: 12px;
  background: #fff;
}

.chart-insight {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
  font-size: 13px;
  line-height: 1.7;
}

.chart-entry {
  margin-top: 10px;
  font-size: 12px;
  color: #1677ff;
  font-weight: 700;
}

.chart-drawer {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.drawer-chart-image {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 14px;
  border: 1px solid #dbe3ea;
  background: #fff;
}

.drawer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.drawer-card {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2edf9;
}

.drawer-card.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.drawer-label {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.drawer-copy {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.8;
  color: #475569;
}

@media (max-width: 960px) {
  .hero,
  .summary-grid,
  .chart-grid,
  .drawer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
