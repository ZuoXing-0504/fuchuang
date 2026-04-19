<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getAnalysisResults } from '../../api/admin';
import type { AnalysisResultsData } from '../../types';

const data = ref<AnalysisResultsData>();
const loading = ref(true);

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

function chartUrl(url: string) {
  return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}
</script>

<template>
  <section class="page-shell analysis-page">
    <div class="hero panel-card">
      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="hero-eyebrow">Analysis Gallery</div>
        <h1 class="hero-title">分析成果</h1>
        <p class="hero-subtitle">集中查看系统基于当前样本生成的分析图与对应结论，方便日常查看和趋势研判。</p>
      </div>
      <div class="hero-side">
        <div class="hero-chip">图表总览</div>
        <div class="hero-chip">真实样本</div>
        <div class="hero-chip">自动更新</div>
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
            <span>图表状态</span>
            <span class="minor-copy">后端输出检查</span>
          </div>
        </template>
        <div v-if="data?.chartStatus?.installHint" class="chart-helper">
          <div class="helper-title">补图提示</div>
          <div class="helper-copy">{{ data.chartStatus.installHint }}</div>
        </div>
        <div v-if="data?.chartStatus && !data.chartStatus.ready" class="chart-alert">
          <div class="alert-title">分析图尚未全部就绪</div>
          <div class="alert-copy">{{ data.chartStatus.message || '请检查图表生成依赖和输出目录。' }}</div>
        </div>
        <div v-else class="ready-card">
          <div class="ready-title">图表已准备完成</div>
          <div class="ready-copy">当前页面展示的是后端真实导出的全样本分析图。</div>
        </div>
      </el-card>
    </div>

    <el-skeleton v-if="loading" animated :rows="8" />

    <div class="chart-grid" v-else-if="data?.chartStatus?.ready">
      <article v-for="chart in data?.charts ?? []" :key="chart.id" class="chart-card panel-card">
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
      </article>
    </div>
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
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.25));
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

.storyline-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storyline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
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
.chart-alert,
.ready-card {
  padding: 16px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.8;
}

.chart-helper {
  margin-bottom: 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.chart-alert {
  background: #fff7ed;
  color: #9a3412;
}

.ready-card {
  background: #f0fdf4;
  color: #166534;
}

.helper-title,
.alert-title,
.ready-title {
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
  margin-bottom: 4px;
  color: #0f172a;
}

.chart-category {
  font-size: 12px;
  color: #64748b;
}

.chart-id {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.chart-image {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #dbe3ea;
  margin-bottom: 12px;
}

.chart-desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 10px;
}

.chart-insight {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
  font-size: 13px;
  line-height: 1.7;
}

.insight-label {
  display: inline-block;
  margin-right: 8px;
  font-weight: 800;
}

@media (max-width: 1100px) {
  .hero,
  .summary-grid,
  .content-grid,
  .chart-grid {
    grid-template-columns: 1fr 1fr;
  }

  .hero-side {
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .hero,
  .summary-grid,
  .content-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>

