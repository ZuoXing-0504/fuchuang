export function loginByRole(role) {
  uni.setStorageSync('demo-role', role);
  if (role === 'admin') {
    uni.reLaunch({ url: '/pages/admin/home/index' });
    return;
  }
  uni.reLaunch({ url: '/pages/student/home/index' });
}
