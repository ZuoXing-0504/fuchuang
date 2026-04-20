<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在生成个性化报告...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">报告加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card">
        <view class="hero-eyebrow">个性化报告</view>
        <view class="card-title">{{ data.title }}</view>
        <view class="helper-copy">{{ data.summary }}</view>
        <view v-if="data.reportMeta" class="chip-row">
          <view class="chip">{{ data.reportMeta.studentName }}</view>
          <view class="chip">{{ data.reportMeta.profileCategory }}</view>
          <view class="chip">{{ data.reportMeta.riskLevel }}</view>
        </view>
      </view>

      <view class="metric-grid" v-if="scoreCards.length">
        <view v-for="item in scoreCards" :key="item.label" class="metric-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value">{{ item.score }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">报告正文</view>
        <view v-for="(item, index) in reportSections" :key="'section-' + index" class="list-card">
          <view class="section-item">
            <view class="section-index">{{ index + 1 }}</view>
            <view class="section-copy">{{ item }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card" v-if="evaluations.length">
        <view class="card-title">解释结论</view>
        <view v-for="(item, index) in evaluations" :key="'evaluation-' + index" class="list-card">
          <view class="section-item">
            <view class="section-index alt">{{ index + 1 }}</view>
            <view class="section-copy">{{ item }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card" v-if="suggestions.length">
        <view class="card-title">行动建议</view>
        <view v-for="(item, index) in suggestions" :key="'suggestion-' + index" class="suggestion-card">
          <view class="suggestion-index">{{ index + 1 }}</view>
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view class="panel-card" v-if="previewDetails.length">
        <view class="card-title">关键明细摘录</view>
        <view v-for="item in previewDetails" :key="item.label" class="detail-card">
          <view>
            <view class="detail-label">{{ item.label }}</view>
            <view class="muted">{{ item.note }}</view>
          </view>
          <view class="detail-value">{{ item.value }}</view>
        </view>
      </view>

      <view class="panel-card" v-if="predictionEvidence.length">
        <view class="card-title">预测依据</view>
        <view v-for="item in predictionEvidence" :key="item.label" class="evidence-card">
          <view class="evidence-head">
            <view class="detail-label">{{ item.label }}</view>
            <view class="evidence-effect">{{ item.effect }}</view>
          </view>
          <view class="detail-value compact">{{ item.value }}</view>
          <view class="muted">{{ item.reason }}</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { ensureRole } from '../../../common/session';
import { getStudentReport } from '../../../api/student';

const loading = ref(true);
const error = ref('');
const data = ref(null);

const scoreCards = computed(() => {
  const current = data.value || {};
  return current.scoreCards || [];
});

const reportSections = computed(() => {
  const current = data.value || {};
  return current.sections || [];
});

const evaluations = computed(() => {
  const current = data.value || {};
  return current.evaluations || [];
});

const suggestions = computed(() => {
  const current = data.value || {};
  return current.suggestions || [];
});

const predictionEvidence = computed(() => {
  const current = data.value || {};
  return (current.predictionEvidence || []).slice(0, 4);
});

const previewDetails = computed(() => {
  if (!data.value) {
    return [];
  }
  return [...(data.value.behaviorDetails || []).slice(0, 3), ...(data.value.academicDetails || []).slice(0, 3)];
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
    data.value = await getStudentReport();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学生报告加载失败';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.hero-eyebrow,
.helper-copy {
  font-size: 22rpx;
}

.helper-copy {
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.section-item,
.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.section-index,
.suggestion-index {
  width: 44rpx;
  height: 44rpx;
  border-radius: 14rpx;
  background: #2d7a4f;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.section-index.alt {
  background: #2563eb;
}

.section-copy {
  font-size: 26rpx;
  line-height: 1.8;
  color: #223127;
}

.suggestion-card {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eef1eb;
}

.suggestion-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-card,
.evidence-card {
  padding: 18rpx;
  border-radius: 20rpx;
  background: #f8faf6;
  margin-top: 14rpx;
}

.detail-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-label {
  font-size: 26rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 6rpx;
}

.detail-value {
  font-size: 28rpx;
  font-weight: 800;
  color: #2d7a4f;
}

.detail-value.compact {
  margin: 8rpx 0;
}

.evidence-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.evidence-effect {
  font-size: 22rpx;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
}
</style>
