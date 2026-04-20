<template>
  <view class="page-wrap">
    <view class="hero-card">
      <view class="hero-eyebrow">Student Settings Center</view>
      <view class="card-title">设置中心</view>
      <view class="hero-copy">这里统一管理账号安全、接口地址、报告导出、展示偏好和帮助信息，让手机端和 web 端保持一致的使用逻辑。</view>
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
      <view class="detail-row"><text class="detail-label">学号</text><text class="detail-value">{{ displayUser.studentId || '未绑定' }}</text></view>
      <view class="detail-row"><text class="detail-label">账号</text><text class="detail-value">{{ displayUser.username || '未提供' }}</text></view>
      <view class="detail-row"><text class="detail-label">角色</text><text class="detail-value">{{ displayUser.role || 'student' }}</text></view>
      <view class="detail-row"><text class="detail-label">令牌状态</text><text class="detail-value">{{ displayUser.token ? '已登录' : '未登录' }}</text></view>
      <view class="detail-row"><text class="detail-label">数据来源</text><text class="detail-value">{{ apiBase }}</text></view>
      <view class="action-row top-gap">
        <button class="primary-btn flex-btn" @click="refreshUser">刷新账号信息</button>
        <button class="secondary-btn flex-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">接口与同步</view>
      <view class="helper-text">如果 web 端注册好的账号在手机端看不到，请先确认这里的接口地址仍然指向当前电脑后端，再刷新账号信息。</view>
      <input v-model="apiBase" class="field-input top-gap" placeholder="请输入接口地址，例如 http://192.168.5.8:5000" />
      <view class="detail-row top-gap"><text class="detail-label">默认接口</text><text class="detail-value">{{ defaultApiBase }}</text></view>
      <view class="action-row top-gap">
        <button class="primary-btn flex-btn" @click="saveCurrentApiBase">保存地址</button>
        <button class="secondary-btn flex-btn" @click="resetApiBase">恢复默认</button>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">通知与隐私</view>
      <view v-for="item in switches" :key="item.label" class="switch-card">
        <view class="switch-copy-wrap">
          <view class="switch-title">{{ item.label }}</view>
          <view class="muted">{{ item.note }}</view>
        </view>
        <switch :checked="item.value" color="#1677ff" @change="toggleFlag(item.key, $event)" />
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">常用入口</view>
      <view class="shortcut-grid">
        <view class="shortcut-card" @click="switchStudentTab('/pages/student/home/index')">
          <view class="shortcut-title">首页</view>
          <view class="muted">回到学生首页总览</view>
        </view>
        <view class="shortcut-card" @click="switchStudentTab('/pages/student/predict/index')">
          <view class="shortcut-title">在线预测</view>
          <view class="muted">直接查看所有模型结果</view>
        </view>
        <view class="shortcut-card" @click="openPage('/pages/student/compare/index')">
          <view class="shortcut-title">群体对比</view>
          <view class="muted">查看本人和群体均值差异</view>
        </view>
        <view class="shortcut-card" @click="switchStudentTab('/pages/student/report/index')">
          <view class="shortcut-title">个性化报告</view>
          <view class="muted">查看完整结论和解释依据</view>
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
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCurrentUser, logout } from '../../../api/auth';
import { getApiBase, getDefaultApiBase, setApiBase } from '../../../common/config';
import { ensureRole, readSession, saveSession } from '../../../common/session';

const apiBase = ref(getApiBase());
const defaultApiBase = getDefaultApiBase();
const message = ref('');
const displayUser = ref(readSession() || {});
const flags = reactive({
  reportNotice: true,
  scoreNotice: true,
  showSensitiveFields: true,
  includeExplanationInExport: true
});

const statusCards = computed(() => [
  { label: '报告状态', value: '可查看', note: '个性化报告与特征总表可用' },
  { label: '画像状态', value: '可查看', note: '主画像与细分解释已启用' },
  { label: '绑定学号', value: displayUser.value.studentId || '未绑定', note: '当前移动端账号标识' },
  { label: '接口状态', value: apiBase.value ? '已配置' : '未配置', note: '当前手机端访问后端的地址' }
]);

const switches = computed(() => [
  { key: 'reportNotice', label: '报告更新提醒', note: '当个性化报告更新时在页面内提醒。', value: flags.reportNotice },
  { key: 'scoreNotice', label: '得分公式提醒', note: '在画像页和报告页保留公式入口提示。', value: flags.scoreNotice },
  { key: 'showSensitiveFields', label: '显示敏感字段', note: '控制详细行为与成绩字段的默认可见性。', value: flags.showSensitiveFields },
  { key: 'includeExplanationInExport', label: '导出附带解释依据', note: '导出报告时包含预测依据和维度判读。', value: flags.includeExplanationInExport }
]);

const helpCards = [
  { title: '使用说明', copy: '建议先看首页，再查看画像、群体对比和个性化报告。' },
  { title: '同步检查', copy: '如果手机端和 web 端账号数据不一致，先刷新账号信息并核对接口地址。' },
  { title: '版本说明', copy: '当前移动端已支持画像、报告、在线预测、群体对比和全样本分析。' }
];

onShow(async () => {
  if (!ensureRole('student')) return;
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
      message.value = '当前账号信息已刷新，手机端和 web 端会共用同一份后端数据。';
    }
  } catch (err) {
    displayUser.value = readSession() || {};
    if (showMessage) {
      message.value = err instanceof Error ? err.message : '当前未能刷新账号信息。';
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
  uni.navigateTo({ url });
}

function switchStudentTab(url) {
  uni.switchTab({ url });
}
</script>

<style scoped>
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
