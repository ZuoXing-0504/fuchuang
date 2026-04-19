<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getStudentCompare } from '../../api/student';
import type { StudentCompareData } from '../../types';

const data = ref<StudentCompareData>();

onMounted(async () => {
  data.value = await getStudentCompare();
});

const seriesColors = {
  self: '#1677ff',
  cluster: '#69b1ff',
  overall: '#18a058'
};
</script>

<template>
  <section class="page-shell compare-page">
    <div class="hero panel-card">
      <div>
        <div class="hero-eyebrow">群体对比</div>
        <h1 class="hero-title">{{ data?.studentName ?? '当前学生' }}</h1>
        <p class="hero-subtitle">把你的个体表现放到所属群体和全样本中对照，帮助理解你当前所处的位置和更值得优先关注的方向。</p>
      </div>
      <div class="hero-side">
        <div class="hero-chip self">本人</div>
        <div class="hero-chip cluster">{{ data?.clusterLabel ?? '所属群体' }}</div>
        <div class="hero-chip overall">{{ data?.overallLabel ?? '全样本均值' }}</div>
      </div>
    </div>

    <div class="ranking-grid">
      <article v-for="card in data?.rankingCards ?? []" :key="card.label" class="ranking-card panel-card">
        <div class="ranking-label">{{ card.label }}</div>
        <div class="ranking-value">{{ card.value }}{{ card.suffix }}</div>
      </article>
    </div>

    <div class="main-grid">
      <el-card class="panel-card compare-card">
        <template #header>
          <div class="card-header-inner">
            <span>多维指标对照</span>
            <span class="minor-copy">本人 / 群体 / 全样本</span>
          </div>
        </template>
        <div class="compare-list">
          <div v-for="metric in data?.compareMetrics ?? []" :key="metric.label" class="compare-row">
            <div class="compare-label">{{ metric.label }}</div>
            <div class="compare-bars">
              <div class="bar-group">
                <div class="bar-meta"><span class="dot" :style="{ background: seriesColors.self }"></span>本人 {{ metric.selfScore }}</div>
                <div class="bar-track"><div class="bar-fill" :style="{ width: `${metric.selfScore}%`, background: seriesColors.self }"></div></div>
              </div>
              <div class="bar-group">
                <div class="bar-meta"><span class="dot" :style="{ background: seriesColors.cluster }"></span>群体 {{ metric.clusterScore }}</div>
                <div class="bar-track"><div class="bar-fill" :style="{ width: `${metric.clusterScore}%`, background: seriesColors.cluster }"></div></div>
              </div>
              <div class="bar-group">
                <div class="bar-meta"><span class="dot" :style="{ background: seriesColors.overall }"></span>全样本 {{ metric.overallScore }}</div>
                <div class="bar-track"><div class="bar-fill" :style="{ width: `${metric.overallScore}%`, background: seriesColors.overall }"></div></div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <div class="side-col">
        <el-card class="panel-card side-card">
          <template #header>
            <div class="card-header-inner">
              <span>所属群体特征</span>
              <span class="minor-copy">从群体视角理解你的位置</span>
            </div>
          </template>
          <div class="trait-list">
            <div v-for="trait in data?.clusterTraits ?? []" :key="trait" class="trait-item">{{ trait }}</div>
          </div>
        </el-card>

        <el-card class="panel-card side-card">
          <template #header>
            <div class="card-header-inner">
              <span>对比解释</span>
              <span class="minor-copy">结合多个维度生成</span>
            </div>
          </template>
          <div class="explain-list">
            <div v-for="(item, index) in data?.explanations ?? []" :key="index" class="explain-item">
              <div class="explain-index">{{ index + 1 }}</div>
              <div class="explain-text">{{ item }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.compare-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
  border: 1px solid #dbe9f6;
}

.hero-eyebrow,
.ranking-label,
.minor-copy,
.bar-meta {
  font-size: 12px;
  color: #64748b;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.hero-subtitle {
  margin: 0;
  max-width: 700px;
  font-size: 14px;
  line-height: 1.9;
  color: #475569;
}

.hero-side {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.hero-chip {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.hero-chip.self { background: #eff6ff; color: #1677ff; }
.hero-chip.cluster { background: #ecfeff; color: #0f766e; }
.hero-chip.overall { background: #f0fdf4; color: #15803d; }

.ranking-grid,
.main-grid {
  display: grid;
  gap: 16px;
}

.ranking-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.main-grid {
  grid-template-columns: 1.1fr 0.9fr;
}

.ranking-card {
  padding: 20px;
}

.ranking-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.side-col,
.compare-list,
.trait-list,
.explain-list,
.compare-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.compare-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #eef2f7;
}

.compare-row:first-of-type {
  padding-top: 0;
  border-top: 0;
}

.compare-label {
  font-weight: 700;
  color: #0f172a;
}

.bar-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.bar-track {
  height: 10px;
  border-radius: 999px;
  background: #e7eef8;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
}

.trait-item,
.explain-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
}

.explain-item {
  display: flex;
  gap: 12px;
}

.explain-index {
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

.explain-text,
.trait-item {
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
}

@media (max-width: 1080px) {
  .ranking-grid,
  .main-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
  }

  .hero-side {
    justify-content: flex-start;
  }
}
</style>
