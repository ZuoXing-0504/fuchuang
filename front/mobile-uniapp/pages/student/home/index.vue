<template>
  <view class="page-wrap">
    <view class="hero-card">
      <view class="hero-top">
        <view class="hero-avatar">{{ data.profileCategory?.charAt(0) ?? '学' }}</view>
        <view class="hero-info">
          <view class="hero-name">{{ data.name }} 的首页</view>
          <view class="hero-tag" :style="{ background: riskBg(data.riskLevel), color: riskColor(data.riskLevel) }">{{ data.riskLevel }}</view>
        </view>
      </view>
      <view class="hero-category">
        <view class="cat-label">画像类型</view>
        <view class="cat-value" :style="{ color: catColor(data.profileCategory) }">{{ data.profileCategory }}</view>
      </view>
    </view>

    <view class="metric-grid">
      <view class="metric-card" v-for="item in metrics" :key="item.label" :style="{ background: item.bg }">
        <view class="metric-icon" :style="{ background: item.color }">{{ item.icon }}</view>
        <view class="metric-label">{{ item.label }}</view>
        <view class="metric-value" :style="{ color: item.color }">{{ item.value }}</view>
        <view class="metric-bar">
          <view class="metric-bar-fill" :style="{ background: item.color, width: item.barWidth }"></view>
        </view>
      </view>
    </view>

    <view class="insight-card">
      <view class="insight-title">成长洞察</view>
      <view class="insight-item" v-for="(tip, i) in insights" :key="i">
        <view class="insight-dot" :style="{ background: ['#2d7a4f', '#ef4444', '#f59e0b', '#3b82f6'][i] }"></view>
        <view class="insight-text">{{ tip }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { studentHome as data } from '../../../mock/data';

const riskColor = (level) => ({ '高风险': '#ef4444', '中风险': '#f59e0b', '低风险': '#10b981' }[level] ?? '#64748b');
const riskBg = (level) => ({ '高风险': '#fef2f2', '中风险': '#fffbeb', '低风险': '#ecfdf5' }[level] ?? '#f1f5f9');
const catColor = (cat) => ({ '全面领先型': '#10b981', '潜力发展型': '#3b82f6', '波动预警型': '#f59e0b', '自律待提升型': '#ef4444' }[cat] ?? '#64748b');

const metrics = [
  { label: '预测成绩', value: data.scorePrediction, icon: '◆', color: '#2d7a4f', bg: '#f0fdf4', barWidth: '72%' },
  { label: '健康档次', value: data.healthLevel, icon: '♥', color: '#3b82f6', bg: '#eff6ff', barWidth: '58%' },
  { label: '奖学金概率', value: data.scholarshipProbability, icon: '★', color: '#d4a32a', bg: '#fffbeb', barWidth: '22%' },
  { label: '风险等级', value: data.riskLevel, icon: '⚠', color: riskColor(data.riskLevel), bg: riskBg(data.riskLevel), barWidth: '40%' },
];

const insights = [
  '学习投入指数近4周呈下降趋势',
  '风险指数持续上升需关注',
  '健康档次维持中等水平',
  '奖学金概率有提升空间',
];
</script>

<style scoped>
.page-wrap {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.hero-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.hero-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #2d7a4f, #3b9464);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 900;
  box-shadow: 0 8rpx 24rpx rgba(45, 122, 79, 0.3);
}

.hero-info {
  flex: 1;
}

.hero-name {
  font-size: 34rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 8rpx;
}

.hero-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.hero-category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #f8faf6;
  border-radius: 16rpx;
}

.cat-label {
  font-size: 26rpx;
  color: #5f7267;
  font-weight: 600;
}

.cat-value {
  font-size: 28rpx;
  font-weight: 800;
}

.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.metric-card {
  padding: 28rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.metric-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.metric-label {
  font-size: 22rpx;
  color: #5f7267;
  font-weight: 600;
}

.metric-value {
  font-size: 32rpx;
  font-weight: 900;
}

.metric-bar {
  height: 6rpx;
  border-radius: 3rpx;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-top: 8rpx;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 3rpx;
}

.insight-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.insight-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 24rpx;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f4ed;
}

.insight-item:last-child {
  border-bottom: none;
}

.insight-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-top: 10rpx;
  flex-shrink: 0;
}

.insight-text {
  font-size: 26rpx;
  color: #5f7267;
  line-height: 1.6;
}
</style>
