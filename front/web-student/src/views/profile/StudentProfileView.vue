<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getStudentProfile } from '../../api/student';
import type { StudentProfileData } from '../../types';

const router = useRouter();
const data = ref<StudentProfileData>();

onMounted(async () => {
  data.value = await getStudentProfile();
});

const sortedRadar = computed(() => [...(data.value?.radar ?? [])].sort((a, b) => b.value - a.value));
</script>

<template>
  <section class="page-shell profile-page">
    <div class="hero panel-card">
      <div>
        <div class="hero-eyebrow">我的画像</div>
        <h1 class="hero-title">{{ data?.profileCategory || '当前画像' }}</h1>
        <div v-if="data?.profileSubtype" class="hero-subtype">{{ data.profileSubtype }}</div>
        <p class="hero-subtitle">{{ data?.description || '这里会从画像标签、多维表现和细分特征三个层面，帮助你理解当前状态。' }}</p>
        <div v-if="data?.secondaryTags?.length" class="hero-tags">
          <span v-for="item in data.secondaryTags" :key="item" class="hero-tag">{{ item }}</span>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-badge">
          <span class="badge-label">风险等级</span>
          <span class="badge-value">{{ data?.riskLevel }}</span>
        </div>
        <div class="hero-badge">
          <span class="badge-label">健康档次</span>
          <span class="badge-value">{{ data?.healthLevel }}</span>
        </div>
        <div class="hero-badge">
          <span class="badge-label">综合发展</span>
          <span class="badge-value">{{ Math.round((data?.scholarshipProbability ?? 0) * 100) }}%</span>
        </div>
        <el-button class="hero-action" @click="router.push('/report')">查看得分公式</el-button>
      </div>
    </div>

    <div class="main-grid">
      <el-card class="panel-card metric-panel">
        <template #header>
          <div class="card-header-inner">
            <span>多维画像指标</span>
            <span class="minor-copy">从学习、规律、健康和成长四个方面看当前表现</span>
          </div>
        </template>
        <div class="metric-list">
          <div v-for="item in data?.radar ?? []" :key="item.indicator" class="metric-row">
            <div class="metric-name">{{ item.indicator }}</div>
            <div class="metric-track"><div class="metric-fill" :style="{ width: `${item.value}%` }"></div></div>
            <div class="metric-value">{{ item.value }}</div>
          </div>
        </div>
      </el-card>

      <div class="side-col">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>细分画像解释</span>
              <span class="minor-copy">主画像下的进一步识别</span>
            </div>
          </template>
          <div class="profile-explanation">{{ data?.profileExplanation || '这里会结合学习投入、行为规律、线下资源利用和风险敏感度，对当前画像做进一步说明。' }}</div>
          <div v-if="data?.profileHighlights?.length" class="highlight-list">
            <div v-for="(item, index) in data.profileHighlights" :key="item" class="highlight-item">
              <div class="highlight-index">{{ index + 1 }}</div>
              <div class="highlight-copy">{{ item }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>优势项</span>
              <span class="minor-copy">当前较有优势的维度</span>
            </div>
          </template>
          <div class="tag-list">
            <span v-for="item in data?.strengths ?? []" :key="item" class="tag success">{{ item }}</span>
          </div>
        </el-card>

        <el-card class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>待提升项</span>
              <span class="minor-copy">当前更值得优先关注的维度</span>
            </div>
          </template>
          <div class="tag-list">
            <span v-for="item in data?.weaknesses ?? []" :key="item" class="tag warn">{{ item }}</span>
          </div>
        </el-card>
      </div>
    </div>

    <el-card class="panel-card">
      <template #header>
        <div class="card-header-inner">
          <span>指标排序</span>
          <span class="minor-copy">按分值从高到低</span>
        </div>
      </template>
      <div class="rank-list">
        <div v-for="(item, index) in sortedRadar" :key="item.indicator" class="rank-item">
          <div class="rank-index">{{ index + 1 }}</div>
          <div class="rank-name">{{ item.indicator }}</div>
          <div class="rank-score">{{ item.value }}</div>
        </div>
      </div>
    </el-card>
  </section>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(135deg, #1677ff, #4ea4ff 55%, #7dc0ff);
  color: #fff;
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
  margin-bottom: 10px;
}

.hero-title {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 900;
}

.hero-subtype {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 700;
  opacity: 0.92;
}

.hero-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.9);
}

.hero-tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 700;
}

.hero-side {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-content: flex-start;
  gap: 12px;
}

.hero-badge {
  min-width: 124px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
}

.badge-label,
.minor-copy {
  font-size: 12px;
  color: #64748b;
}

.badge-label {
  color: rgba(255, 255, 255, 0.72);
}

.badge-value {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  font-weight: 800;
}

.hero-action {
  border: none;
  border-radius: 14px;
  background: #fff;
  color: #1677ff;
}

.main-grid {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 18px;
}

.metric-panel {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.metric-list,
.rank-list,
.highlight-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.metric-row {
  display: grid;
  grid-template-columns: 110px 1fr 48px;
  gap: 12px;
  align-items: center;
}

.metric-name,
.rank-name,
.info-label,
.switch-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.metric-track {
  height: 12px;
  border-radius: 999px;
  background: #e8f1fb;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #1677ff, #69b1ff);
}

.metric-value,
.rank-score {
  font-size: 18px;
  font-weight: 900;
  color: #1677ff;
  text-align: right;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-explanation,
.highlight-copy {
  font-size: 14px;
  line-height: 1.9;
  color: #475569;
}

.highlight-item,
.rank-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: start;
  padding: 14px;
  border-radius: 14px;
  background: #f8fbff;
}

.rank-item {
  grid-template-columns: 28px 1fr 56px;
  align-items: center;
}

.highlight-index,
.rank-index {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(22, 119, 255, 0.12);
  color: #1677ff;
  font-weight: 800;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.tag.success {
  background: #e8f7ee;
  color: #15803d;
}

.tag.warn {
  background: #fff4e6;
  color: #c2410c;
}

@media (max-width: 960px) {
  .hero,
  .main-grid {
    grid-template-columns: 1fr;
  }

  .hero-side {
    justify-content: flex-start;
  }
}
</style>
