<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步完整报告...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="detail">
      <view class="hero-card report-hero">
        <view class="hero-orb"></view>
        <view class="hero-eyebrow">完整报告</view>
        <view class="card-title">{{ detail.reportTitle }}</view>
        <view class="hero-copy">{{ detail.reportSummary }}</view>
      </view>

      <view class="panel-card">
        <view class="card-title">对象信息</view>
        <view class="detail-row"><text class="detail-label">学生</text><text class="detail-value">{{ detail.name || detail.studentId }}</text></view>
        <view class="detail-row"><text class="detail-label">学院</text><text class="detail-value">{{ detail.college }}</text></view>
        <view class="detail-row"><text class="detail-label">专业</text><text class="detail-value">{{ detail.major }}</text></view>
        <view class="detail-row"><text class="detail-label">风险等级</text><text class="detail-value">{{ detail.riskLevel }}</text></view>
      </view>

      <view v-if="detail.reportSections.length" class="panel-card">
        <view class="card-title">报告正文</view>
        <view v-for="(item, index) in detail.reportSections" :key="`section-${index}`" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view v-if="detail.reportEvaluations.length" class="panel-card">
        <view class="card-title">评估结论</view>
        <view v-for="(item, index) in detail.reportEvaluations" :key="`evaluation-${index}`" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view v-if="detail.interventions.length" class="panel-card">
        <view class="card-title">干预建议</view>
        <view v-for="(item, index) in detail.interventions" :key="`intervention-${index}`" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view v-if="detail.predictionSteps.length" class="panel-card">
        <view class="card-title">预测解释</view>
        <view v-for="step in detail.predictionSteps" :key="step.title" class="result-section">
          <view class="sub-title">{{ step.title }}</view>
          <view class="section-copy">{{ step.summary }}</view>
          <view v-if="step.items.length" class="chip-row top-gap">
            <view v-for="item in step.items" :key="`${step.title}-${item}`" class="tag-chip">{{ item }}</view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getStudentDetail } from '../../../api/admin';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const studentId = ref('');
const detail = ref(null);

onLoad((query) => {
  studentId.value = query.studentId || '';
});

onShow(() => {
  if (!ensureRole('admin')) return;
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
.report-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 86% 18%, rgba(199, 236, 255, 0.82), transparent 22%),
    linear-gradient(180deg, rgba(135, 198, 255, 0.78) 0%, rgba(214, 240, 255, 0.72) 52%, rgba(246, 251, 255, 0.84) 100%);
  color: #14233b;
}

.hero-orb {
  position: absolute;
  right: -18rpx;
  top: -40rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.76), rgba(122, 210, 255, 0.16) 62%, transparent 72%);
}

.hero-eyebrow {
  position: relative;
  z-index: 1;
  font-size: 22rpx;
  font-weight: 700;
  color: #4b6b92;
  margin-bottom: 8rpx;
}

.hero-copy {
  position: relative;
  z-index: 1;
  font-size: 24rpx;
  line-height: 1.8;
  color: #4f6784;
}

.section-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: #334155;
}

.top-gap {
  margin-top: 14rpx;
}

.sub-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #13223a;
  margin-bottom: 10rpx;
}

.result-section + .result-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(223, 232, 244, 0.92);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid rgba(223, 232, 244, 0.92);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 24rpx;
  color: #738399;
}

.detail-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #13223a;
  text-align: right;
}
</style>
