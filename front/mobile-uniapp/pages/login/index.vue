<template>
  <view class="login-page">
    <view class="login-bg">
      <view class="bg-circle c1"></view>
      <view class="bg-circle c2"></view>
    </view>
    <view class="login-container">
      <view class="brand-section">
        <view class="brand-icon">◎</view>
        <view class="brand-title">学生行为画像</view>
        <view class="brand-subtitle">Student Behavior Portrait</view>
      </view>
      <view class="role-section">
        <view class="role-label">选择角色进入演示</view>
        <view class="role-cards">
          <view class="role-card student" @click="go('student')">
            <view class="role-icon">🎓</view>
            <view class="role-name">学生端</view>
            <view class="role-desc">查看个人画像与建议</view>
          </view>
          <view class="role-card admin" @click="go('admin')">
            <view class="role-icon">🔧</view>
            <view class="role-name">管理员端</view>
            <view class="role-desc">监控与预警管理</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { loginByRole } from '../../api/auth';

function go(role) {
  loginByRole(role);
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f0fdf4, #f8faf6);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
}

.c1 {
  width: 500rpx;
  height: 500rpx;
  background: rgba(45, 122, 79, 0.06);
  top: -200rpx;
  left: -100rpx;
}

.c2 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(212, 163, 42, 0.05);
  bottom: -100rpx;
  right: -100rpx;
}

.login-container {
  position: relative;
  padding: 120rpx 48rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 100rpx;
}

.brand-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #2d7a4f, #3b9464);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 52rpx;
  font-weight: 900;
  margin-bottom: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(45, 122, 79, 0.3);
}

.brand-title {
  font-size: 44rpx;
  font-weight: 900;
  color: #1a2e1f;
  margin-bottom: 12rpx;
}

.brand-subtitle {
  font-size: 24rpx;
  color: #5f7267;
  letter-spacing: 1rpx;
}

.role-section {
  width: 100%;
}

.role-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #5f7267;
  text-align: center;
  margin-bottom: 40rpx;
}

.role-cards {
  display: flex;
  gap: 28rpx;
}

.role-card {
  flex: 1;
  padding: 48rpx 32rpx;
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  transition: all 0.3s ease;
}

.role-card.student {
  background: #f0fdf4;
  border: 2rpx solid rgba(45, 122, 79, 0.15);
}

.role-card.admin {
  background: #eff6ff;
  border: 2rpx solid rgba(59, 130, 246, 0.15);
}

.role-card:active {
  transform: scale(0.97);
}

.role-icon {
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.role-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.role-desc {
  font-size: 22rpx;
  color: #5f7267;
}
</style>
