<template>
    <view class="page-wrap admin-page">
    <view class="hero-card">
      <view class="hero-eyebrow">知行雷达管理端</view>
      <view class="card-title">设置中心</view>
      <view class="hero-copy">这里统一管理管理员账号安全、接口地址、提醒方式、数据权限、展示偏好和帮助说明，让手机端和 web 后台保持一致。</view>
    </view>

    <view class="metric-grid">
      <view v-for="item in statusCards" :key="item.label" class="metric-card">
        <view class="metric-label">{{ item.label }}</view>
        <view class="metric-value small">{{ item.value }}</view>
        <view class="muted">{{ item.note }}</view>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">账号与安全</view>
      <view class="detail-row"><text class="detail-label">账号</text><text class="detail-value">{{ displayUser.username || 'admin001' }}</text></view>
      <view class="detail-row"><text class="detail-label">角色</text><text class="detail-value">{{ displayUser.role || 'admin' }}</text></view>
      <view class="detail-row"><text class="detail-label">权限数</text><text class="detail-value">{{ displayUser.permissions ? displayUser.permissions.length : 0 }}</text></view>
      <view class="detail-row"><text class="detail-label">令牌状态</text><text class="detail-value">{{ displayUser.token ? '已登录' : '未登录' }}</text></view>
      <view class="action-row top-gap">
        <button class="primary-btn flex-btn" @click="refreshUser">刷新会话</button>
        <button class="secondary-btn flex-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">接口与同步</view>
      <view class="helper-text">如果手机端看不到 web 端的注册状态、风险名单或学生详情，请先确认这里仍然指向当前电脑后端。</view>
      <input v-model="apiBase" class="field-input top-gap" placeholder="请输入接口地址，例如 http://192.168.5.8:5000" />
      <view class="detail-row top-gap"><text class="detail-label">默认接口</text><text class="detail-value">{{ defaultApiBase }}</text></view>
      <view class="action-row top-gap">
        <button class="primary-btn flex-btn" @click="saveCurrentApiBase">保存地址</button>
        <button class="secondary-btn flex-btn" @click="resetApiBase">恢复默认</button>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">通知与展示偏好</view>
      <view v-for="item in switches" :key="item.label" class="switch-card">
        <view class="switch-copy-wrap">
          <view class="switch-title">{{ item.label }}</view>
          <view class="muted">{{ item.note }}</view>
        </view>
        <switch :checked="item.value" color="#1677ff" @change="toggleFlag(item.key, $event)" />
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">管理入口</view>
      <view class="shortcut-grid">
        <view class="shortcut-card" @click="openPage('/pages/admin/warnings/index')">
          <view class="shortcut-title">风险名单</view>
          <view class="muted">查看重点学生并进入详情</view>
        </view>
        <view class="shortcut-card" @click="openPage('/pages/admin/profiles/index')">
          <view class="shortcut-title">院系对比</view>
          <view class="muted">查看风险率和主导画像</view>
        </view>
        <view class="shortcut-card" @click="openPage('/pages/admin/tasks/index')">
          <view class="shortcut-title">干预工作台</view>
          <view class="muted">查看任务历史与批量预测</view>
        </view>
        <view class="shortcut-card" @click="openPage('/pages/admin/analysis/index')">
          <view class="shortcut-title">分析成果</view>
          <view class="muted">查看图表和详细解释</view>
        </view>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">帮助与状态</view>
      <view v-for="item in helpCards" :key="item.title" class="help-card">
        <view class="shortcut-title">{{ item.title }}</view>
        <view class="muted">{{ item.copy }}</view>
      </view>
    </view>

    <view v-if="message" class="status-card loading">
      <view class="status-title">状态提示</view>
      <view class="helper-text">{{ message }}</view>
    </view>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="settings" />
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCurrentUser, logout } from '../../../api/auth';
import { getApiBase, getDefaultApiBase, setApiBase } from '../../../common/config';
import { ensureRole, readSession, saveSession } from '../../../common/session';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';

const apiBase = ref(getApiBase());
const defaultApiBase = getDefaultApiBase();
const message = ref('');
const displayUser = ref(readSession() || {});
const flags = reactive({
  riskNotice: true,
  reportNotice: true,
  taskNotice: true,
  showSensitiveFields: true
});

const statusCards = computed(() => [
  { label: '数据状态', value: '已接入', note: '当前主表和风险名单可读' },
  { label: '模型状态', value: '可查看', note: '预测模块和单学生结果可用' },
  { label: '当前账号', value: displayUser.value.username || 'admin001', note: '手机端当前管理员身份' },
  { label: '接口状态', value: apiBase.value ? '已配置' : '未配置', note: '当前手机端访问后端的地址' }
]);

const switches = computed(() => [
  { key: 'riskNotice', label: '风险预警提醒', note: '当高风险名单变化时，在页面中显式提醒。', value: flags.riskNotice },
  { key: 'reportNotice', label: '报告生成提醒', note: '当完整报告准备完成时给出提示。', value: flags.reportNotice },
  { key: 'taskNotice', label: '干预任务提醒', note: '当重点学生队列变化时给出提醒。', value: flags.taskNotice },
  { key: 'showSensitiveFields', label: '显示敏感字段', note: '控制详细行为与成绩字段在手机端的默认可见性。', value: flags.showSensitiveFields }
]);

const helpCards = [
  { title: '使用说明', copy: '建议先看总览，再进入风险名单、院系对比和干预工作台。' },
  { title: '同步检查', copy: '如果手机端和 web 后台数据不一致，先刷新会话并核对接口地址。' },
  { title: '版本说明', copy: '当前移动端已支持总览、风险名单、院系对比、预测模块、分析成果和完整报告。' }
];

onShow(async () => {
  if (!ensureRole('admin')) return;
  apiBase.value = getApiBase();
  await refreshUser(false);
});

async function refreshUser(showMessage = true) {
  displayUser.value = readSession() || {};
  try {
    const currentUser = await getCurrentUser();
    displayUser.value = currentUser;
    saveSession({ ...(readSession() || {}), ...currentUser });
    if (showMessage) {
      message.value = '管理员会话已刷新。当前手机端和 web 后台会共用同一份账号库。';
    }
  } catch (err) {
    displayUser.value = readSession() || {};
    if (showMessage) {
      message.value = err instanceof Error ? err.message : '当前未能刷新管理员会话。';
    }
  }
}

function saveCurrentApiBase() {
  setApiBase(apiBase.value);
  apiBase.value = getApiBase();
  message.value = `接口地址已更新为 ${apiBase.value}`;
}

function resetApiBase() {
  apiBase.value = setApiBase('');
  message.value = `已恢复默认地址 ${defaultApiBase}`;
}

function toggleFlag(key, event) {
  flags[key] = Boolean(event.detail.value);
}

function handleLogout() {
  logout();
}

function openPage(url) {
  uni.redirectTo({ url });
}
</script>

<style scoped>
.admin-page {
  padding-bottom: 0;
}

.hero-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.hero-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.top-gap {
  margin-top: 16rpx;
}

.metric-value.small {
  font-size: 28rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e8eef7;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 24rpx;
  color: #64748b;
}

.detail-value {
  max-width: 420rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
  text-align: right;
  word-break: break-all;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.flex-btn {
  flex: 1;
}

.switch-card,
.help-card,
.shortcut-card {
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(148, 163, 184, 0.12);
}

.switch-card + .switch-card,
.help-card + .help-card {
  margin-top: 14rpx;
}

.switch-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18rpx;
}

.switch-title,
.shortcut-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8rpx;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}
</style>
