<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useStudentAuthStore } from '../../stores/auth';
import { useStudentLayoutPreferences } from '../../utils/layoutPreferences';

const auth = useStudentAuthStore();
const preferences = useStudentLayoutPreferences();

const accountRows = computed(() => [
  { label: '学号', value: auth.user?.studentId || '未绑定' },
  { label: '账号', value: auth.user?.username || '未提供' },
  { label: '角色', value: '学生账号' }
]);

const statusCards = computed(() => [
  { label: '报告状态', value: '个性化报告可查看' },
  { label: '画像状态', value: '画像与细分解释可查看' },
  { label: '默认模式', value: preferences.compactMode ? '紧凑模式' : '标准模式' },
  { label: '当前页面', value: '学生设置中心' }
]);

const passwordDialogVisible = ref(false);
const deviceDrawerVisible = ref(false);
const permissionDrawerVisible = ref(false);
const helpDrawerVisible = ref(false);
const helpTitle = ref('帮助中心');
const helpContent = ref('');
const passwordForm = reactive({
  currentPassword: '',
  nextPassword: '',
  confirmPassword: ''
});
const localFlags = reactive({
  reportNotice: true,
  scoreNotice: true,
  showSensitiveFields: true,
  allowExportReports: true,
  includeExplanationInExport: true,
  autoExpandFeatureTable: false
});

const deviceRows = computed(() => [
  { name: '当前浏览器', status: '在线', location: '本机 Windows', lastActive: '刚刚' },
  { name: '最近一次登录记录', status: '离线', location: '本机浏览器', lastActive: '今日较早' }
]);

const permissionRows = computed(() => [
  { label: '报告查看权限', value: '可查看当前账号对应的个性化报告、特征明细和解释依据。' },
  { label: '导出权限', value: localFlags.allowExportReports ? '当前允许打印和导出报告。' : '当前仅允许在线预览。' },
  { label: '敏感字段可见性', value: localFlags.showSensitiveFields ? '当前显示详细行为与成绩字段。' : '当前隐藏部分敏感字段。' }
]);

function openPasswordDialog() {
  passwordDialogVisible.value = true;
}

function submitPasswordChange() {
  if (!passwordForm.currentPassword || !passwordForm.nextPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请先填写完整的密码信息。');
    return;
  }
  if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致，请重新确认。');
    return;
  }
  passwordDialogVisible.value = false;
  passwordForm.currentPassword = '';
  passwordForm.nextPassword = '';
  passwordForm.confirmPassword = '';
  ElMessage.success('已记录修改密码请求，请按新密码重新登录。');
}

function openDeviceDrawer() {
  deviceDrawerVisible.value = true;
}

async function handleLogoutAllDevices() {
  await ElMessageBox.confirm('确定要让当前账号在其他设备上全部退出登录吗？', '退出全部设备', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  ElMessage.success('已发起全部设备退出。');
}

function openPermissionDrawer() {
  permissionDrawerVisible.value = true;
}

function openHelp(title: string, content: string) {
  helpTitle.value = title;
  helpContent.value = content;
  helpDrawerVisible.value = true;
}
</script>

<template>
  <section class="page-shell settings-page">
    <div class="hero panel-card">
      <div class="hero-copy">
        <div class="hero-eyebrow">Student Settings Center</div>
        <h1 class="hero-title">设置中心</h1>
        <p class="hero-subtitle">这里统一管理账号安全、提醒方式、报告导出、展示偏好和帮助信息，让日常使用更顺手。</p>
      </div>
      <div class="hero-badge">Account Preferences</div>
    </div>

    <div class="status-grid">
      <article v-for="item in statusCards" :key="item.label" class="status-card panel-card">
        <div class="status-label">{{ item.label }}</div>
        <div class="status-value">{{ item.value }}</div>
      </article>
    </div>

    <div class="settings-grid">
      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>账号与安全</span>
            <span class="minor-copy">当前账号和登录安全</span>
          </div>
        </template>
        <div class="info-list">
          <div v-for="item in accountRows" :key="item.label" class="info-item">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-value">{{ item.value }}</span>
          </div>
          <div class="action-grid">
            <el-button plain @click="openPasswordDialog">修改密码</el-button>
            <el-button plain @click="openDeviceDrawer">登录设备管理</el-button>
            <el-button plain @click="handleLogoutAllDevices">退出全部设备</el-button>
            <el-button plain @click="openPermissionDrawer">查看权限说明</el-button>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>通知与提醒</span>
            <span class="minor-copy">报告与结果提醒</span>
          </div>
        </template>
        <div class="switch-list">
          <div class="switch-item">
            <div>
              <div class="switch-title">报告更新提醒</div>
              <div class="switch-copy">当个性化报告内容更新时，在页面中显式提醒。</div>
            </div>
            <el-switch v-model="localFlags.reportNotice" />
          </div>
          <div class="switch-item">
            <div>
              <div class="switch-title">得分公式提醒</div>
              <div class="switch-copy">在画像页和报告页保留得分公式入口提示。</div>
            </div>
            <el-switch v-model="localFlags.scoreNotice" />
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>隐私与数据权限</span>
            <span class="minor-copy">控制敏感字段和导出范围</span>
          </div>
        </template>
        <div class="switch-list">
          <div class="switch-item">
            <div>
              <div class="switch-title">显示敏感字段</div>
              <div class="switch-copy">控制详细行为数据、成绩字段等敏感信息是否在界面中默认展示。</div>
            </div>
            <el-switch v-model="localFlags.showSensitiveFields" />
          </div>
          <div class="switch-item">
            <div>
              <div class="switch-title">允许导出完整报告</div>
              <div class="switch-copy">控制是否可导出包含特征明细和解释依据的完整 PDF 报告。</div>
            </div>
            <el-switch v-model="localFlags.allowExportReports" />
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>报告与导出</span>
            <span class="minor-copy">决定完整报告的默认组成</span>
          </div>
        </template>
        <div class="switch-list">
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">导出时附带解释依据</div>
              <div class="switch-copy">将预测依据、维度判读和计算说明一起写入导出报告。</div>
            </div>
            <el-switch v-model="localFlags.includeExplanationInExport" />
          </div>
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">自动展开特征总表</div>
              <div class="switch-copy">进入完整报告时直接显示全部特征表格。</div>
            </div>
            <el-switch v-model="localFlags.autoExpandFeatureTable" />
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>分析与展示偏好</span>
            <span class="minor-copy">控制默认页面和界面密度</span>
          </div>
        </template>
        <div class="switch-list">
          <div class="switch-item">
            <div>
              <div class="switch-title">紧凑模式</div>
              <div class="switch-copy">缩小页面留白，适合在一屏内查看更多内容。</div>
            </div>
            <el-switch v-model="preferences.compactMode" />
          </div>
          <div class="switch-item">
            <div>
              <div class="switch-title">强化卡片层级</div>
              <div class="switch-copy">增强卡片阴影与区块层次，让信息主次更清晰。</div>
            </div>
            <el-switch v-model="preferences.highlightPanels" />
          </div>
          <div class="switch-item">
            <div>
              <div class="switch-title">显示面包屑与顶部状态</div>
              <div class="switch-copy">保留当前位置、学号和当前模式标识。</div>
            </div>
            <div class="stack-switch">
              <el-switch v-model="preferences.showBreadcrumb" />
              <el-switch v-model="preferences.showContextStrip" />
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card full-span">
        <template #header>
          <div class="card-header-inner">
            <span>帮助与状态</span>
            <span class="minor-copy">查看当前报告、画像和帮助说明</span>
          </div>
        </template>
        <div class="system-grid">
          <div class="system-item">
            <div class="info-label">报告状态</div>
            <div class="system-value">个性化报告、特征总表和公式说明均可查看</div>
            <div class="switch-copy">可以在报告页查看完整判断依据和导出入口。</div>
          </div>
          <div class="system-item">
            <div class="info-label">画像状态</div>
            <div class="system-value">主画像、细分解释和亮点均可查看</div>
            <div class="switch-copy">可以在画像页查看细分解释，并进入报告页查看分数公式。</div>
          </div>
          <div class="system-item">
            <div class="info-label">帮助与反馈</div>
            <div class="action-grid">
              <el-button plain @click="openHelp('使用说明', '建议先看首页，再查看画像、报告和群体对比。')">使用说明</el-button>
              <el-button plain @click="openHelp('问题反馈', '如果页面显示异常，建议先刷新并重新加载当前页面。')">问题反馈</el-button>
              <el-button plain @click="openHelp('版本信息', '当前版本已支持完整报告、特征总表和得分公式。')">版本信息</el-button>
              <el-button plain @click="openHelp('帮助中心', '如果想了解每项分数的来历，可在画像页和报告页直接打开得分公式。')">帮助中心</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="420px">
      <div class="form-stack">
        <el-input v-model="passwordForm.currentPassword" type="password" show-password placeholder="当前密码" />
        <el-input v-model="passwordForm.nextPassword" type="password" show-password placeholder="新密码" />
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="确认新密码" />
      </div>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordChange">确认修改</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="deviceDrawerVisible" title="登录设备管理" size="420px">
      <div class="drawer-list">
        <div v-for="item in deviceRows" :key="item.name" class="drawer-card">
          <div class="drawer-card-title">{{ item.name }}</div>
          <div class="drawer-card-copy">状态：{{ item.status }}</div>
          <div class="drawer-card-copy">位置：{{ item.location }}</div>
          <div class="drawer-card-copy">最近活跃：{{ item.lastActive }}</div>
        </div>
      </div>
    </el-drawer>

    <el-drawer v-model="permissionDrawerVisible" title="权限说明" size="420px">
      <div class="drawer-list">
        <div v-for="item in permissionRows" :key="item.label" class="drawer-card">
          <div class="drawer-card-title">{{ item.label }}</div>
          <div class="drawer-card-copy">{{ item.value }}</div>
        </div>
      </div>
    </el-drawer>

    <el-drawer v-model="helpDrawerVisible" :title="helpTitle" size="420px">
      <div class="drawer-card-copy">{{ helpContent }}</div>
    </el-drawer>
  </section>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(135deg, #1677ff, #4ea4ff 55%, #7dc0ff);
  color: #fff;
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
  opacity: 0.88;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 900;
}

.hero-subtitle {
  margin: 0;
  max-width: 820px;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.9);
}

.hero-badge {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 800;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.status-card {
  padding: 18px 20px;
}

.status-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.status-value {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.5;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.full-span {
  grid-column: 1 / -1;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.minor-copy,
.switch-copy,
.info-label,
.drawer-card-copy {
  font-size: 12px;
  color: #64748b;
  line-height: 1.8;
}

.info-list,
.switch-list,
.form-stack,
.system-grid,
.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item,
.switch-item,
.system-item,
.drawer-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fbff;
}

.info-item,
.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.info-value,
.system-value,
.switch-title,
.drawer-card-title {
  font-weight: 800;
  color: #0f172a;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.stack-switch {
  display: flex;
  gap: 10px;
}

@media (max-width: 1200px) {
  .status-grid,
  .settings-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
  }

  .status-grid,
  .settings-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }

  .info-item,
  .switch-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
