<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取完整报告...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">完整报告加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="detail">
      <view class="hero-card">
        <view class="hero-eyebrow">完整报告</view>
        <view class="card-title">{{ detail.reportTitle }}</view>
        <view class="helper-copy">{{ detail.reportSummary }}</view>
        <view class="chip-row">
          <view class="chip">{{ detail.name || detail.studentId }}</view>
          <view class="chip">{{ detail.riskLevel }}</view>
          <view class="chip">{{ detail.profileCategory }}</view>
        </view>
      </view>

      <view class="panel-card" v-if="reportSections.length">
        <view class="card-title">报告正文</view>
        <view v-for="(item, index) in reportSections" :key="'section-' + index" class="list-card">
          <view class="section-item">
            <view class="section-index">{{ index + 1 }}</view>
            <view class="section-copy">{{ item }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card" v-if="reportEvaluations.length">
        <view class="card-title">解释结论</view>
        <view v-for="(item, index) in reportEvaluations" :key="'evaluation-' + index" class="suggestion-card">
          <view class="section-index alt">{{ index + 1 }}</view>
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view class="panel-card" v-if="interventions.length">
        <view class="card-title">干预建议</view>
        <view v-for="(item, index) in interventions" :key="'intervention-' + index" class="suggestion-card">
          <view class="section-index success">{{ index + 1 }}</view>
          <view class="section-copy">{{ item }}</view>
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
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getStudentDetail } from '../../../api/admin';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const studentId = ref('');
const detail = ref(null);

const reportSections = computed(() => {
  const current = detail.value || {};
  return current.reportSections || [];
});

const reportEvaluations = computed(() => {
  const current = detail.value || {};
  return current.reportEvaluations || [];
});

const interventions = computed(() => {
  const current = detail.value || {};
  return current.interventions || [];
});

const predictionEvidence = computed(() => {
  const current = detail.value || {};
  return (current.predictionEvidence || []).slice(0, 6);
});

onLoad((query) => {
  studentId.value = query.studentId || '';
});

onShow(() => {
  if (!ensureRole('admin')) {
    return;
  }
  loadData();
});

async function loadData() {
  if (!studentId.value) {
    error.value = '缺少 studentId 参数';
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    detail.value = await getStudentDetail(studentId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '完整报告加载失败';
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

.section-index {
  width: 44rpx;
  height: 44rpx;
  border-radius: 14rpx;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.section-index.alt {
  background: #1d4ed8;
}

.section-index.success {
  background: #2d7a4f;
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

.evidence-card {
  padding: 18rpx;
  border-radius: 20rpx;
  background: #f8faf6;
  margin-top: 16rpx;
}

.evidence-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-label {
  font-size: 26rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.evidence-effect {
  font-size: 22rpx;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
}

.detail-value {
  font-size: 28rpx;
  font-weight: 800;
  color: #2d7a4f;
}

.detail-value.compact {
  margin: 8rpx 0;
}
</style>
