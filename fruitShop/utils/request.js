// 请求封装
const request = async (options = {}) => {
  try {
    // 调试信息
    console.log('发送请求到:', options.url);
    if (options.data) console.log('请求数据:', options.data);

    // 获取本地存储的token和会员等级
    const token = uni.getStorageSync('token');
    // const memberLevel = uni.getStorageSync('memberLevel');

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
      // token过期，跳转到登录页
      uni.navigateTo({
        url: '/pages/login/login'
      });
      throw new Error('未授权，请重新登录');
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