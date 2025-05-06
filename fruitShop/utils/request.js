// 请求封装
const request = async (options = {}) => {
  try {
    // 调试信息
    console.log('发送请求到:', options.url);
    if (options.data) console.log('请求数据:', options.data);

    // 获取本地存储的token和游客模式标记
    const token = uni.getStorageSync('token');
    const isGuestMode = uni.getStorageSync('isGuestMode');

    // 组装请求头 - 移除中文请求头
    const header = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-Brand': 'NanChaBeiGuo' // 改为英文或拼音
    };

    const response = await uni.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: { ...header, ...options.header }
    });

    // 添加ID转换处理
    if (response.data?.data) {
      response.data.data = convertIdsToString(response.data.data);
    }

    if (response.statusCode === 200) {
      return response.data;
    } else if (response.statusCode === 401) {
      // 检查是否需要登录的API
      const requiresAuth = checkIfRequiresAuth(options.url);
      
      // 如果是游客模式下访问需要登录的API
      if (isGuestMode && requiresAuth) {
        // 跳转到登录页面并设置返回页面
        const currentPage = getCurrentPageUrl();
        uni.navigateTo({
          url: '/pages/login/login?redirect=' + encodeURIComponent(currentPage)
        });
        throw new Error('游客模式无法访问，请登录');
      } else {
        // 正常的token过期，跳转到登录页
        uni.navigateTo({
          url: '/pages/login/login'
        });
        throw new Error('未授权，请重新登录');
      }
    } else {
      uni.showToast({
        title: response.data.message || '请求失败',
        icon: 'none'
      });
      throw new Error(response.data.message || '请求失败');
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    });
    throw error;
  }
};

// 获取当前页面URL
const getCurrentPageUrl = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const url = `/${currentPage.route}`;
  
  const query = currentPage.options;
  if (Object.keys(query).length > 0) {
    const queryStr = Object.keys(query)
      .map(key => `${key}=${query[key]}`)
      .join('&');
    return `${url}?${queryStr}`;
  }
  
  return url;
};

// 检查API是否需要认证
const checkIfRequiresAuth = (url) => {
  // 需要认证的API路径列表
  const requiresAuthPaths = [
    '/api/user/profile',
    '/api/addressbook',
    '/api/order',
    '/api/user',
    '/api/cart'
  ];
  
  // 检查URL是否包含需要认证的路径
  return requiresAuthPaths.some(path => url.includes(path));
};

// 递归转换ID字段为字符串
const convertIdsToString = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => convertIdsToString(item));
  } else if (data && typeof data === 'object') {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = key.toLowerCase().endsWith('id') && typeof value === 'number' 
        ? value.toString() 
        : convertIdsToString(value);
      return acc;
    }, {});
  }
  return data;
};

export default request; 