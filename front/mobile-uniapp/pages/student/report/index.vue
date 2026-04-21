<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步个性化报告内容...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card report-hero">
        <view class="hero-caption">知行雷达 · 个性化报告</view>
        <view class="hero-title">{{ data.title }}</view>
        <view class="hero-desc">{{ data.summary }}</view>
      </view>

      <view v-if="data.reportMeta" class="panel-card">
        <view class="card-title">报告对象</view>
        <view class="detail-row"><text class="detail-label">学号</text><text class="detail-value">{{ data.reportMeta.studentName || '未提供' }}</text></view>
        <view class="detail-row"><text class="detail-label">学院</text><text class="detail-value">{{ data.reportMeta.college || '未提供' }}</text></view>
        <view class="detail-row"><text class="detail-label">专业</text><text class="detail-value">{{ data.reportMeta.major || '未提供' }}</text></view>
        <view class="detail-row"><text class="detail-label">主画像</text><text class="detail-value">{{ data.reportMeta.profileCategory || '未提供' }}</text></view>
        <view class="detail-row"><text class="detail-label">细分子类</text><text class="detail-value">{{ data.reportMeta.profileSubtype || '未提供' }}</text></view>
      </view>

      <view class="metric-grid" v-if="data.scoreCards.length">
        <view v-for="item in data.scoreCards" :key="item.label" class="metric-card light-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value">{{ item.score }}</view>
        </view>
      </view>

      <view v-if="data.profileExplanation || data.profileHighlights.length" class="panel-card">
        <view class="card-title">画像解释</view>
        <view v-if="data.profileExplanation" class="section-copy">{{ data.profileExplanation }}</view>
        <view v-if="data.profileHighlights.length" class="chip-row top-gap">
          <view v-for="item in data.profileHighlights" :key="item" class="tag-chip">{{ item }}</view>
        </view>
      </view>

      <view v-if="data.sections.length" class="panel-card">
        <view class="card-title">报告正文</view>
        <view v-for="(item, index) in data.sections" :key="`section-${index}`" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view v-if="data.evaluations.length" class="panel-card">
        <view class="card-title">评估结论</view>
        <view v-for="(item, index) in data.evaluations" :key="`evaluation-${index}`" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view v-if="data.suggestions.length" class="panel-card">
        <view class="card-title">行动建议</view>
        <view v-for="(item, index) in data.suggestions" :key="`suggestion-${index}`" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view v-if="data.featureTables.length" class="panel-card">
        <view class="card-title">关键特征表</view>
        <view v-for="table in data.featureTables" :key="table.title" class="feature-table">
          <view class="sub-title">{{ table.title }}</view>
          <view v-if="table.description" class="muted">{{ table.description }}</view>
          <view v-for="row in table.rows.slice(0, 8)" :key="`${table.title}-${row.label}`" class="detail-row">
            <text class="detail-label">{{ row.label }}</text>
            <text class="detail-value">{{ row.value }}<text v-if="row.unit">{{ row.unit }}</text></text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { ensureRole } from '../../../common/session';
import { getStudentReport } from '../../../api/student';

const loading = ref(true);
const error = ref('');
const data = ref(null);

onShow(() => {
  if (!ensureRole('student')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getStudentReport();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '个性化报告加载失败';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.report-hero {
  background:
    radial-gradient(circle at 86% 18%, rgba(197, 240, 255, 0.68), transparent 18%),
    linear-gradient(180deg, rgba(146, 214, 255, 0.76) 0%, rgba(219, 241, 255, 0.74) 50%, rgba(248, 252, 255, 0.82) 100%);
  color: #13233b;
}

.hero-caption {
  font-size: 22rpx;
  font-weight: 700;
  color: #4a6b91;
  margin-bottom: 8rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #13233b;
}

.hero-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #526b88;
}

.top-gap {
  margin-top: 14rpx;
}

.light-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.92) 100%);
}

.sub-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #1b2533;
  margin-bottom: 10rpx;
}

.feature-table + .feature-table {
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
  color: #68756d;
}

.detail-value,
.section-copy {
  font-size: 26rpx;
  line-height: 1.8;
  color: #223127;
}

.detail-value {
  font-weight: 700;
  text-align: right;
}
</style>
