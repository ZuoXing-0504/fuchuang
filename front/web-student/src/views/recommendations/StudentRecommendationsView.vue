<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getStudentRecommendations } from '../../api/student';
import type { StudentRecommendationsData } from '../../types';

const data = ref<StudentRecommendationsData>();
const activeCategory = ref('全部');

onMounted(async () => {
  data.value = await getStudentRecommendations();
});

const categories = computed(() => ['全部', ...new Set((data.value?.recommendations ?? []).map((item) => item.category))]);
const filteredList = computed(() => {
  if (activeCategory.value === '全部') {
    return data.value?.recommendations ?? [];
  }
  return (data.value?.recommendations ?? []).filter((item) => item.category === activeCategory.value);
});

const priorityLabel: Record<string, string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级'
};
</script>

<template>
  <section class="page-shell recommendation-page">
    <div class="hero panel-card">
      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="hero-eyebrow">Action Queue</div>
        <h1 class="hero-title">行动建议</h1>
        <p class="hero-subtitle">这里整理了当前最值得优先调整的方向，你可以先按分类查看，再决定从哪一项开始改变。</p>
      </div>
    </div>

    <div class="filter-bar panel-card">
      <button
        v-for="item in categories"
        :key="item"
        class="filter-btn"
        :class="{ active: activeCategory === item }"
        @click="activeCategory = item"
      >
        {{ item }}
      </button>
    </div>

    <div class="summary-grid">
      <div class="summary-card panel-card">
        <div class="summary-label">建议总数</div>
        <div class="summary-value">{{ data?.recommendations?.length ?? 0 }}</div>
      </div>
      <div class="summary-card panel-card">
        <div class="summary-label">当前分类</div>
        <div class="summary-value">{{ activeCategory }}</div>
      </div>
    </div>

    <div class="recommendation-list">
      <article v-for="item in filteredList" :key="item.id" class="recommendation-card panel-card">
        <div class="card-top">
          <span class="category-chip">{{ item.category }}</span>
          <span class="priority-chip" :class="item.priority">{{ priorityLabel[item.priority] }}</span>
        </div>
        <div class="card-title">{{ item.title }}</div>
        <div class="card-copy">{{ item.description }}</div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.recommendation-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  position: relative;
  overflow: hidden;
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

.hero-copy {
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
  font-size: 14px;
  line-height: 1.9;
  color: rgba(248, 250, 252, 0.82);
}

.filter-bar {
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.filter-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #dbe3dc;
  background: #fff;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
}

.filter-btn.active {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  border-color: transparent;
  color: #fff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recommendation-card {
  padding: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-chip,
.priority-chip {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.category-chip {
  background: #eff6ff;
  color: #1d4ed8;
}

.priority-chip.high {
  background: #fef2f2;
  color: #b91c1c;
}

.priority-chip.medium {
  background: #fff7ed;
  color: #9a3412;
}

.priority-chip.low {
  background: #ecfdf5;
  color: #166534;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.card-copy {
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
