<template>
  <view class="page-wrap">
    <view class="hero-card">
      <view class="card-title">管理员首页</view>
      <view>移动端保留演示核心链路：首页 -> 风险名单 -> 学生简版详情。</view>
    </view>
    <view class="metric-grid">
      <view class="metric-item" v-for="item in data.kpis" :key="item.label">
        <view class="metric-label">{{ item.label }}</view>
        <view class="metric-value">{{ item.value }}</view>
      </view>
    </view>
    <view class="panel-card">
      <view class="card-title">重点预警</view>
      <view v-for="item in data.warnings" :key="item.studentId" style="padding: 16rpx 0; border-bottom: 1rpx solid #eef1eb;">
        <view>{{ item.name }} · {{ item.riskLevel }}</view>
        <view class="muted">{{ item.college }}</view>
      </view>
      <button style="margin-top: 16rpx;" @click="jumpWarnings">查看风险名单</button>
    </view>
  </view>
</template>

<script setup>
import { adminOverview } from '../../../mock/data';

const data = adminOverview;

function jumpWarnings() {
  uni.navigateTo({ url: '/pages/admin/warnings/index' });
}
</script>
