<template>
  <view class="page-wrap">
    <view class="panel-card">
      <view class="card-title">我的</view>
      <view v-for="group in groups" :key="group.category" style="margin-bottom: 24rpx;">
        <view style="font-weight: 700;">{{ group.category }}</view>
        <view v-for="item in group.items" :key="item" class="muted" style="margin-top: 8rpx;">{{ item }}</view>
      </view>
      <button @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { recommendationGroups as groups } from '../../../mock/data';

function logout() {
  uni.clearStorageSync();
  uni.reLaunch({ url: '/pages/login/index' });
}
</script>
