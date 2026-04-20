<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步趋势与群体对比数据...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else>
      <view class="panel-card">
        <view class="card-title">趋势观察</view>
        <scroll-view class="metric-tabs" scroll-x>
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="metric-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </view>
        </scroll-view>

        <view v-if="!currentTrend.length" class="empty-text">当前没有可展示的趋势数据。</view>
        <view v-for="item in currentTrend" :key="item.month" class="trend-item">
          <view class="trend-head">
            <view class="trend-month">{{ item.month }}</view>
            <view class="trend-value">{{ item.value.toFixed(1) }}</view>
          </view>
          <view class="bar-track">
            <view class="bar-fill" :style="{ width: widthText(item.value), background: currentTab.color }"></view>
          </view>
        </view>
      </view>

      <view v-if="compare" class="panel-card">
        <view class="card-title">群体差异</view>
        <view class="helper-text">{{ compare.clusterLabel }} · {{ compare.overallLabel }}</view>
        <view v-for="item in compare.compareMetrics" :key="item.label" class="compare-card">
          <view class="row-title">{{ item.label }}</view>
          <view class="muted">本人 {{ item.selfScore }} · 同类 {{ item.clusterScore }} · 全样本 {{ item.overallScore }}</view>
        </view>
      </view>

      <view v-if="compare && compare.clusterTraits.length" class="panel-card">
        <view class="card-title">同类群体特征</view>
        <view class="chip-row">
          <view v-for="item in compare.clusterTraits" :key="item" class="tag-chip">{{ item }}</view>
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
  { key: 'risk', label: '风险变化', color: '#ef4444' },
  { key: 'health', label: '健康变化', color: '#3b82f6' },
  { key: 'score', label: '成绩变化', color: '#d4a32a' }
];

const currentTab = computed(() => tabs.find((item) => item.key === activeTab.value) || tabs[0]);
const currentTrend = computed(() => {
  const source = trends.value || {};
  return source[`${activeTab.value}Trend`] || [];
});

onShow(() => {
  if (!ensureRole('student')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [trendResult, compareResult] = await Promise.all([getStudentTrends(), getStudentCompare()]);
    trends.value = trendResult;
    compare.value = compareResult;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '趋势数据加载失败';
  } finally {
    loading.value = false;
  }
}

function widthText(value) {
  return `${Math.max(Math.min(Number(value) || 0, 100), 4)}%`;
}
</script>

<style scoped>
.metric-tabs {
  white-space: nowrap;
  margin-bottom: 18rpx;
}

.metric-tab {
  display: inline-flex;
  margin-right: 12rpx;
  padding: 14rpx 22rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 2rpx solid #e4ece2;
  color: #68756d;
  font-size: 24rpx;
  font-weight: 700;
}

.metric-tab.active {
  background: #2d7a4f;
  color: #ffffff;
  border-color: transparent;
}

.trend-item,
.compare-card {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eef1eb;
}

.trend-item:last-child,
.compare-card:last-child {
  border-bottom: none;
}

.trend-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.trend-month,
.trend-value,
.row-title {
  font-size: 26rpx;
  color: #223127;
}

.row-title,
.trend-value {
  font-weight: 800;
}

.bar-track {
  height: 12rpx;
  background: #e5efe6;
  border-radius: 999rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999rpx;
}
</style>
