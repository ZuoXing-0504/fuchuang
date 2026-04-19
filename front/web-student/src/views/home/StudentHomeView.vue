<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getStudentHome } from '../../api/student';
import type { StudentHomeData } from '../../types';

const data = ref<StudentHomeData>();

onMounted(async () => {
  data.value = await getStudentHome();
});

const quickLinks = [
  { path: '/profile', title: '我的画像', description: '查看当前画像、细分标签和多维表现', action: '进入画像' },
  { path: '/compare', title: '群体对比', description: '看看自己与所属群体、全样本的差异位置', action: '查看对比' },
  { path: '/report', title: '个性化报告', description: '集中查看判断依据、解释结论和后续建议', action: '查看报告' },
  { path: '/analysis', title: '全样本分析', description: '浏览全体学生的分析图表与关键结论', action: '查看图表' }
];

const summaryCards = computed(() => data.value?.trendSummary ?? []);
const previewCharts = computed(() => (data.value?.analysisCharts ?? []).slice(0, 4));
const insights = computed(() => data.value?.insights ?? []);
const headlineTags = computed(() => [data.value?.profileCategory, data.value?.riskLevel, data.value?.performanceLevel].filter(Boolean));

function chartUrl(url: string) {
  return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}
</script>

<template>
  <section class="page-shell home-page">
    <div class="hero panel-card">
      <div class="hero-main">
        <div class="hero-eyebrow">首页</div>
        <h1 class="hero-title">{{ data?.studentName || data?.studentId || '当前学生' }}</h1>
        <p class="hero-subtitle">这里集中展示你当前的画像状态、重点判断和后续入口，帮助你先看清整体，再进入更具体的页面。</p>
        <div class="hero-tags">
          <span v-for="tag in headlineTags" :key="tag" class="hero-tag">{{ tag }}</span>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-side-title">常用入口</div>
        <div class="hero-side-list">
          <router-link v-for="item in quickLinks.slice(0, 3)" :key="item.path" :to="item.path" class="hero-side-item">
            <span>{{ item.title }}</span>
            <span>{{ item.action }}</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="summary-grid">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card panel-card">
        <div class="summary-label">{{ card.label }}</div>
        <div class="summary-value">{{ card.value }}</div>
      </article>
    </div>

    <el-card class="panel-card module-panel">
      <template #header>
        <div class="card-header-inner">
          <span>功能入口</span>
          <span class="minor-copy">按你的查看习惯进入对应页面</span>
        </div>
      </template>
      <div class="module-grid">
        <router-link v-for="item in quickLinks" :key="item.path" :to="item.path" class="module-card">
          <div class="module-top">
            <div class="module-title">{{ item.title }}</div>
            <div class="module-action">{{ item.action }}</div>
          </div>
          <div class="module-copy">{{ item.description }}</div>
        </router-link>
      </div>
    </el-card>

    <div class="content-grid">
      <el-card class="panel-card insight-card">
        <template #header>
          <div class="card-header-inner">
            <span>当前判断</span>
            <span class="minor-copy">围绕你的当前状态整理的重点结论</span>
          </div>
        </template>
        <div class="insight-list">
          <div v-for="(item, index) in insights" :key="index" class="insight-item">
            <div class="insight-index">{{ index + 1 }}</div>
            <div class="insight-text">{{ item }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card quick-card">
        <template #header>
          <div class="card-header-inner">
            <span>查看建议</span>
            <span class="minor-copy">按场景进入不同模块</span>
          </div>
        </template>
        <div class="quick-list">
          <router-link v-for="item in quickLinks" :key="item.path" :to="item.path" class="quick-item">
            <div>
              <div class="quick-title">{{ item.title }}</div>
              <div class="quick-desc">{{ item.description }}</div>
            </div>
            <span class="quick-arrow">{{ item.action }}</span>
          </router-link>
        </div>
      </el-card>
    </div>

    <el-card class="panel-card gallery-card">
      <template #header>
        <div class="card-header-inner">
          <span>全样本分析预览</span>
          <router-link to="/analysis" class="header-link">查看全部图表</router-link>
        </div>
      </template>
      <div v-if="data?.chartStatus?.installHint" class="chart-helper">
        <div class="helper-title">图表状态提示</div>
        <div class="helper-copy">{{ data.chartStatus.installHint }}</div>
      </div>
      <div v-if="data?.chartStatus && !data.chartStatus.ready" class="chart-alert">
        {{ data.chartStatus.message || '分析图表暂未准备完成' }}
      </div>
      <div v-else class="chart-grid">
        <div v-for="chart in previewCharts" :key="chart.title" class="chart-card">
          <img :src="chartUrl(chart.url)" :alt="chart.title" class="chart-image" />
          <div class="chart-title">{{ chart.title }}</div>
          <div class="chart-copy">{{ chart.insight || chart.description }}</div>
        </div>
      </div>
    </el-card>
  </section>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
  border: 1px solid #dbe9f6;
}

.hero-eyebrow,
.summary-label,
.minor-copy,
.module-action,
.quick-arrow,
.header-link {
  font-size: 12px;
  color: #64748b;
}

.hero-title {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.hero-subtitle {
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.9;
  color: #475569;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.hero-tag {
  padding: 8px 14px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1677ff;
  font-size: 12px;
  font-weight: 700;
}

.hero-side {
  padding: 18px;
  border-radius: 20px;
  background: #f8fbff;
  border: 1px solid #e3eefb;
}

.hero-side-title,
.module-title,
.quick-title,
.chart-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.hero-side-list,
.insight-list,
.quick-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.hero-side-item,
.quick-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e8eef5;
  color: #0f172a;
  text-decoration: none;
}

.summary-grid,
.content-grid,
.chart-grid,
.module-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card,
.chart-card {
  padding: 18px 20px;
}

.summary-value {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.module-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.module-card {
  display: block;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #e4edf8;
  text-decoration: none;
}

.module-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.module-copy,
.quick-desc,
.chart-copy,
.insight-text,
.helper-copy {
  font-size: 13px;
  line-height: 1.8;
  color: #64748b;
}

.content-grid {
  grid-template-columns: 1.05fr 0.95fr;
}

.insight-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
}

.insight-index {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(22, 119, 255, 0.12);
  color: #1677ff;
  display: grid;
  place-items: center;
  font-weight: 800;
  flex-shrink: 0;
}

.quick-arrow {
  flex-shrink: 0;
  font-weight: 700;
  color: #1677ff;
}

.chart-helper,
.chart-alert {
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.8;
}

.chart-helper {
  margin-bottom: 14px;
  background: #edf5ff;
  color: #1677ff;
}

.chart-alert {
  background: #fff4e6;
  color: #c2410c;
}

.helper-title {
  font-weight: 800;
}

.chart-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chart-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e3eefb;
  margin-bottom: 12px;
}

.header-link {
  text-decoration: none;
  font-weight: 700;
  color: #1677ff;
}

@media (max-width: 1080px) {
  .hero,
  .summary-grid,
  .content-grid,
  .chart-grid,
  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
