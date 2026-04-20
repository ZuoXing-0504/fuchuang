<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取趋势和群体对比...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">趋势加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else>
      <view class="panel-card">
        <view class="card-title">我的趋势</view>
        <view class="helper-text">追踪学习投入、风险、健康和预测得分的月度变化。</view>
        <view class="metric-tabs">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="metric-tab"
            :class="{ active: activeTab === tab.key }"
            :style="{ '--tab-color': tab.color }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </view>
        </view>
        <view class="summary-grid">
          <view v-for="item in summaryCards" :key="item.label" class="metric-card">
            <view class="metric-label">{{ item.label }}</view>
            <view class="metric-value" :style="{ color: item.color }">{{ item.value }}</view>
          </view>
        </view>
        <view class="trend-list">
          <view v-for="item in currentTrend" :key="item.month" class="trend-item">
            <view class="trend-month">{{ item.month }}</view>
            <view class="trend-track">
              <view class="trend-fill" :style="{ width: percentWidth(item.value), background: currentTab.color }"></view>
            </view>
            <view class="trend-value">{{ item.value.toFixed(1) }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card" v-if="compare">
        <view class="card-title">群体对比</view>
        <view class="helper-text">所属群体：{{ compare.clusterLabel }}，参考口径：{{ compare.overallLabel }}</view>
        <view class="chip-row">
          <view v-for="item in compare.clusterTraits" :key="item" class="tag-chip">{{ item }}</view>
        </view>
        <view class="compare-list">
          <view v-for="item in compare.compareMetrics" :key="item.label" class="compare-item">
            <view class="compare-head">
              <view class="compare-label">{{ item.label }}</view>
              <view class="compare-meta">本人 {{ item.selfScore }} / 群体 {{ item.clusterScore }} / 全样本 {{ item.overallScore }}</view>
            </view>
            <view class="bar-stack">
              <view class="bar-line">
                <view class="bar-tag self">本人</view>
                <view class="bar-track"><view class="bar-fill self" :style="{ width: percentWidth(item.selfScore) }"></view></view>
              </view>
              <view class="bar-line">
                <view class="bar-tag cluster">群体</view>
                <view class="bar-track"><view class="bar-fill cluster" :style="{ width: percentWidth(item.clusterScore) }"></view></view>
              </view>
              <view class="bar-line">
                <view class="bar-tag overall">全样本</view>
                <view class="bar-track"><view class="bar-fill overall" :style="{ width: percentWidth(item.overallScore) }"></view></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { ensureRole } from '../../../common/session';
import { getStudentCompare, getStudentTrends } from '../../../api/student';

const loading = ref(true);
const error = ref('');
const trends = ref(null);
const compare = ref(null);
const activeTab = ref('study');

const tabs = [
  { key: 'study', label: '学习投入', color: '#2d7a4f' },
  { key: 'risk', label: '风险概率', color: '#ef4444' },
  { key: 'health', label: '健康状态', color: '#3b82f6' },
  { key: 'score', label: '预测得分', color: '#d4a32a' }
];

const currentTab = computed(() => tabs.find((item) => item.key === activeTab.value) || tabs[0]);
const currentTrend = computed(() => {
  const source = trends.value || {};
  const trendKey = activeTab.value + 'Trend';
  return source[trendKey] || [];
});
const summaryCards = computed(() => {
  const values = currentTrend.value.map((item) => Number(item.value) || 0);
  const latest = values.length ? values[values.length - 1] : 0;
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const highest = values.length ? Math.max(...values) : 0;
  return [
    { label: '最新值', value: latest.toFixed(1), color: currentTab.value.color },
    { label: '平均值', value: average.toFixed(1), color: '#64748b' },
    { label: '阶段最高', value: highest.toFixed(1), color: '#4338ca' }
  ];
});

onShow(() => {
  if (!ensureRole('student')) {
    return;
  }
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [trendResult, compareResult] = await Promise.all([
      getStudentTrends(),
      getStudentCompare()
    ]);
    trends.value = trendResult;
    compare.value = compareResult;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '趋势页面加载失败';
  } finally {
    loading.value = false;
  }
}

function percentWidth(value) {
  return Math.max(Math.min(Number(value) || 0, 100), 4) + '%';
}
</script>

<style scoped>
.metric-tabs {
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
  margin: 20rpx 0;
}

.metric-tab {
  white-space: nowrap;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 2rpx solid #e4ece2;
  color: #68756d;
  font-size: 24rpx;
  font-weight: 700;
}

.metric-tab.active {
  background: var(--tab-color);
  border-color: transparent;
  color: #ffffff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.trend-list,
.compare-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.trend-item {
  display: grid;
  grid-template-columns: 100rpx 1fr 90rpx;
  align-items: center;
  gap: 16rpx;
}

.trend-month,
.trend-value {
  font-size: 24rpx;
  color: #1a2e1f;
  font-weight: 700;
}

.trend-value {
  text-align: right;
}

.trend-track,
.bar-track {
  height: 12rpx;
  background: #e5efe6;
  border-radius: 999rpx;
  overflow: hidden;
}

.trend-fill,
.bar-fill {
  height: 100%;
  border-radius: 999rpx;
}

.compare-item {
  padding: 18rpx;
  border-radius: 20rpx;
  background: #f8faf6;
}

.compare-head {
  margin-bottom: 14rpx;
}

.compare-label {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.compare-meta {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #68756d;
}

.bar-stack {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.bar-line {
  display: grid;
  grid-template-columns: 90rpx 1fr;
  align-items: center;
  gap: 12rpx;
}

.bar-tag {
  font-size: 22rpx;
  font-weight: 700;
}

.bar-tag.self,
.bar-fill.self {
  color: #2d7a4f;
  background: #2d7a4f;
}

.bar-tag.cluster,
.bar-fill.cluster {
  color: #2563eb;
  background: #2563eb;
}

.bar-tag.overall,
.bar-fill.overall {
  color: #d97706;
  background: #d97706;
}

.bar-tag.self,
.bar-tag.cluster,
.bar-tag.overall {
  background: none;
}
</style>
