<template>
  <view class="page-wrap">
    <view class="profile-hero">
      <view class="hero-avatar">画</view>
      <view class="hero-info">
        <view class="hero-type">自律待提升型</view>
        <view class="hero-desc">自律性不足，需加强管理</view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">优势与短板</view>
      <view class="sw-block good">
        <view class="sw-header">✦ 优势领域</view>
        <view class="sw-item">
          <view class="sw-dot good"></view>
          <text>基础能力尚可，有学习回升空间</text>
        </view>
      </view>
      <view class="sw-block warn">
        <view class="sw-header">✦ 待提升领域</view>
        <view class="sw-item">
          <view class="sw-dot warn"></view>
          <text>夜间活跃偏多，作业完成稳定性不足</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">干预建议</view>
      <view class="suggestion-item" v-for="(item, i) in suggestions" :key="i">
        <view class="suggestion-num" :style="{ background: ['#2d7a4f', '#3b82f6', '#d4a32a', '#6366f1'][i] }">{{ i + 1 }}</view>
        <view class="suggestion-text">{{ item }}</view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">群体画像说明</view>
      <view class="desc-text">该类型学生通常在学业和综合发展方面表现波动，自律性不足导致学习节奏不规律。建议从作息管理、目标设定和同伴互助三方面入手，逐步建立正反馈循环。</view>
    </view>
  </view>
</template>

<script setup>
const suggestions = [
  '制定个性化学习计划，设定每日小目标',
  '增加规律运动频次，改善睡眠质量',
  '参与社团活动提升社交活跃度',
  '调整作息减少深夜上网时间',
];
</script>

<style scoped>
.page-wrap {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.profile-hero {
  background: #fff;
  border-radius: 28rpx;
  padding: 36rpx;
  display: flex;
  align-items: center;
  gap: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.hero-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #ef4444, #f59e0b);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 900;
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
}

.hero-info {
  flex: 1;
}

.hero-type {
  font-size: 34rpx;
  font-weight: 900;
  color: #ef4444;
  margin-bottom: 8rpx;
}

.hero-desc {
  font-size: 26rpx;
  color: #5f7267;
}

.section-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 24rpx;
}

.sw-block {
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.sw-block.good {
  background: #f0fdf4;
}

.sw-block.warn {
  background: #fffbeb;
}

.sw-header {
  font-weight: 700;
  font-size: 26rpx;
  margin-bottom: 12rpx;
}

.sw-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  font-size: 26rpx;
  color: #5f7267;
  line-height: 1.6;
}

.sw-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-top: 14rpx;
  flex-shrink: 0;
}

.sw-dot.good {
  background: #10b981;
}

.sw-dot.warn {
  background: #f59e0b;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f8faf6;
  border-radius: 14rpx;
  margin-bottom: 12rpx;
}

.suggestion-num {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 22rpx;
  flex-shrink: 0;
}

.suggestion-text {
  font-size: 26rpx;
  color: #1a2e1f;
  line-height: 1.6;
}

.desc-text {
  font-size: 26rpx;
  color: #5f7267;
  line-height: 1.8;
}
</style>
