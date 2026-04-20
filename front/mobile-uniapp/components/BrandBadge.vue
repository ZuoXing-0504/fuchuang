<template>
  <view class="radar-logo" :class="{ compact }">
    <view class="logo-surface"></view>
    <view class="logo-ring ring-a"></view>
    <view class="logo-ring ring-b"></view>
    <view class="logo-ring ring-c"></view>
    <view class="logo-sweep"></view>
    <view class="logo-dot"></view>
    <view class="logo-book left"></view>
    <view class="logo-book right"></view>
    <view class="logo-book spine"></view>
  </view>
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
  position: relative;
  width: 124rpx;
  height: 124rpx;
  border-radius: 36rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #42b1ff 0%, #1777ff 58%, #1f40c6 100%);
  box-shadow: 0 18rpx 40rpx rgba(23, 119, 255, 0.28);
}

.radar-logo.compact {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
}

.logo-surface {
  position: absolute;
  inset: 10rpx;
  border-radius: 28rpx 28rpx 34rpx 34rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.05));
}

.radar-logo.compact .logo-surface {
  inset: 8rpx;
  border-radius: 18rpx 18rpx 24rpx 24rpx;
}

.logo-ring {
  position: absolute;
  left: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.9);
  border-bottom-color: transparent;
  border-left-color: transparent;
  border-radius: 999rpx;
  transform: translateX(-50%) rotate(-17deg);
}

.ring-a {
  top: 22rpx;
  width: 48rpx;
  height: 48rpx;
}

.ring-b {
  top: 14rpx;
  width: 66rpx;
  height: 66rpx;
  opacity: 0.8;
}

.ring-c {
  top: 6rpx;
  width: 82rpx;
  height: 82rpx;
  opacity: 0.56;
}

.radar-logo.compact .ring-a {
  top: 14rpx;
  width: 32rpx;
  height: 32rpx;
}

.radar-logo.compact .ring-b {
  top: 9rpx;
  width: 42rpx;
  height: 42rpx;
}

.radar-logo.compact .ring-c {
  top: 4rpx;
  width: 54rpx;
  height: 54rpx;
}

.logo-sweep {
  position: absolute;
  top: 44rpx;
  left: 50%;
  width: 4rpx;
  height: 34rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), #ffffff);
  transform: translateX(-50%) rotate(50deg);
  transform-origin: top center;
}

.radar-logo.compact .logo-sweep {
  top: 30rpx;
  height: 22rpx;
}

.logo-dot {
  position: absolute;
  top: 32rpx;
  right: 22rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #dff4ff;
  box-shadow: 0 0 0 6rpx rgba(223, 244, 255, 0.2);
}

.radar-logo.compact .logo-dot {
  top: 21rpx;
  right: 14rpx;
  width: 8rpx;
  height: 8rpx;
}

.logo-book {
  position: absolute;
  bottom: 18rpx;
  width: 34rpx;
  height: 24rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(223, 240, 255, 0.84));
}

.logo-book.left {
  left: 22rpx;
  border-radius: 10rpx 4rpx 16rpx 18rpx;
  transform: skewY(10deg);
}

.logo-book.right {
  right: 22rpx;
  border-radius: 4rpx 10rpx 18rpx 16rpx;
  transform: skewY(-10deg);
}

.logo-book.spine {
  left: 50%;
  width: 12rpx;
  height: 28rpx;
  bottom: 16rpx;
  border-radius: 8rpx;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #e6f5ff, #8fd0ff);
}

.radar-logo.compact .logo-book {
  bottom: 12rpx;
  width: 24rpx;
  height: 16rpx;
}

.radar-logo.compact .logo-book.left {
  left: 14rpx;
  border-radius: 8rpx 4rpx 12rpx 12rpx;
}

.radar-logo.compact .logo-book.right {
  right: 14rpx;
  border-radius: 4rpx 8rpx 12rpx 12rpx;
}

.radar-logo.compact .logo-book.spine {
  width: 8rpx;
  height: 18rpx;
  bottom: 11rpx;
}
</style>
