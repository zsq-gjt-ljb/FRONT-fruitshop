// 示例代码：将下载文件的地址粘贴到剪贴板，提示用户去浏览器下载

/**
 * 将下载地址复制到剪贴板并提示用户
 * @param {String} url 需要复制的下载地址
 */
export const copyUrlToClipboard = (url) => {
  if (!url) {
    console.error('下载地址不能为空');
    return;
  }
  
  // 使用Taro.setClipboardData复制URL到剪贴板
  Taro.setClipboardData({
    data: url,
    success: function(res) {
      // 成功后显示提示信息
      Taro.showToast({
        title: '下载地址已粘贴到剪贴板，请前往浏览器下载！',
        icon: 'none',
        duration: 2000,
      });
    },
    fail: function(error) {
      console.error('复制链接失败:', error);
      Taro.showToast({
        title: "复制链接失败，请重试",
        icon: "none"
      });
    }
  });
};

// 使用示例
// 假设这是一个下载Excel文件的函数
export const downloadExcel = () => {
  // 这里是文件下载地址
  const url = 'http://82.156.12.240:8080/api/download/excel';
  
  // 调用复制函数
  copyUrlToClipboard(url);
  
  // 你也可以直接使用以下代码：
  /*
  Taro.setClipboardData({
    data: url,
    success: function(res) {
      Taro.showToast({
        title: '下载地址已粘贴到剪贴板，请前往浏览器下载！',
        icon: 'none',
        duration: 2000,
      });
    }
  });
  */
}; 