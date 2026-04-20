<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取画像和解释信息...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">画像加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card">
        <view class="card-title">{{ data.profileCategory }}</view>
        <view class="hero-subtype" v-if="data.profileSubtype">{{ data.profileSubtype }}</view>
        <view class="helper-copy">{{ data.profileExplanation || data.description }}</view>
        <view class="chip-row">
          <view class="chip">{{ data.riskLevel }}</view>
          <view class="chip">{{ data.healthLevel }}</view>
          <view class="chip">奖学金概率 {{ probabilityText }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">画像亮点</view>
        <view class="chip-row">
          <view v-for="item in data.profileHighlights" :key="item" class="tag-chip">{{ item }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">优势与待提升</view>
        <view class="section-block good">
          <view class="section-label">优势领域</view>
          <view v-for="item in data.strengths" :key="item" class="list-card">
            <view class="muted emphasis">{{ item }}</view>
          </view>
        </view>
        <view class="section-block warn">
          <view class="section-label">待提升领域</view>
          <view v-for="item in data.weaknesses" :key="item" class="list-card">
            <view class="muted emphasis">{{ item }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">多维雷达拆解</view>
        <view v-for="item in data.radar" :key="item.indicator" class="radar-item">
          <view class="radar-head">
            <view class="radar-label">{{ item.indicator }}</view>
            <view class="radar-value">{{ item.value.toFixed(1) }}</view>
          </view>
          <view class="radar-track">
            <view class="radar-fill" :style="{ width: radarWidth(item.value) }"></view>
          </view>
        </view>
      </view>

      <view class="panel-card" v-if="riskDrivers.length">
        <view class="card-title">优先干预建议</view>
        <view v-for="item in riskDrivers" :key="item.id" class="driver-card">
          <view class="driver-head">
            <view class="driver-title">{{ item.title }}</view>
            <view class="driver-priority">{{ priorityLabel(item.priority) }}</view>
          </view>
          <view class="muted">{{ item.description }}</view>
          <view class="helper-text" v-if="item.reason">{{ item.reason }}</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { ensureRole } from '../../../common/session';
import { getStudentProfile } from '../../../api/student';

const loading = ref(true);
const error = ref('');
const data = ref(null);

const probabilityText = computed(() => {
  const current = data.value || {};
  return ((Number(current.scholarshipProbability) || 0) * 100).toFixed(1) + '%';
});

const riskDrivers = computed(() => {
  const current = data.value || {};
  return current.riskDrivers || [];
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
    data.value = await getStudentProfile();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学生画像加载失败';
  } finally {
    loading.value = false;
  }
}

function priorityLabel(priority) {
  if (priority === 'high') return '高优先级';
  if (priority === 'low') return '低优先级';
  return '中优先级';
}

function radarWidth(value) {
  return Math.max(Math.min(Number(value) || 0, 100), 4) + '%';
}
</script>

<style scoped>
.hero-subtype {
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.helper-copy {
  font-size: 26rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.section-block {
  padding: 24rpx;
  border-radius: 20rpx;
  margin-top: 18rpx;
}

.section-block.good {
  background: #f0fdf4;
}

.section-block.warn {
  background: #fffbeb;
}

.section-label {
  font-size: 26rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 12rpx;
}

.emphasis {
  color: #1a2e1f;
  font-weight: 700;
}

.radar-item {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eef1eb;
}

.radar-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.radar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.radar-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #1a2e1f;
}

.radar-value {
  font-size: 24rpx;
  color: #2d7a4f;
  font-weight: 800;
}

.radar-track {
  height: 12rpx;
  border-radius: 999rpx;
  background: #e5efe6;
  overflow: hidden;
}

.radar-fill {
  height: 100%;
  background: linear-gradient(135deg, #2d7a4f, #3b9464);
  border-radius: 999rpx;
}

.driver-card {
  padding: 20rpx;
  border-radius: 20rpx;
  background: #f8faf6;
  margin-top: 16rpx;
}

.driver-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.driver-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.driver-priority {
  font-size: 22rpx;
  color: #b45309;
  background: #fff7ed;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
}
</style>
