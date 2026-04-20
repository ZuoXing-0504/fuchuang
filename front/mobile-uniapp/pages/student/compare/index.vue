<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步群体对比数据...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card">
        <view>
          <view class="hero-eyebrow">群体对比</view>
          <view class="card-title">{{ data.studentName || data.studentId || '当前学生' }}</view>
          <view class="hero-copy">把你的个体表现放到所属群体和全样本中对照，帮助理解你当前所处的位置和更值得优先关注的方向。</view>
        </view>
        <view class="chip-row top-gap">
          <view class="chip">本人</view>
          <view class="chip">{{ data.clusterLabel }}</view>
          <view class="chip">{{ data.overallLabel }}</view>
        </view>
      </view>

      <view v-if="data.rankingCards.length" class="metric-grid">
        <view v-for="item in data.rankingCards" :key="item.label" class="metric-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value">{{ item.value }}<text class="metric-suffix">{{ item.suffix }}</text></view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">多维指标对照</view>
        <view v-for="metric in data.compareMetrics" :key="metric.label" class="compare-row">
          <view class="compare-title-row">
            <view class="row-title">{{ metric.label }}</view>
            <view class="score-pill">本人 {{ metric.selfScore }}</view>
          </view>
          <view class="bar-group">
            <view class="bar-meta"><text class="dot self"></text>本人 {{ metric.selfScore }}</view>
            <view class="bar-track"><view class="bar-fill self" :style="{ width: `${metric.selfScore}%` }"></view></view>
          </view>
          <view class="bar-group">
            <view class="bar-meta"><text class="dot cluster"></text>群体 {{ metric.clusterScore }}</view>
            <view class="bar-track"><view class="bar-fill cluster" :style="{ width: `${metric.clusterScore}%` }"></view></view>
          </view>
          <view class="bar-group">
            <view class="bar-meta"><text class="dot overall"></text>全样本 {{ metric.overallScore }}</view>
            <view class="bar-track"><view class="bar-fill overall" :style="{ width: `${metric.overallScore}%` }"></view></view>
          </view>
        </view>
      </view>

      <view v-if="data.clusterTraits.length" class="panel-card">
        <view class="card-title">所属群体特征</view>
        <view class="trait-list">
          <view v-for="item in data.clusterTraits" :key="item" class="trait-item">{{ item }}</view>
        </view>
      </view>

      <view v-if="data.explanations.length" class="panel-card">
        <view class="card-title">对比解释</view>
        <view v-for="(item, index) in data.explanations" :key="`${index}-${item}`" class="explain-item">
          <view class="explain-index">{{ index + 1 }}</view>
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getStudentCompare } from '../../../api/student';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const data = ref(null);

onShow(() => {
  if (!ensureRole('student')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getStudentCompare();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '群体对比加载失败';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.hero-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  opacity: 0.92;
  margin-bottom: 8rpx;
}

.hero-copy,
.section-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.section-copy {
  color: #475569;
}

.top-gap {
  margin-top: 14rpx;
}

.metric-suffix {
  font-size: 22rpx;
  margin-left: 6rpx;
}

.compare-row {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e8eef7;
}

.compare-row:last-child {
  border-bottom: none;
}

.compare-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 14rpx;
}

.row-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #0f172a;
}

.score-pill {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(22, 119, 255, 0.12);
  color: #1677ff;
  font-size: 22rpx;
  font-weight: 700;
}

.bar-group {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 10rpx;
}

.bar-meta {
  font-size: 22rpx;
  color: #64748b;
}

.dot {
  display: inline-block;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.dot.self,
.bar-fill.self {
  background: #1677ff;
}

.dot.cluster,
.bar-fill.cluster {
  background: #69b1ff;
}

.dot.overall,
.bar-fill.overall {
  background: #18a058;
}

.bar-track {
  height: 12rpx;
  border-radius: 999rpx;
  background: #e7eef8;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999rpx;
}

.trait-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.trait-item,
.explain-item {
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(148, 163, 184, 0.12);
}

.explain-item {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
}

.explain-index {
  width: 42rpx;
  height: 42rpx;
  border-radius: 14rpx;
  background: rgba(22, 119, 255, 0.12);
  color: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}
</style>
