<template>
  <view class="page-wrap admin-page">
    <view class="hero-card warnings-hero">
      <view class="hero-caption">知行雷达管理端</view>
      <view class="hero-title">风险名单</view>
      <view class="hero-desc">聚合查看重点学生，支持搜索、进入单学生详情和完整报告，口径与 web 管理端一致。</view>
    </view>

    <view class="panel-card">
      <view class="card-title">筛选</view>
      <input v-model="keyword" class="field-input top-gap" placeholder="输入学号、学院、专业或画像类别搜索" />
      <view class="helper-text top-gap">当前显示 {{ filteredRows.length }} / {{ rows.length }} 名学生</view>
    </view>

    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步风险名单...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <view v-else class="panel-card">
      <view
        v-for="item in filteredRows"
        :key="item.studentId"
        class="warning-card"
      >
        <view class="warning-main" @click="openDetail(item.studentId)">
          <view class="row-head">
            <view class="row-title">{{ item.studentId }}</view>
            <view class="row-score">{{ item.riskLevel }}</view>
          </view>
          <view class="muted">{{ item.college }} · {{ item.major }}</view>
          <view class="chip-row top-gap">
            <view class="tag-chip">{{ item.profileCategory }}</view>
            <view v-if="item.profileSubtype" class="tag-chip">{{ item.profileSubtype }}</view>
            <view class="tag-chip">{{ item.registrationStatus }}</view>
          </view>
          <view v-if="item.secondaryTags.length" class="chip-row top-gap">
            <view v-for="tag in item.secondaryTags.slice(0, 4)" :key="`${item.studentId}-${tag}`" class="tag-chip">{{ tag }}</view>
          </view>
        </view>
        <view class="action-row top-gap">
          <button class="secondary-btn flex-btn small-btn" @click="openDetail(item.studentId)">学生详情</button>
          <button class="primary-btn flex-btn small-btn" @click="openReport(item.studentId)">完整报告</button>
        </view>
      </view>
    </view>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="warnings" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getWarnings } from '../../../api/admin';
import { ensureRole } from '../../../common/session';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';

const loading = ref(true);
const error = ref('');
const rows = ref([]);
const keyword = ref('');

const filteredRows = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  if (!text) return rows.value;
  return rows.value.filter((item) =>
    [item.studentId, item.college, item.major, item.profileCategory, item.profileSubtype, item.registrationStatus]
      .map((value) => String(value || '').toLowerCase())
      .some((value) => value.includes(text))
  );
});

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
  } catch (err) {
    error.value = err instanceof Error ? err.message : '风险名单加载失败';
  } finally {
    loading.value = false;
  }
}

function openDetail(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${encodeURIComponent(studentId)}` });
}

function openReport(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-report/index?studentId=${encodeURIComponent(studentId)}` });
}
</script>

<style scoped>
.admin-page {
  padding-bottom: 0;
}

.warnings-hero {
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
  margin-top: 12rpx;
}

.warning-card {
  padding: 22rpx 0;
  border-bottom: 1rpx solid rgba(223, 232, 244, 0.92);
}

.warning-card:last-child {
  border-bottom: none;
}

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.row-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #0f172a;
}

.row-score {
  font-size: 24rpx;
  font-weight: 800;
  color: #c2410c;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.flex-btn {
  flex: 1;
}

.small-btn {
  height: 72rpx;
  font-size: 24rpx;
}
</style>
