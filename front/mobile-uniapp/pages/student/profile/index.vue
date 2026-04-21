<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步画像与群体对比信息...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="profile">
      <view class="hero-card profile-hero">
        <view class="hero-glow"></view>
        <view class="hero-caption">知行雷达 · 我的画像</view>
        <view class="hero-title">{{ profile.profileCategory }}</view>
        <view v-if="profile.profileSubtype" class="hero-subtitle">{{ profile.profileSubtype }}</view>
        <view class="hero-desc">{{ categoryExplanation || profile.profileExplanation || profile.description }}</view>
      </view>

      <view v-if="subtypeExplanation" class="panel-card">
        <view class="card-title">细分说明</view>
        <view class="section-copy">{{ subtypeExplanation }}</view>
      </view>

      <view class="metric-grid">
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark blue">险</view>
            <view class="metric-label">风险等级</view>
          </view>
          <view class="metric-value">{{ profile.riskLevel }}</view>
        </view>
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark cyan">健</view>
            <view class="metric-label">健康水平</view>
          </view>
          <view class="metric-value">{{ profile.healthLevel }}</view>
        </view>
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark deep">奖</view>
            <view class="metric-label">奖学金概率</view>
          </view>
          <view class="metric-value">{{ percentText(profile.scholarshipProbability) }}</view>
        </view>
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark slate">签</view>
            <view class="metric-label">画像标签数</view>
          </view>
          <view class="metric-value">{{ profile.profileHighlights.length }}</view>
        </view>
      </view>

      <view v-if="profile.profileHighlights.length" class="panel-card">
        <view class="card-title">画像亮点</view>
        <view class="chip-row top-gap">
          <view v-for="item in profile.profileHighlights" :key="item" class="tag-chip">{{ item }}</view>
        </view>
      </view>

      <view v-if="compare && compare.rankingCards.length" class="panel-card">
        <view class="card-title">群体位次</view>
        <view class="metric-grid">
          <view v-for="item in compare.rankingCards" :key="item.label" class="metric-card light-card">
            <view class="metric-label">{{ item.label }}</view>
            <view class="metric-value">
              {{ item.value }}<text class="metric-suffix">{{ item.suffix }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="profile.radar.length" class="panel-card">
        <view class="card-title">核心维度</view>
        <view v-for="item in profile.radar" :key="item.indicator" class="radar-item">
          <view class="row-head">
            <view class="row-title">{{ item.indicator }}</view>
            <view class="row-score">{{ item.value.toFixed(1) }}</view>
          </view>
          <view class="bar-track">
            <view class="bar-fill" :style="{ width: widthText(item.value) }"></view>
          </view>
        </view>
      </view>

      <view v-if="profile.strengths.length || profile.weaknesses.length" class="panel-card">
        <view class="card-title">强弱项</view>
        <view v-if="profile.strengths.length">
          <view class="sub-title">优势项</view>
          <view class="chip-row">
            <view v-for="item in profile.strengths" :key="item" class="tag-chip success">{{ item }}</view>
          </view>
        </view>
        <view v-if="profile.weaknesses.length" class="top-gap">
          <view class="sub-title">待提升项</view>
          <view class="chip-row">
            <view v-for="item in profile.weaknesses" :key="item" class="tag-chip warning">{{ item }}</view>
          </view>
        </view>
      </view>

      <view v-if="drivers.length" class="panel-card">
        <view class="card-title">系统判断依据</view>
        <view v-for="item in drivers" :key="item.id" class="driver-card">
          <view class="row-head">
            <view class="row-title">{{ item.title }}</view>
            <view class="priority-chip">{{ item.priority }}</view>
          </view>
          <view class="section-copy">{{ item.description }}</view>
          <view v-if="item.reason" class="helper-text top-gap-sm">{{ item.reason }}</view>
        </view>
      </view>

      <view v-if="compare && compare.explanations.length" class="panel-card">
        <view class="card-title">群体对比说明</view>
        <view v-for="item in compare.explanations" :key="item" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getStudentCompare, getStudentProfile } from '../../../api/student';
import { ensureRole } from '../../../common/session';
import { getProfileCategoryExplanation, getProfileSubtypeExplanation } from '../../../common/profile-subtype';

const loading = ref(true);
const error = ref('');
const profile = ref(null);
const compare = ref(null);

const drivers = computed(() => ((profile.value && profile.value.riskDrivers) || []).slice(0, 5));
const categoryExplanation = computed(() => getProfileCategoryExplanation(profile.value && profile.value.profileCategory));
const subtypeExplanation = computed(() => getProfileSubtypeExplanation(profile.value && profile.value.profileSubtype));

onShow(() => {
  if (!ensureRole('student')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [profileResult, compareResult] = await Promise.all([getStudentProfile(), getStudentCompare()]);
    profile.value = profileResult;
    compare.value = compareResult;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '画像加载失败';
  } finally {
    loading.value = false;
  }
}

function widthText(value) {
  return `${Math.max(Math.min(Number(value) || 0, 100), 4)}%`;
}

function percentText(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}
</script>

<style scoped>
.profile-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 88% 16%, rgba(202, 241, 255, 0.72), transparent 18%),
    linear-gradient(180deg, rgba(147, 214, 255, 0.76) 0%, rgba(218, 241, 255, 0.72) 52%, rgba(248, 252, 255, 0.82) 100%);
  color: #13233b;
}

.hero-glow {
  position: absolute;
  top: -40rpx;
  right: -12rpx;
  width: 210rpx;
  height: 210rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.76), rgba(128, 215, 255, 0.12) 62%, transparent 72%);
}

.hero-caption {
  position: relative;
  z-index: 1;
  font-size: 22rpx;
  font-weight: 700;
  color: #4a6b91;
  margin-bottom: 8rpx;
}

.hero-title {
  position: relative;
  z-index: 1;
  font-size: 40rpx;
  font-weight: 800;
  color: #13233b;
}

.hero-subtitle {
  position: relative;
  z-index: 1;
  margin-top: 10rpx;
  font-size: 25rpx;
  font-weight: 700;
  color: #47627f;
}

.hero-desc {
  position: relative;
  z-index: 1;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #526b88;
}

.light-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.92) 100%);
}

.metric-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.metric-mark {
  width: 50rpx;
  height: 50rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 800;
}

.metric-mark.blue {
  background: linear-gradient(135deg, #0f6dff, #53b2ff);
}

.metric-mark.cyan {
  background: linear-gradient(135deg, #11a4bf, #5ac9ef);
}

.metric-mark.deep {
  background: linear-gradient(135deg, #2563eb, #315efb);
}

.metric-mark.slate {
  background: linear-gradient(135deg, #42566f, #71859c);
}

.metric-suffix {
  font-size: 22rpx;
  margin-left: 6rpx;
}

.sub-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #1b2533;
  margin-bottom: 12rpx;
}

.top-gap {
  margin-top: 18rpx;
}

.top-gap-sm {
  margin-top: 10rpx;
}

.tag-chip.success {
  background: #ecfdf3;
  color: #15803d;
}

.tag-chip.warning {
  background: #fff7ed;
  color: #c2410c;
}

.radar-item,
.driver-card {
  padding: 18rpx 0;
  border-bottom: 1rpx solid rgba(223, 232, 244, 0.92);
}

.radar-item:last-child,
.driver-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.row-title,
.section-copy {
  font-size: 26rpx;
  color: #223127;
}

.row-title {
  font-weight: 800;
}

.row-score {
  font-size: 24rpx;
  font-weight: 800;
  color: #2d7a4f;
}

.bar-track {
  height: 12rpx;
  background: #e7eef7;
  border-radius: 999rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #0f6dff, #57b8ff);
  border-radius: 999rpx;
}

.priority-chip {
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  color: #2563eb;
}
</style>
