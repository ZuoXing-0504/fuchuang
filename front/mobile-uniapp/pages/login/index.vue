<template>
  <view class="login-page">
    <view class="login-bg">
      <view class="bg-orb orb-a"></view>
      <view class="bg-orb orb-b"></view>
      <view class="bg-grid"></view>
    </view>

    <view class="login-container">
      <view class="brand-section">
        <view class="brand-icon">
          <text>{{ currentRole === 'student' ? 'SG' : 'AC' }}</text>
        </view>
        <view class="brand-title">学生行为分析移动端</view>
        <view class="brand-subtitle">{{ currentRole === 'student' ? '学生成长中心' : '管理员移动后台' }}</view>
      </view>

      <view class="panel-card form-shell">
        <view class="role-tabs">
          <view class="role-tab" :class="{ active: currentRole === 'student' }" @click="switchRole('student')">
            学生端
          </view>
          <view class="role-tab" :class="{ active: currentRole === 'admin' }" @click="switchRole('admin')">
            管理端
          </view>
        </view>

        <template v-if="currentRole === 'student'">
          <view class="mode-tabs">
            <view class="mode-tab" :class="{ active: studentMode === 'login' }" @click="studentMode = 'login'">
              登录
            </view>
            <view class="mode-tab" :class="{ active: studentMode === 'register' }" @click="studentMode = 'register'">
              注册
            </view>
          </view>

          <view v-if="studentMode === 'login'" class="form-stack">
            <view class="helper-text">支持输入用户名或学号登录。</view>
            <input v-model="studentLoginForm.username" class="field-input" placeholder="请输入用户名或学号" />
            <input v-model="studentLoginForm.password" class="field-input" placeholder="请输入密码" password />
            <button class="primary-btn" :disabled="loading" @click="handleStudentLogin">
              {{ loading ? '登录中...' : '进入学生端' }}
            </button>
          </view>

          <view v-else class="form-stack">
            <view class="helper-text">只有在当前分析样本中的学号才可以注册。</view>
            <input v-model="registerForm.studentId" class="field-input" placeholder="请输入学号" />
            <input v-model="registerForm.username" class="field-input" placeholder="请输入用户名" />
            <input v-model="registerForm.password" class="field-input" placeholder="请输入密码（至少 6 位）" password />
            <input v-model="registerForm.confirmPassword" class="field-input" placeholder="请再次输入密码" password />
            <button class="primary-btn" :disabled="loading" @click="handleRegister">
              {{ loading ? '注册中...' : '创建学生账号' }}
            </button>
          </view>
        </template>

        <template v-else>
          <view class="form-stack">
            <view class="helper-text">管理员可查看总览、风险名单、预测模块和完整报告。</view>
            <input v-model="adminForm.username" class="field-input" placeholder="请输入管理员账号" />
            <input v-model="adminForm.password" class="field-input" placeholder="请输入密码" password />
            <button class="primary-btn" :disabled="loading" @click="handleAdminLogin">
              {{ loading ? '登录中...' : '进入管理端' }}
            </button>
            <view class="guide-box">
              <view>默认账号：admin001</view>
              <view>默认密码：123456</view>
            </view>
          </view>
        </template>

        <view v-if="error" class="status-card error">
          <view class="status-title">操作失败</view>
          <view class="helper-text error-text">{{ error }}</view>
        </view>

        <view v-if="success" class="status-card loading">
          <view class="status-title">操作成功</view>
          <view class="helper-text success-text">{{ success }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getDefaultApiBase } from '../../common/config';
import { redirectIfLoggedIn } from '../../common/session';
import { handleLoginSuccess, login, registerStudent } from '../../api/auth';

const currentRole = ref('student');
const studentMode = ref('login');
const loading = ref(false);
const error = ref('');
const success = ref('');

const studentLoginForm = reactive({
  username: '',
  password: ''
});

const registerForm = reactive({
  studentId: '',
  username: '',
  password: '',
  confirmPassword: ''
});

const adminForm = reactive({
  username: 'admin001',
  password: '123456'
});

onShow(() => {
  redirectIfLoggedIn();
});

function resetStatus() {
  error.value = '';
  success.value = '';
}

function switchRole(role) {
  currentRole.value = role;
  resetStatus();
}

async function handleStudentLogin() {
  if (!studentLoginForm.username.trim() || !studentLoginForm.password) {
    error.value = '请输入用户名和密码';
    return;
  }
  loading.value = true;
  resetStatus();
  try {
    const user = await login({
      ...studentLoginForm,
      role: 'student'
    });
    handleLoginSuccess(user);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学生登录失败，请稍后再试';
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  if (!registerForm.studentId.trim() || !registerForm.username.trim()) {
    error.value = '请先填写学号和用户名';
    return;
  }
  if (registerForm.password.length < 6) {
    error.value = '密码长度不能少于 6 位';
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = '两次输入的密码不一致';
    return;
  }
  loading.value = true;
  resetStatus();
  try {
    const result = await registerStudent(registerForm);
    success.value = `注册完成，请使用账号 ${result.username} 登录。当前接口地址：${getDefaultApiBase()}`;
    studentMode.value = 'login';
    studentLoginForm.username = result.username;
    studentLoginForm.password = '';
    registerForm.password = '';
    registerForm.confirmPassword = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败，请稍后再试';
  } finally {
    loading.value = false;
  }
}

async function handleAdminLogin() {
  if (!adminForm.username.trim() || !adminForm.password) {
    error.value = '请输入管理员账号和密码';
    return;
  }
  loading.value = true;
  resetStatus();
  try {
    const user = await login({
      ...adminForm,
      role: 'admin'
    });
    handleLoginSuccess(user);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '管理员登录失败，请稍后再试';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #08111f 0%, #12263f 58%, #eef4fb 58%, #eef4fb 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(10rpx);
}

.orb-a {
  width: 420rpx;
  height: 420rpx;
  background: rgba(56, 189, 248, 0.2);
  top: -120rpx;
  right: -60rpx;
}

.orb-b {
  width: 360rpx;
  height: 360rpx;
  background: rgba(37, 99, 235, 0.16);
  left: -120rpx;
  top: 240rpx;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px);
  background-size: 32rpx 32rpx;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.15));
}

.login-container {
  position: relative;
  padding: 88rpx 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.brand-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #1677ff, #5aa9ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 40rpx;
  font-weight: 900;
  box-shadow: 0 16rpx 48rpx rgba(22, 119, 255, 0.3);
}

.brand-title {
  font-size: 42rpx;
  font-weight: 900;
  color: #ffffff;
  text-align: center;
}

.brand-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.78);
}

.form-shell {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background: rgba(255, 255, 255, 0.94);
  border: 2rpx solid rgba(148, 163, 184, 0.14);
}

.role-tabs,
.mode-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.role-tab,
.mode-tab {
  height: 82rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #64748b;
  background: #f8fbff;
  border: 2rpx solid #dbe7f6;
}

.role-tab.active,
.mode-tab.active {
  background: linear-gradient(135deg, #1677ff, #5aa9ff);
  color: #ffffff;
  border-color: transparent;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.field-input {
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 18rpx;
  border: 2rpx solid #dbe7f6;
  background: #ffffff;
  font-size: 28rpx;
  color: #0f172a;
  box-sizing: border-box;
}

.guide-box {
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 24rpx;
  line-height: 1.8;
}

.error-text {
  color: #b91c1c;
}

.success-text {
  color: #1677ff;
}
</style>
