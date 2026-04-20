<template>
  <view class="admin-nav-shell">
    <view class="admin-nav">
      <view
        v-for="item in items"
        :key="item.key"
        class="admin-nav-item"
        :class="{ active: current === item.key }"
        @click="go(item)"
      >
        <view class="admin-nav-icon">
          <text class="admin-nav-glyph">{{ item.glyph }}</text>
        </view>
        <view class="admin-nav-label">{{ item.label }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  current: {
    type: String,
    default: 'home'
  }
});

const items = [
  { key: 'home', label: '总览', glyph: '⌂', url: '/pages/admin/home/index' },
  { key: 'warnings', label: '风险', glyph: '!', url: '/pages/admin/warnings/index' },
  { key: 'profiles', label: '对比', glyph: '▥', url: '/pages/admin/profiles/index' },
  { key: 'models', label: '预测', glyph: '✦', url: '/pages/admin/models/index' },
  { key: 'settings', label: '设置', glyph: '⚙', url: '/pages/admin/settings/index' }
];

function go(item) {
  if (props.current === item.key) {
    return;
  }
  uni.redirectTo({ url: item.url });
}
</script>

<style scoped>
.admin-nav-shell {
  position: sticky;
  bottom: 0;
  z-index: 30;
  margin-top: auto;
  padding-top: 12rpx;
}

.admin-nav {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12rpx;
  padding: 14rpx 16rpx calc(14rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(18rpx);
  box-shadow: 0 -14rpx 34rpx rgba(15, 23, 42, 0.08);
  border-top: 2rpx solid rgba(59, 130, 246, 0.08);
}

.admin-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 8rpx;
  border-radius: 18rpx;
  color: #64748b;
}

.admin-nav-item.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(96, 165, 250, 0.08));
  color: #1d4ed8;
}

.admin-nav-icon {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #eff6ff;
}

.admin-nav-glyph {
  font-size: 28rpx;
  line-height: 1;
  font-weight: 800;
}

.admin-nav-item.active .admin-nav-icon {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #ffffff;
}

.admin-nav-label {
  font-size: 22rpx;
  font-weight: 700;
}
</style>
