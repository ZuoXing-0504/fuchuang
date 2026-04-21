<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import BrandRadar from '../../components/BrandRadar.vue';
import { useStudentAuthStore } from '../../stores/auth';

const router = useRouter();
const auth = useStudentAuthStore();
const mode = ref<'login' | 'register'>('login');
const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ studentId: '', username: '', password: '', confirmPassword: '' });
const loading = ref(false);
const message = ref('');
const error = ref('');

const submitLabel = computed(() => {
  if (loading.value) {
    return mode.value === 'login' ? '登录中...' : '注册中...';
  }
  return mode.value === 'login' ? '进入学生端' : '创建学生账号';
});

async function handleLogin() {
  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    await auth.login(loginForm.value);
    router.push('/');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    const result = await auth.register(registerForm.value);
    message.value = `注册成功，已为学号 ${result.studentId} 创建账号 ${result.username}`;
    loginForm.value.username = result.username;
    loginForm.value.password = '';
    mode.value = 'login';
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

function switchMode(nextMode: 'login' | 'register') {
  mode.value = nextMode;
  error.value = '';
  message.value = '';
}
</script>

<template>
  <div class="login-page student-brand">
    <section class="brand-panel">
      <div class="brand-grid"></div>
      <div class="brand-copy">
        <div class="brand-mark">
          <BrandRadar />
        </div>
        <div class="brand-eyebrow">知行雷达学生端</div>
        <h1 class="brand-title">知行雷达</h1>
        <p class="brand-subtitle">把画像、群体对比、个性化报告、智能助手和成长建议放在同一个入口里，方便你持续了解自己的状态变化。</p>
        <div class="brand-points">
          <div class="point-item">真实学生画像标签与多维指标</div>
          <div class="point-item">群体对比与个性化成长建议</div>
          <div class="point-item">全样本分析成果与解释报告</div>
        </div>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-shell panel-card">
        <div class="form-head">
          <div>
            <div class="form-kicker">知行雷达 Student Portal</div>
            <h2 class="form-title">学生入口</h2>
            <p class="form-desc">注册账号后即可登录，统一查看画像、报告、群体对比、分析成果和智能助手。</p>
          </div>
        </div>

        <div class="mode-tabs">
          <button type="button" class="mode-tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
          <button type="button" class="mode-tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
        </div>

        <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label>用户名或学号</label>
            <input v-model="loginForm.username" type="text" placeholder="请输入用户名或学号" autocomplete="username" />
          </div>
          <div class="field">
            <label>密码</label>
            <input v-model="loginForm.password" type="password" placeholder="请输入密码" autocomplete="current-password" />
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">{{ submitLabel }}</button>
        </form>

        <form v-else @submit.prevent="handleRegister" class="login-form">
          <div class="field">
            <label>学号</label>
            <input v-model="registerForm.studentId" type="text" placeholder="请输入分析样本中的学号" autocomplete="off" />
          </div>
          <div class="field">
            <label>用户名</label>
            <input v-model="registerForm.username" type="text" placeholder="请设置登录用户名" autocomplete="username" />
          </div>
          <div class="field">
            <label>密码</label>
            <input v-model="registerForm.password" type="password" placeholder="至少 6 位密码" autocomplete="new-password" />
          </div>
          <div class="field">
            <label>确认密码</label>
            <input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" autocomplete="new-password" />
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">{{ submitLabel }}</button>
        </form>

        <p v-if="error" class="status-text error">{{ error }}</p>
        <p v-if="message" class="status-text success">{{ message }}</p>

        <div class="guide-box" v-if="mode === 'register'">
          <div>1. 只有当前样本库中存在的学号可以注册。</div>
          <div>2. 一个学号只能绑定一个学生账号。</div>
          <div>3. 注册完成后可使用“用户名或学号 + 密码”登录。</div>
        </div>

        <div class="footer-note">完成注册后，就可以进入首页查看画像、报告和群体对比。</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: #08111f;
}

.brand-panel,
.form-panel {
  position: relative;
}

.brand-panel {
  overflow: hidden;
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.24), transparent 34%), linear-gradient(145deg, #08111f, #10283d 58%, #1f5136);
  color: #f8fafc;
  display: flex;
  align-items: center;
}

.brand-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.2));
}

.brand-copy {
  position: relative;
  z-index: 1;
  padding: 72px 64px;
  max-width: 560px;
}

.brand-mark {
  display: inline-flex;
  padding: 8px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  margin-bottom: 28px;
}

.brand-eyebrow,
.form-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand-eyebrow {
  color: #93c5fd;
  margin-bottom: 12px;
}

.brand-title {
  margin: 0 0 14px;
  font-size: 42px;
  line-height: 1.12;
  font-weight: 900;
}

.brand-subtitle {
  margin: 0;
  font-size: 15px;
  line-height: 1.9;
  color: rgba(248, 250, 252, 0.8);
}

.brand-points {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(248, 250, 252, 0.86);
  font-size: 14px;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(180deg, #f8fbff, #eef4f9);
}

.form-shell {
  width: 100%;
  max-width: 420px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(18px);
}

.form-kicker {
  color: #2563eb;
  margin-bottom: 10px;
}

.form-title {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.form-desc {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
}

.mode-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 22px;
}

.mode-tab {
  height: 42px;
  border-radius: 12px;
  border: 1px solid #dbe5ee;
  background: #fff;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.mode-tab.active {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  border-color: transparent;
  color: #fff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.field input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #dbe3ea;
  border-radius: 12px;
  font-size: 14px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.96);
  outline: none;
}

.field input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.12);
}

.submit-btn {
  height: 46px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-text {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.7;
}

.status-text.error {
  background: #fef2f2;
  color: #b91c1c;
}

.status-text.success {
  background: #ecfdf5;
  color: #047857;
}

.guide-box {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
  line-height: 1.8;
}

.footer-note {
  margin-top: 18px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 960px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 320px;
  }

  .brand-copy,
  .form-panel {
    padding: 32px 24px;
  }
}
</style>
