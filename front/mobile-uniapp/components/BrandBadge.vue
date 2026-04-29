<template>
  <image
    class="radar-logo"
    :class="{ compact }"
    src="/static/brand/zhixing-radar-app-icon.png"
    mode="aspectFit"
  />
</template>

<script setup>
defineProps({
  compact: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.radar-logo {
  width: 124rpx;
  height: 124rpx;
  border-radius: 28rpx;
  box-shadow: 0 18rpx 40rpx rgba(23, 119, 255, 0.22);
}

.radar-logo.compact {
  width: 84rpx;
  height: 84rpx;
  border-radius: 20rpx;
}
</style>
