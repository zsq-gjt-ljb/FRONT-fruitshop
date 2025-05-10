/**
 * 检查用户是否已登录，如果未登录则提示并可选择跳转到登录页
 * @param {Object} options - 配置选项
 * @param {Boolean} options.showModal - 是否显示登录提示框，默认为true
 * @param {Boolean} options.autoNavigate - 如果showModal为false，是否自动跳转到登录页，默认为false
 * @param {String} options.redirectUrl - 登录后重定向的地址，默认为当前页面
 * @returns {Boolean} - 返回用户是否已登录
 */
const checkLogin = (options = {}) => {
  // 默认配置
  const defaultOptions = {
    showModal: true,
    autoNavigate: false,
    redirectUrl: ''
  };
  
  // 合并配置
  const finalOptions = { ...defaultOptions, ...options };
  
  // 检查token是否存在
  const token = uni.getStorageSync('token');
  
  // 如果token存在，表示已登录
  if (token) {
    return true;
  }
  
  // 获取当前页面作为重定向URL
  let redirectPage = finalOptions.redirectUrl;
  if (!redirectPage) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    redirectPage = '/' + currentPage.route;
  }
  
  // 如果未登录且需要显示提示
  if (finalOptions.showModal) {
    uni.showModal({
      title: '需要登录',
      content: '该功能需要登录后才能使用，是否前往登录？',
      success: (res) => {
        if (res.confirm) {
          // 导航到登录页并传递重定向URL
          uni.navigateTo({
            url: '/pages/login/login?redirect=' + encodeURIComponent(redirectPage)
          });
        }
      }
    });
  } else if (finalOptions.autoNavigate) {
    // 自动导航到登录页
    uni.navigateTo({
      url: '/pages/login/login?redirect=' + encodeURIComponent(redirectPage)
    });
  }
  
  // 返回未登录状态
  return false;
};

/**
 * 退出登录
 */
const logout = () => {
  // 清除登录凭证
  uni.removeStorageSync('token');
  
  // 设置为游客模式
  uni.setStorageSync('isGuestMode', true);
  
  // 跳转回首页
  uni.switchTab({
    url: '/pages/index/index'
  });
  
  // 显示提示
  uni.showToast({
    title: '已退出登录',
    icon: 'success'
  });
};

export default {
  checkLogin,
  logout
}; 