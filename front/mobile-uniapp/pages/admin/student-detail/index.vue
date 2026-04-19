<template>
  <view class="page-wrap">
    <view class="hero-card">
      <view class="card-title">学生简版详情</view>
      <view>学号：{{ studentId }}</view>
    </view>
    <view class="panel-card">
      <view class="metric-grid">
        <view class="metric-item"><view class="metric-label">姓名</view><view class="metric-value">林晨</view></view>
        <view class="metric-item"><view class="metric-label">风险等级</view><view class="metric-value">高风险</view></view>
        <view class="metric-item"><view class="metric-label">画像类别</view><view class="metric-value">自律待提升型</view></view>
        <view class="metric-item"><view class="metric-label">预测成绩</view><view class="metric-value">71.4</view></view>
      </view>
    </view>
    <view class="panel-card">
      <view class="card-title">干预建议</view>
      <view>优先从作息管理、作业督促和辅导员跟进三方面介入。</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const studentId = ref('');

onLoad((query) => {
  studentId.value = query.studentId || '';
});
</script>
