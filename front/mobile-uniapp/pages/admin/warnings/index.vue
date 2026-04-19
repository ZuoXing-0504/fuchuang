<template>
  <view class="page-wrap">
    <view class="panel-card">
      <view class="card-title">风险名单</view>
      <view v-for="item in data.warnings" :key="item.studentId" class="metric-item" style="margin-bottom: 16rpx;" @click="openDetail(item.studentId)">
        <view>{{ item.name }} · {{ item.riskLevel }}</view>
        <view class="muted">{{ item.studentId }} · {{ item.college }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { adminOverview } from '../../../mock/data';

const data = adminOverview;

function openDetail(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${studentId}` });
}
</script>
