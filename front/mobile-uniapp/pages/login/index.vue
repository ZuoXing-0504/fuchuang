<template>
  <view class="login-page">
    <view class="login-bg">
      <view class="bg-circle c1"></view>
      <view class="bg-circle c2"></view>
    </view>

    <view class="login-container">
      <view class="brand-section">
        <view class="brand-icon">SB</view>
        <view class="brand-title">{{ currentRole === 'student' ? '学生行为画像系统' : '学生行为分析后台' }}</view>
        <view class="brand-subtitle">{{ currentRole === 'student' ? 'Student Growth Intelligence' : 'Admin Intelligence Console' }}</view>
      </view>

      <view class="panel-card form-shell">
        <view class="role-tabs">
          <view
            class="role-tab"
            :class="{ active: currentRole === 'student' }"
            @click="switchRole('student')"
          >
            学生端
          </view>
          <view
            class="role-tab"
            :class="{ active: currentRole === 'admin' }"
            @click="switchRole('admin')"
          >
            管理员端
          </view>
        </view>

        <template v-if="currentRole === 'student'">
          <view class="mode-tabs">
            <view class="mode-tab" :class="{ active: studentMode === 'login' }" @click="studentMode = 'login'">登录</view>
            <view class="mode-tab" :class="{ active: studentMode === 'register' }" @click="studentMode = 'register'">注册</view>
          </view>

          <view v-if="studentMode === 'login'" class="form-stack">
            <view class="helper-text">使用“用户名或学号 + 密码”进入学生端，查看画像、趋势、报告和建议。</view>
            <input v-model="studentLoginForm.username" class="field-input" placeholder="请输入用户名或学号" />
            <input v-model="studentLoginForm.password" class="field-input" placeholder="请输入密码" password />
            <button class="primary-btn" :disabled="loading" @click="handleStudentLogin">
              {{ loading ? '登录中...' : '进入学生端' }}
            </button>
          </view>

          <view v-else class="form-stack">
            <view class="helper-text">只有当前样本库中存在的学号可以注册，一个学号只能绑定一个学生账号。</view>
            <input v-model="registerForm.studentId" class="field-input" placeholder="请输入分析样本中的学号" />
            <input v-model="registerForm.username" class="field-input" placeholder="请设置登录用户名" />
            <input v-model="registerForm.password" class="field-input" placeholder="至少 6 位密码" password />
            <input v-model="registerForm.confirmPassword" class="field-input" placeholder="请再次输入密码" password />
            <button class="primary-btn" :disabled="loading" @click="handleRegister">
              {{ loading ? '注册中...' : '创建学生账号' }}
            </button>
          </view>
        </template>

        <template v-else>
          <view class="form-stack">
            <view class="helper-text">登录管理后台查看全样本分析、风险名单、单学生详情和完整报告。</view>
            <input v-model="adminForm.username" class="field-input" placeholder="请输入管理员账号" />
            <input v-model="adminForm.password" class="field-input" placeholder="请输入密码" password />
            <button class="primary-btn" :disabled="loading" @click="handleAdminLogin">
              {{ loading ? '登录中...' : '进入管理后台' }}
            </button>
            <view class="guide-box">
              <view>默认演示管理员：admin001</view>
              <view>默认密码：123456</view>
            </view>
          </view>
        </template>

        <view v-if="error" class="status-card error">
          <view class="status-title">操作失败</view>
          <view class="helper-text">{{ error }}</view>
        </view>
        <view v-if="success" class="status-card loading">
          <view class="status-title">操作成功</view>
          <view class="helper-text">{{ success }}</view>
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
  loading.value = true;
  resetStatus();
  try {
    const user = await login({
      ...studentLoginForm,
      role: 'student'
    });
    handleLoginSuccess(user);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学生登录失败，请检查后端是否启动';
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  loading.value = true;
  resetStatus();
  try {
    const result = await registerStudent(registerForm);
    success.value = `注册成功，请用账号 ${result.username} 返回登录。后端地址：${getDefaultApiBase()}`;
    studentMode.value = 'login';
    studentLoginForm.username = result.username;
    studentLoginForm.password = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

async function handleAdminLogin() {
  loading.value = true;
  resetStatus();
  try {
    const user = await login({
      ...adminForm,
      role: 'admin'
    });
    handleLoginSuccess(user);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '管理员登录失败，请检查后端是否启动';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f0fdf4, #f8faf6);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
}

.c1 {
  width: 500rpx;
  height: 500rpx;
  background: rgba(45, 122, 79, 0.06);
  top: -200rpx;
  left: -100rpx;
}

.c2 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(212, 163, 42, 0.05);
  bottom: -100rpx;
  right: -100rpx;
}

.login-container {
  position: relative;
  padding: 96rpx 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
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
  background: linear-gradient(135deg, #2d7a4f, #3b9464);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 44rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 40rpx rgba(45, 122, 79, 0.3);
}

.brand-title {
  font-size: 42rpx;
  font-weight: 900;
  color: #1a2e1f;
}

.brand-subtitle {
  font-size: 24rpx;
  color: #5f7267;
  letter-spacing: 1rpx;
}

.form-shell {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.role-tabs,
.mode-tabs {
  display: grid;
  gap: 14rpx;
}

.role-tabs {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mode-tabs {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  color: #5f7267;
  background: #f8faf6;
  border: 2rpx solid #e4ece2;
}

.role-tab.active,
.mode-tab.active {
  background: linear-gradient(135deg, #2d7a4f, #3b9464);
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
  border: 2rpx solid #dbe3da;
  background: #ffffff;
  font-size: 28rpx;
  color: #1a2e1f;
}

.guide-box {
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 24rpx;
  line-height: 1.8;
}
</style>
