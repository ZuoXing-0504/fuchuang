<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getStudentHome } from '../../api/student';
import type { StudentHomeData } from '../../types';

const data = ref<StudentHomeData>();

onMounted(async () => {
  data.value = await getStudentHome();
});

const summaryCards = computed(() => [
  { label: '分析图表', value: data.value?.analysisCharts?.length ?? 0 },
  { label: '已就绪图表', value: data.value?.chartStatus?.availableCount ?? 0 },
  { label: '缺失图表', value: data.value?.chartStatus?.missingCount ?? 0 }
]);

function chartUrl(url: string) {
  return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}
</script>

<template>
  <section class="page-shell analysis-page">
    <div class="hero panel-card">
      <div class="hero-copy">
        <div class="hero-eyebrow">全样本分析</div>
        <h1 class="hero-title">全样本分析</h1>
        <p class="hero-subtitle">这里展示的是全体学生的整体图表，你可以借此了解样本分布、风险关联和群体差异，再回到自己的报告做对照。</p>
      </div>
      <div class="hero-side">
        <div class="hero-side-item">
          <span>图表状态</span>
          <strong>{{ data?.chartStatus?.ready ? '已准备完成' : '待补齐' }}</strong>
        </div>
        <div class="hero-side-item">
          <span>样本视角</span>
          <strong>全体学生</strong>
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
      <article v-for="chart in data?.analysisCharts ?? []" :key="chart.title" class="chart-card panel-card">
        <div class="chart-top">
          <div>
            <div class="chart-title">{{ chart.title }}</div>
            <div class="chart-category">{{ chart.category }}</div>
          </div>
          <span class="chart-badge">成果图</span>
        </div>
        <img :src="chartUrl(chart.url)" :alt="chart.title" class="chart-image" />
        <div class="chart-desc">{{ chart.description }}</div>
        <div class="chart-insight">{{ chart.insight }}</div>
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
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #dbe3ea;
  margin-bottom: 12px;
}

.chart-insight {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .hero,
  .summary-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
