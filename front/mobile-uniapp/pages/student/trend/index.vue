<template>
  <view class="page-wrap">
    <view class="header-card">
      <view class="header-title">我的趋势</view>
      <view class="header-desc">追踪学习、健康、风险和成绩变化</view>
    </view>

    <view class="metric-tabs">
      <view v-for="tab in tabs" :key="tab.key" class="metric-tab" :class="{ active: activeTab === tab.key }" :style="{ '--color': tab.color }" @click="activeTab = tab.key">
        <view class="tab-dot" :style="{ background: tab.color }"></view>
        {{ tab.label }}
      </view>
    </view>

    <view class="summary-row">
      <view class="summary-card" v-for="card in summaryCards" :key="card.label">
        <view class="summary-label">{{ card.label }}</view>
        <view class="summary-value" :style="{ color: card.color }">{{ card.value }}</view>
      </view>
    </view>

    <view class="trend-card">
      <view class="trend-title">{{ currentTabLabel }}趋势</view>
      <view class="trend-list">
        <view v-for="(item, i) in trends" :key="item.month" class="trend-item">
          <view class="trend-month">{{ item.month }}</view>
          <view class="trend-bar-wrap">
            <view class="trend-bar" :style="{ background: currentTabColor, width: `${getBarWidth(item)}%` }"></view>
          </view>
          <view class="trend-value" :style="{ color: currentTabColor }">{{ getValue(item) }}</view>
          <view v-if="i > 0" class="trend-change" :class="getValue(item) > getValue(trends[i-1]) ? 'up' : 'down'">
            {{ getValue(item) > getValue(trends[i-1]) ? '↑' : '↓' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { trendList as trends } from '../../../mock/data';

const activeTab = ref('study');

const tabs = [
  { key: 'study', label: '学习', color: '#2d7a4f' },
  { key: 'risk', label: '风险', color: '#ef4444' },
  { key: 'health', label: '健康', color: '#3b82f6' },
  { key: 'score', label: '成绩', color: '#d4a32a' },
];

const currentTabColor = computed(() => tabs.find(t => t.key === activeTab.value)?.color ?? '#64748b');
const currentTabLabel = computed(() => tabs.find(t => t.key === activeTab.value)?.label ?? '');

function getValue(item) {
  const map = { study: item.learning, risk: item.risk, health: item.health, score: item.score };
  return Number(map[activeTab.value]) || 0;
}

function getBarWidth(item) {
  return Math.max(getValue(item), 10);
}

const summaryCards = computed(() => {
  const values = trends.map(t => getValue(t));
  const latest = values.length ? values[values.length - 1] : 0;
  const avg = values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;
  return [
    { label: '最新值', value: latest, color: currentTabColor.value },
    { label: '平均值', value: avg, color: '#64748b' },
    { label: '数据点', value: trends.length, color: '#6366f1' },
  ];
});
</script>

<style scoped>
.page-wrap {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.header-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #1a2e1f;
  margin-bottom: 8rpx;
}

.header-desc {
  font-size: 24rpx;
  color: #5f7267;
}

.metric-tabs {
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
}

.metric-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  border-radius: 14rpx;
  border: 2rpx solid #e5e7eb;
  background: #fff;
  font-size: 26rpx;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.metric-tab.active {
  background: var(--color);
  color: #fff;
  border-color: var(--color);
}

.tab-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.metric-tab.active .tab-dot {
  background: #fff;
}

.summary-row {
  display: flex;
  gap: 16rpx;
}

.summary-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.summary-label {
  font-size: 22rpx;
  color: #5f7267;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.summary-value {
  font-size: 32rpx;
  font-weight: 900;
}

.trend-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.trend-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 24rpx;
}

.trend-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
}

.trend-month {
  width: 100rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #5f7267;
  flex-shrink: 0;
}

.trend-bar-wrap {
  flex: 1;
  height: 12rpx;
  border-radius: 6rpx;
  background: #f1f5f9;
  overflow: hidden;
}

.trend-bar {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.trend-value {
  width: 60rpx;
  font-size: 26rpx;
  font-weight: 800;
  text-align: right;
  flex-shrink: 0;
}

.trend-change {
  width: 32rpx;
  font-size: 22rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.trend-change.up {
  color: #10b981;
}

.trend-change.down {
  color: #ef4444;
}
</style>
