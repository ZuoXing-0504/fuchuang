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
          <svg viewBox="0 0 24 24" fill="none">
            <path
              v-for="segment in navIconPaths[item.icon]"
              :key="segment"
              :d="segment"
            />
          </svg>
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
  { key: 'home', label: '总览', icon: 'home', url: '/pages/admin/home/index' },
  { key: 'warnings', label: '风险', icon: 'warning', url: '/pages/admin/warnings/index' },
  { key: 'profiles', label: '对比', icon: 'compare', url: '/pages/admin/profiles/index' },
  { key: 'models', label: '预测', icon: 'models', url: '/pages/admin/models/index' },
  { key: 'settings', label: '设置', icon: 'settings', url: '/pages/admin/settings/index' }
];

const navIconPaths = {
  home: ['M4 10.5 12 4l8 6.5', 'M6.5 9.5V20h11V9.5', 'M10 20v-5h4v5'],
  warning: ['M12 4 20 18H4L12 4Z', 'M12 9v4', 'M12 16h.01'],
  compare: ['M6 6h5v12H6z', 'M13 9h5v9h-5z'],
  models: ['M5 17l4-4 3 3 7-7', 'M16 9h3v3'],
  settings: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M12 3v2.2', 'M12 18.8V21', 'M4.9 4.9l1.6 1.6', 'M17.5 17.5l1.6 1.6', 'M3 12h2.2', 'M18.8 12H21', 'M4.9 19.1l1.6-1.6', 'M17.5 6.5l1.6-1.6']
};

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

.admin-nav-icon svg {
  width: 30rpx;
  height: 30rpx;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
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
