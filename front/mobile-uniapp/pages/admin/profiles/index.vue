<template>
  <view class="page-wrap admin-page">
    <view class="hero-card profiles-hero">
      <view class="hero-caption">知行雷达对比中心</view>
      <view class="hero-title">学院 / 专业对比</view>
      <view class="hero-desc">和 web 管理端保持同一口径，按真实名单聚合学院与专业，查看高风险率、注册覆盖率和主导画像。</view>
    </view>

    <view class="metric-grid">
      <view v-for="item in summaryCards" :key="item.label" class="metric-card light-card">
        <view class="metric-label">{{ item.label }}</view>
        <view class="metric-value">{{ item.value }}</view>
        <view class="muted">{{ item.note }}</view>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">筛选与切换</view>
      <view class="tab-row top-gap">
        <view class="tab-btn" :class="{ active: activeDimension === 'college' }" @click="switchDimension('college')">学院对比</view>
        <view class="tab-btn" :class="{ active: activeDimension === 'major' }" @click="switchDimension('major')">专业对比</view>
      </view>
      <input v-model="keyword" class="field-input top-gap" placeholder="搜索学院、专业或主导画像" />
      <view class="helper-text top-gap">当前显示 {{ activeRows.length }} 个分组，点击卡片查看详细学生名单。</view>
    </view>

    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步院系对比数据...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else>
      <view class="panel-card">
        <view class="card-title">聚合对比列表</view>
        <view
          v-for="item in activeRows"
          :key="item.label"
          class="aggregate-card"
          :class="{ active: currentAggregate && currentAggregate.label === item.label }"
          @click="openAggregate(item)"
        >
          <view class="row-head">
            <view class="row-title">{{ item.label }}</view>
            <view class="rate-badge">{{ item.riskRate }}%</view>
          </view>
          <view class="muted">{{ item.studentCount }} 人 · {{ item.highRiskCount }} 名高风险 · 注册覆盖 {{ item.registeredRate }}%</view>
          <view class="chip-row top-gap">
            <view class="tag-chip">{{ item.dominantProfile }}</view>
            <view class="tag-chip">{{ item.dominantSubtype }}</view>
          </view>
          <view v-if="subtypeExplanation(item.dominantSubtype)" class="helper-text top-gap">{{ subtypeExplanation(item.dominantSubtype) }}</view>
        </view>
        <view v-if="!activeRows.length" class="status-card empty top-gap">
          <view class="status-title">暂无结果</view>
          <view class="helper-text">换一个关键词，或切换到另一个维度试试。</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">重点关注分组</view>
        <view
          v-for="item in spotlightRows"
          :key="`spotlight-${item.label}`"
          class="spotlight-card"
          @click="openAggregate(item)"
        >
          <view>
            <view class="row-title">{{ item.label }}</view>
            <view class="muted">{{ item.studentCount }} 人 · {{ item.highRiskCount }} 名高风险 · {{ item.dominantProfile }}</view>
          </view>
          <view class="spotlight-rate">{{ item.riskRate }}%</view>
        </view>
      </view>

      <view v-if="currentAggregate" class="panel-card">
        <view class="card-title">分组详情</view>
        <view class="detail-grid top-gap">
          <view class="metric-card light-card">
            <view class="metric-label">当前分组</view>
            <view class="metric-value">{{ currentAggregate.label }}</view>
          </view>
          <view class="metric-card light-card">
            <view class="metric-label">高风险率</view>
            <view class="metric-value">{{ currentAggregate.riskRate }}%</view>
          </view>
          <view class="metric-card light-card">
            <view class="metric-label">注册覆盖</view>
            <view class="metric-value">{{ currentAggregate.registeredRate }}%</view>
          </view>
          <view class="metric-card light-card">
            <view class="metric-label">综合发展均值</view>
            <view class="metric-value">{{ currentAggregate.avgScore }}</view>
          </view>
        </view>

        <view class="detail-row top-gap"><text class="detail-label">主导画像</text><text class="detail-value">{{ currentAggregate.dominantProfile }}</text></view>
        <view class="detail-row"><text class="detail-label">主导细分</text><text class="detail-value">{{ currentAggregate.dominantSubtype }}</text></view>
        <view v-if="subtypeExplanation(currentAggregate.dominantSubtype)" class="helper-text top-gap">{{ subtypeExplanation(currentAggregate.dominantSubtype) }}</view>

        <view class="sub-title top-gap">学生名单</view>
        <view
          v-for="student in currentAggregate.students.slice(0, 20)"
          :key="student.studentId"
          class="student-card"
        >
          <view class="warning-main" @click="openDetail(student.studentId)">
            <view class="row-head">
              <view class="row-title">{{ student.studentId }}</view>
              <view class="row-score">{{ student.riskLevel }}</view>
            </view>
            <view class="muted">{{ student.college }} · {{ student.major }}</view>
            <view class="chip-row top-gap">
              <view class="tag-chip">{{ student.profileCategory }}</view>
              <view v-if="student.profileSubtype" class="tag-chip">{{ student.profileSubtype }}</view>
              <view class="tag-chip">{{ student.registrationStatus }}</view>
            </view>
          </view>
          <button class="secondary-btn detail-btn top-gap" @click="openDetail(student.studentId)">学生详情</button>
        </view>
      </view>
    </template>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="profiles" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getWarnings } from '../../../api/admin';
import { ensureRole } from '../../../common/session';
import { getProfileSubtypeExplanation } from '../../../common/profile-subtype';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';

const loading = ref(true);
const error = ref('');
const rows = ref([]);
const keyword = ref('');
const activeDimension = ref('college');
const currentAggregate = ref(null);

const summaryCards = computed(() => {
  const collegeGroups = buildAggregate(rows.value, 'college');
  const majorGroups = buildAggregate(rows.value, 'major');
  const activeGroups = activeDimension.value === 'major' ? majorGroups : collegeGroups;
  return [
    { label: '学院分组', value: collegeGroups.length, note: '真实学院字段聚合' },
    { label: '专业分组', value: majorGroups.length, note: '真实专业字段聚合' },
    { label: '最高风险分组', value: (activeGroups[0] && activeGroups[0].label) || '暂无', note: `${(activeGroups[0] && activeGroups[0].riskRate) || 0}% 高风险率` },
    { label: '当前视图', value: activeDimension.value === 'college' ? '学院' : '专业', note: '点击卡片查看分组详情' }
  ];
});

const collegeRows = computed(() => buildAggregate(rows.value, 'college'));
const majorRows = computed(() => buildAggregate(rows.value, 'major'));

const activeRows = computed(() => {
  const base = activeDimension.value === 'major' ? majorRows.value : collegeRows.value;
  const text = keyword.value.trim().toLowerCase();
  if (!text) return base;
  return base.filter((item) =>
    [item.label, item.dominantProfile, item.dominantSubtype]
      .map((value) => String(value || '').toLowerCase())
      .some((value) => value.includes(text))
  );
});

const spotlightRows = computed(() => activeRows.value.slice(0, 6));

onShow(() => {
  if (!ensureRole('admin')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const result = await getWarnings({ page: 1, pageSize: 5000 });
    rows.value = result.list || [];
    if (!currentAggregate.value && rows.value.length) {
      currentAggregate.value = buildAggregate(rows.value, activeDimension.value)[0] || null;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '院系对比加载失败';
  } finally {
    loading.value = false;
  }
}

function buildAggregate(source, key) {
  const counters = {};
  source.forEach((item) => {
    const label = String(item && item[key] ? item[key] : '').trim();
    if (!label) return;
    if (!counters[label]) {
      counters[label] = {
        label,
        studentCount: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        registeredCount: 0,
        totalScore: 0,
        profiles: {},
        subtypes: {},
        students: []
      };
    }
    const current = counters[label];
    current.studentCount += 1;
    current.totalScore += Number(item.scorePrediction || 0);
    if (item.riskLevel === '高风险') current.highRiskCount += 1;
    if (item.riskLevel === '中风险') current.mediumRiskCount += 1;
    if (item.registrationStatus === '已注册') current.registeredCount += 1;
    current.profiles[item.profileCategory] = (current.profiles[item.profileCategory] || 0) + 1;
    if (item.profileSubtype) {
      current.subtypes[item.profileSubtype] = (current.subtypes[item.profileSubtype] || 0) + 1;
    }
    current.students.push(item);
  });

  return Object.keys(counters)
    .map((label) => {
      const current = counters[label];
      const dominantProfile = Object.entries(current.profiles).sort((a, b) => b[1] - a[1])[0];
      const dominantSubtype = Object.entries(current.subtypes).sort((a, b) => b[1] - a[1])[0];
      return {
        label,
        studentCount: current.studentCount,
        highRiskCount: current.highRiskCount,
        mediumRiskCount: current.mediumRiskCount,
        registeredCount: current.registeredCount,
        riskRate: current.studentCount ? Math.round((current.highRiskCount / current.studentCount) * 100) : 0,
        registeredRate: current.studentCount ? Math.round((current.registeredCount / current.studentCount) * 100) : 0,
        avgScore: current.studentCount ? Number((current.totalScore / current.studentCount).toFixed(1)) : 0,
        dominantProfile: (dominantProfile && dominantProfile[0]) || '未识别',
        dominantSubtype: (dominantSubtype && dominantSubtype[0]) || '未细分',
        students: current.students.sort((a, b) => Number(b.scorePrediction || 0) - Number(a.scorePrediction || 0))
      };
    })
    .sort((a, b) => b.riskRate - a.riskRate || b.studentCount - a.studentCount);
}

function switchDimension(dimension) {
  activeDimension.value = dimension;
  currentAggregate.value = buildAggregate(rows.value, dimension)[0] || null;
}

function openAggregate(item) {
  currentAggregate.value = item;
}

function subtypeExplanation(subtype) {
  return getProfileSubtypeExplanation(subtype);
}

function openDetail(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${encodeURIComponent(studentId)}` });
}
</script>

<style scoped>
.admin-page {
  padding-bottom: 0;
}

.profiles-hero {
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

.light-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.92) 100%);
}

.top-gap {
  margin-top: 16rpx;
}

.tab-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.tab-btn {
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
  color: #64748b;
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid rgba(198, 215, 236, 0.86);
}

.tab-btn.active {
  background: linear-gradient(135deg, #0f6dff, #4eb4ff);
  color: #ffffff;
  border-color: transparent;
}

.sub-title,
.row-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #0f172a;
}

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.row-score {
  font-size: 24rpx;
  font-weight: 800;
  color: #c2410c;
}

.aggregate-card,
.spotlight-card,
.student-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(223, 232, 244, 0.92);
}

.aggregate-card:last-child,
.spotlight-card:last-child,
.student-card:last-child {
  border-bottom: none;
}

.aggregate-card.active {
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.78), rgba(255, 255, 255, 0));
}

.spotlight-card,
.student-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
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
  color: #64748b;
}

.detail-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.rate-badge,
.spotlight-rate {
  min-width: 96rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 24rpx;
  font-weight: 800;
  text-align: center;
}

.detail-btn {
  height: 72rpx;
  font-size: 24rpx;
}
</style>
