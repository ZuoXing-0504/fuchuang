<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取账号与建议摘要...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">我的页面加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else>
      <view class="hero-card">
        <view class="card-title">{{ displayName }}</view>
        <view class="helper-copy">{{ displayStudentId }}</view>
        <view class="chip-row">
          <view class="chip">学生端</view>
          <view class="chip" v-if="tokenExpiryDate">到期：{{ tokenExpiryDate }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">账号信息</view>
        <view class="info-row">
          <view class="info-label">用户名</view>
          <view class="info-value">{{ displayUsername }}</view>
        </view>
        <view class="info-row">
          <view class="info-label">学号</view>
          <view class="info-value">{{ displayStudentId }}</view>
        </view>
        <view class="info-row">
          <view class="info-label">角色</view>
          <view class="info-value">{{ displayRole }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">建议摘要</view>
        <view v-if="recommendations.length">
          <view v-for="item in recommendations" :key="item.id" class="recommend-card">
            <view class="recommend-head">
              <view class="recommend-title">{{ item.title }}</view>
              <view class="recommend-priority">{{ priorityLabel(item.priority) }}</view>
            </view>
            <view class="muted">{{ item.description }}</view>
          </view>
        </view>
        <view v-else class="empty-text">当前暂无建议摘要。</view>
      </view>

      <button class="primary-btn" @click="handleLogout">退出登录</button>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCurrentUser, logout } from '../../../api/auth';
import { request } from '../../../common/request';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const user = ref(null);
const recommendations = ref([]);

const displayName = computed(() => {
  const current = user.value || {};
  return current.name || '当前学生';
});

const displayStudentId = computed(() => {
  const current = user.value || {};
  return current.studentId || current.username || '未获取到学号';
});

const tokenExpiryDate = computed(() => {
  const current = user.value || {};
  return current.tokenExpiresAt ? current.tokenExpiresAt.slice(0, 10) : '';
});

const displayUsername = computed(() => {
  const current = user.value || {};
  return current.username || '未提供';
});

const displayRole = computed(() => {
  const current = user.value || {};
  return current.role || 'student';
});

onShow(() => {
  if (!ensureRole('student')) {
    return;
  }
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [currentUser, recommendationResponse] = await Promise.all([
      getCurrentUser(),
      request('/api/student/recommendations')
    ]);
    user.value = currentUser;
    const recommendationData = recommendationResponse && recommendationResponse.data ? recommendationResponse.data : recommendationResponse;
    const recommendationList = recommendationData && recommendationData.recommendations ? recommendationData.recommendations : [];
    recommendations.value = recommendationList.slice(0, 4);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学生账号信息加载失败';
  } finally {
    loading.value = false;
  }
}

function handleLogout() {
  logout();
}

function priorityLabel(priority) {
  if (priority === 'high') return '高优先级';
  if (priority === 'low') return '低优先级';
  return '中优先级';
}
</script>

<style scoped>
.helper-copy {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.8;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eef1eb;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 26rpx;
  color: #68756d;
}

.info-value {
  font-size: 26rpx;
  color: #1a2e1f;
  font-weight: 700;
}

.recommend-card {
  padding: 18rpx;
  border-radius: 20rpx;
  background: #f8faf6;
  margin-top: 16rpx;
}

.recommend-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 10rpx;
}

.recommend-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.recommend-priority {
  font-size: 22rpx;
  color: #b45309;
  background: #fff7ed;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
}
</style>
