<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getModelSummary } from '../../api/admin';
import type { ModelSummary } from '../../types';

const summary = ref<ModelSummary>();

onMounted(async () => {
  summary.value = await getModelSummary();
});

const maxImportance = computed(() => {
  if (!summary.value?.importance.length) return 1;
  return Math.max(...summary.value.importance.map(i => i.importance));
});

const barColors = ['#2563eb', '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa'];

const modelColorMap: Record<string, string> = {
  'RandomForest': '#10b981',
  'LogisticRegression': '#3b82f6',
  'ExtraTrees': '#f59e0b'
};

const getMetricLevel = (val: number) => {
  if (val >= 0.9) return { color: '#10b981', bg: '#d1fae5', label: '优秀' };
  if (val >= 0.85) return { color: '#3b82f6', bg: '#dbeafe', label: '良好' };
  if (val >= 0.8) return { color: '#f59e0b', bg: '#fef3c7', label: '一般' };
  return { color: '#ef4444', bg: '#fee2e2', label: '待优化' };
};
</script>

<template>
  <section class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">模型分析</h1>
        <p class="page-subtitle">展示风险分类模型性能总表、特征重要性与业务说明</p>
      </div>
    </div>

    <el-card class="panel-card">
      <template #header>
        <div class="card-header-inner">
          <span>模型性能总表</span>
          <el-tag effect="dark" round size="small" type="success">{{ summary?.metrics.length ?? 0 }} 个模型</el-tag>
        </div>
      </template>
      <el-table :data="summary?.metrics ?? []" stripe>
        <el-table-column prop="model" label="模型" width="180">
          <template #default="{ row }">
            <div class="model-cell">
              <div class="model-dot" :style="{ background: modelColorMap[row.model] ?? '#64748b' }"></div>
              <span class="model-name">{{ row.model }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="accuracy" label="Accuracy" width="120">
          <template #default="{ row }">
            <div class="metric-cell">
              <span class="metric-val">{{ row.accuracy.toFixed(3) }}</span>
              <el-tag :color="getMetricLevel(row.accuracy).bg" :style="{ color: getMetricLevel(row.accuracy).color, border: 'none' }" size="small" effect="dark" round>{{ getMetricLevel(row.accuracy).label }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="precision" label="Precision" width="120">
          <template #default="{ row }">
            <span class="metric-val">{{ row.precision.toFixed(3) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="recall" label="Recall" width="120">
          <template #default="{ row }">
            <span class="metric-val">{{ row.recall.toFixed(3) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="f1" label="F1" width="120">
          <template #default="{ row }">
            <span class="metric-val">{{ row.f1.toFixed(3) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="auc" label="AUC" width="120">
          <template #default="{ row }">
            <div class="metric-cell">
              <span class="metric-val highlight">{{ row.auc.toFixed(3) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cvAuc" label="CV AUC" width="120">
          <template #default="{ row }">
            <span class="metric-val highlight">{{ row.cvAuc.toFixed(3) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="split-grid">
      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>特征重要性</span>
            <el-tag effect="dark" round size="small" type="primary">Top5</el-tag>
          </div>
        </template>
        <div class="importance-list">
          <div v-for="(item, i) in summary?.importance ?? []" :key="item.feature" class="importance-row">
            <div class="imp-rank" :style="{ background: barColors[i] ?? '#64748b' }">{{ i + 1 }}</div>
            <div class="imp-content">
              <div class="imp-name">{{ item.feature }}</div>
              <div class="imp-bar-track">
                <div class="imp-bar-fill" :style="{ width: `${(item.importance / maxImportance) * 100}%`, background: barColors[i] ?? '#64748b' }"></div>
              </div>
            </div>
            <div class="imp-value" :style="{ color: barColors[i] ?? '#64748b' }">{{ (item.importance * 100).toFixed(1) }}%</div>
          </div>
        </div>
      </el-card>
      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>文本说明</span>
            <el-tag effect="dark" round size="small" type="info">解读</el-tag>
          </div>
        </template>
        <div class="desc-list">
          <div v-for="(item, i) in summary?.description ?? []" :key="i" class="desc-item">
            <div class="desc-rank" :style="{ background: ['#2563eb', '#3b82f6', '#6366f1'][i] ?? '#64748b' }">{{ i + 1 }}</div>
            <div class="desc-text">{{ item }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.model-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-dot {
  width: 10px;
  height: 10px;
  border-radius: 4px;
  flex-shrink: 0;
}

.model-name {
  font-weight: 700;
}

.metric-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-val {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.metric-val.highlight {
  color: var(--brand);
  font-weight: 800;
}

.importance-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.importance-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.imp-rank {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}

.imp-content {
  flex: 1;
  min-width: 0;
}

.imp-name {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 6px;
}

.imp-bar-track {
  height: 10px;
  border-radius: 5px;
  background: #f1f5f9;
  overflow: hidden;
}

.imp-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease;
}

.imp-value {
  font-weight: 800;
  font-size: 15px;
  min-width: 60px;
  text-align: right;
  flex-shrink: 0;
}

.desc-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.desc-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.desc-item:hover {
  background: #f1f5f9;
}

.desc-rank {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}

.desc-text {
  line-height: 1.7;
  color: var(--text-primary);
  font-size: 14px;
  padding-top: 4px;
}
</style>
