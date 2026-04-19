<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getAnalysisResults } from '../../api/admin';
import type { AnalysisResultsData } from '../../types';

const data = ref<AnalysisResultsData>();
const loading = ref(true);
const chartDrawerVisible = ref(false);
const activeChart = ref<AnalysisResultsData['charts'][number]>();

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await getAnalysisResults();
  } finally {
    loading.value = false;
  }
});

const toneColorMap = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
} as const;

const competitionNotes = computed(() => [
  '这些图表不是装饰信息，而是系统对全样本数据做出的核心分析结果。',
  '它们共同支撑群体画像、风险关联、行为规律和资源利用等多个分析视角。',
  '建议按“基础分布 -> 风险关联 -> 群体画像”这条顺序阅读，整体逻辑最清晰。'
]);

function chartUrl(url: string) {
  return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}

const chartDetailMap: Record<string, { xAxis: string; yAxis: string; competitionUse: string; requirementFit: string; readingGuide: string }> = {
  '01': {
    xAxis: '学习时长分组区间',
    yAxis: '学生人数',
    competitionUse: '展示全样本学习投入的总体分布，证明系统具备群体层面的分析能力。',
    requirementFit: '适用于展示学习投入结构、群体画像和整体可视化分析结果。',
    readingGuide: '先看高峰落在哪个学习时长区间，再看是否有长尾分布，用来说明整体投入结构。'
  },
  '02': {
    xAxis: '图书馆打卡次数分组区间',
    yAxis: '学生人数',
    competitionUse: '展示线下学习资源利用情况，补足“线上行为之外”的学习场景分析。',
    requirementFit: '适用于展示资源利用维度和群体分层情况。',
    readingGuide: '如果低打卡区间人数很多，说明资源利用存在明显分层，可作为后续解释依据。'
  },
  '03': {
    xAxis: '健康指数分组区间',
    yAxis: '学生人数',
    competitionUse: '展示健康发展结构，说明系统不是只看成绩，也覆盖身心发展维度。',
    requirementFit: '适用于展示健康发展维度的整体结构。',
    readingGuide: '重点看健康指数是否集中在中低段，用来说明健康发展这一维是否需要重点关注。'
  },
  '04': {
    xAxis: '夜间上网占比分组区间',
    yAxis: '学生人数',
    competitionUse: '展示夜间行为偏移和作息规律，是行为规律维度的重要证据。',
    requirementFit: '适用于展示行为规律和夜间活跃特征。',
    readingGuide: '如果高夜间占比呈明显长尾，就能说明少数学生存在更明显的夜间偏移。'
  },
  '05': {
    xAxis: '学习时长',
    yAxis: '风险概率',
    competitionUse: '展示学习投入和风险之间的关联，用来解释风险模型为什么这样判断。',
    requirementFit: '适用于展示学习投入和风险之间的关联。',
    readingGuide: '重点看低学习时长区域是否聚集更多高风险点，这能直接支撑“学习投入不足会抬高风险”。'
  },
  '06': {
    xAxis: '图书馆打卡次数',
    yAxis: '风险概率',
    competitionUse: '展示资源利用和风险之间的关系，补足线下场景的解释链路。',
    requirementFit: '适用于展示资源利用和风险之间的关联。',
    readingGuide: '如果低图书馆利用区域更容易出现高风险点，就能支撑“补线下学习资源利用”的干预建议。'
  },
  '07': {
    xAxis: '学生画像类别',
    yAxis: '人数',
    competitionUse: '展示四类主画像的样本分布，是群体模式识别成果的直接证明。',
    requirementFit: '适用于展示当前识别出的主要学生群体分布。',
    readingGuide: '这张图主要回答“系统到底识别出哪些群体、每类有多少人”，是聚类成果最直观的图。'
  },
  '08': {
    xAxis: '核心特征维度',
    yAxis: '各群体标准化均值',
    competitionUse: '比较不同画像群体在学习投入、行为规律、健康发展等维度上的差异。',
    requirementFit: '适用于展示不同群体在关键维度上的差异。',
    readingGuide: '如果不同群体在多条维度线上差异明显，就能说明这四类画像是有真实行为差异支撑的。'
  }
};

function chartDetail(chart: AnalysisResultsData['charts'][number]) {
  return chartDetailMap[chart.id] ?? {
    xAxis: '图表横轴',
    yAxis: '图表纵轴',
    competitionUse: '用于展示系统的分析成果。',
    requirementFit: '适用于展示系统的全样本分析结果。',
    readingGuide: '建议结合峰值、分布和异常点来说明这张图。'
  };
}

function openChartDrawer(chart: AnalysisResultsData['charts'][number]) {
  activeChart.value = chart;
  chartDrawerVisible.value = true;
}
</script>

<template>
  <section class="page-shell analysis-page">
    <div class="hero panel-card">
      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="hero-eyebrow">Analysis Gallery</div>
        <h1 class="hero-title">分析成果</h1>
        <p class="hero-subtitle">这 8 张图是系统对全样本数据形成的核心分析结果，用来支撑群体洞察、画像识别和多维解释能力。</p>
      </div>
      <div class="hero-side">
        <div class="hero-chip">全样本图表</div>
        <div class="hero-chip">群体画像支撑</div>
        <div class="hero-chip">点击图片看详解</div>
      </div>
    </div>

    <div class="summary-grid">
      <article v-for="card in data?.summaryCards ?? []" :key="card.label" class="summary-card panel-card">
        <div class="summary-label">{{ card.label }}</div>
        <div class="summary-value" :style="{ color: toneColorMap[card.tone] }">{{ card.value }}</div>
      </article>
    </div>

    <div class="content-grid">
      <el-card class="panel-card dark-panel">
        <template #header>
          <div class="card-header-inner">
            <span>查看路径</span>
            <span class="minor-copy light">建议从整体到细节阅读</span>
          </div>
        </template>
        <div class="storyline-list">
          <div v-for="(item, index) in data?.storyline ?? []" :key="index" class="storyline-item">
            <div class="story-index">{{ index + 1 }}</div>
            <div class="story-text">{{ item }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card helper-panel">
        <template #header>
          <div class="card-header-inner">
            <span>图表用途</span>
            <span class="minor-copy">为什么要有这 8 张图</span>
          </div>
        </template>
        <div class="helper-list">
          <div v-for="item in competitionNotes" :key="item" class="helper-item">{{ item }}</div>
        </div>
        <div v-if="data?.chartStatus?.installHint" class="chart-helper">
          <div class="helper-title">补图提示</div>
          <div class="helper-copy">{{ data.chartStatus.installHint }}</div>
        </div>
        <div v-if="data?.chartStatus && !data.chartStatus.ready" class="chart-alert">
          <div class="alert-title">分析图尚未全部就绪</div>
          <div class="alert-copy">{{ data.chartStatus.message || '请检查图表生成依赖和输出目录。' }}</div>
        </div>
      </el-card>
    </div>

    <el-skeleton v-if="loading" animated :rows="8" />

    <div class="chart-grid" v-else-if="data?.chartStatus?.ready">
      <article v-for="chart in data?.charts ?? []" :key="chart.id" class="chart-card panel-card" @click="openChartDrawer(chart)">
        <div class="chart-top">
          <div>
            <div class="chart-title">{{ chart.title }}</div>
            <div class="chart-category">{{ chart.category }}</div>
          </div>
          <div class="chart-id">图 {{ chart.id }}</div>
        </div>
        <img :src="chartUrl(chart.url)" :alt="chart.title" class="chart-image" />
        <div class="chart-desc">{{ chart.description }}</div>
        <div class="chart-insight">
          <span class="insight-label">核心结论</span>
          <span>{{ chart.insight }}</span>
        </div>
        <div class="chart-entry">点击进入抽屉查看横轴、纵轴、图表用途和详细解释</div>
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
          <div class="drawer-label">如何讲这张图</div>
          <div class="drawer-copy">{{ chartDetail(activeChart).readingGuide }}</div>
        </div>
        <div class="drawer-card success">
          <div class="drawer-label">系统结论</div>
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
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
  padding: 28px;
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 38%), linear-gradient(135deg, #0f172a, #10283d 60%, #1f5136);
  color: #f8fafc;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.25));
}

.hero-copy,
.hero-side {
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #93c5fd;
  margin-bottom: 10px;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 34px;
  font-weight: 900;
}

.hero-subtitle {
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(248, 250, 252, 0.82);
}

.hero-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.hero-chip {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  padding: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.summary-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 30px;
  font-weight: 900;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 18px;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.minor-copy {
  font-size: 12px;
  color: #94a3b8;
}

.minor-copy.light {
  color: rgba(248, 250, 252, 0.68);
}

.dark-panel {
  background: linear-gradient(135deg, #0f172a, #16263a);
  color: #f8fafc;
}

.storyline-list,
.helper-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storyline-item,
.helper-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
}

.storyline-item {
  background: rgba(255, 255, 255, 0.06);
}

.helper-item {
  background: #f8fbff;
  color: #475569;
  line-height: 1.8;
}

.story-index {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  flex-shrink: 0;
}

.story-text {
  line-height: 1.8;
  color: rgba(248, 250, 252, 0.84);
}

.helper-panel {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.chart-helper,
.chart-alert {
  margin-top: 14px;
  padding: 16px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.8;
}

.chart-helper {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.chart-alert {
  background: #fff7ed;
  color: #9a3412;
}

.helper-title,
.alert-title {
  font-weight: 800;
  margin-bottom: 6px;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.chart-card {
  padding: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
  cursor: pointer;
}

.chart-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.chart-category,
.chart-entry {
  font-size: 12px;
  color: #64748b;
}

.chart-id {
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

.chart-desc {
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
}

.chart-insight {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
  font-size: 13px;
  line-height: 1.7;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.insight-label {
  font-weight: 800;
}

.chart-entry {
  margin-top: 10px;
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
  .content-grid,
  .chart-grid,
  .drawer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
