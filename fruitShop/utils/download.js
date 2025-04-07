/**
 * 将下载链接复制到剪贴板，提示用户在浏览器中下载
 * @param {Object} options 配置项
 * @param {String} options.url 下载地址
 * @param {String} options.title 提示文字，默认为"下载地址已粘贴到剪贴板，请前往浏览器下载！"
 * @param {Function} options.success 成功回调
 * @param {Function} options.fail 失败回调
 * @param {Function} options.complete 完成回调
 */
const copyDownloadUrl = (options) => {
  if (!options.url) {
    uni.showToast({
      title: '下载地址不能为空',
      icon: 'none'
    });
    return;
  }
  
  uni.setClipboardData({
    data: options.url,
    success: function(res) {
      uni.showToast({
        title: options.title || '下载地址已粘贴到剪贴板，请前往浏览器下载！',
        icon: 'none',
        duration: 2000,
      });
      options.success && options.success(res);
    },
    fail: function(error) {
      console.error('复制链接失败:', error);
      uni.showToast({
        title: "复制链接失败，请重试",
        icon: "none"
      });
      options.fail && options.fail(error);
    },
    complete: function() {
      options.complete && options.complete();
    }
  });
};

/**
 * 处理接口返回的文件数据，保存为临时文件并分享
 * @param {Object} options 配置项
 * @param {String} options.url 接口地址
 * @param {String} options.method 请求方法，默认为 'GET'
 * @param {Object} options.data 请求参数
 * @param {Object} options.header 请求头
 * @param {String} options.fileName 文件名称，如 'data.xlsx'
 * @param {Function} options.success 成功回调
 * @param {Function} options.fail 失败回调
 * @param {Function} options.complete 完成回调
 */
const downloadFileFromApi = (options) => {
  if (!options.url) {
    uni.showToast({
      title: '接口地址不能为空',
      icon: 'none'
    });
    return;
  }
  
  const fileName = options.fileName || `文件_${Date.now()}.xlsx`;
  
  // 显示加载中
  uni.showLoading({
    title: '正在获取文件...'
  });
  
  // 请求接口获取文件数据
  uni.request({
    url: options.url,
    method: options.method || 'GET',
    data: options.data || {},
    header: {
      ...options.header,
      'content-type': 'application/json'
    },
    responseType: 'arraybuffer', // 重要：设置响应类型为arraybuffer
    success: function(res) {
      if (res.statusCode === 200) {
        try {
          // 将返回的二进制数据保存为临时文件
          const fs = uni.getFileSystemManager();
          const tempFilePath = `${uni.env.USER_DATA_PATH}/${fileName}`;
          
          fs.writeFileSync(tempFilePath, res.data, 'binary');
          
          // 尝试打开文档
          uni.openDocument({
            filePath: tempFilePath,
            showMenu: true,
            success: function() {
              uni.hideLoading();
              uni.showToast({
                title: '文件已打开',
                icon: 'success'
              });
              options.success && options.success(tempFilePath);
            },
            fail: function(error) {
              console.error('打开文档失败:', error);
              
              // 如果打开失败，尝试复制提示信息
              uni.setClipboardData({
                data: '文件已生成，但无法直接打开，请使用第三方应用查看。',
                success: function() {
                  uni.hideLoading();
                  uni.showToast({
                    title: '文件已保存，请查看提示信息',
                    icon: 'none',
                    duration: 2000
                  });
                }
              });
              
              options.fail && options.fail(error);
            }
          });
        } catch (error) {
          uni.hideLoading();
          console.error('处理文件数据失败:', error);
          uni.showToast({
            title: '处理文件失败',
            icon: 'none'
          });
          options.fail && options.fail(error);
        }
      } else {
        uni.hideLoading();
        uni.showToast({
          title: '获取文件失败：' + (res.data?.message || res.statusCode),
          icon: 'none'
        });
        options.fail && options.fail(res);
      }
    },
    fail: function(error) {
      uni.hideLoading();
      console.error('请求失败:', error);
      uni.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
      options.fail && options.fail(error);
    },
    complete: function() {
      options.complete && options.complete();
    }
  });
};

export {
  copyDownloadUrl,
  downloadFileFromApi
}; 