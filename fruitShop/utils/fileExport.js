import { copyDownloadUrl, downloadFileFromApi } from './download.js';

/**
 * 导出商品数据
 * @param {Object} options 配置选项
 */
export const exportProductData = (options = {}) => {
  // 设置商品导出接口URL
  const exportUrl = 'http://82.156.12.240:8080/api/products/excel';
  
  // 使用downloadFileFromApi函数处理二进制数据
  downloadFileFromApi({
    url: exportUrl,
    method: 'GET',
    header: {
      'content-type': 'application/vnd.ms-excel'
    },
    fileName: `商品数据_${Date.now()}.xlsx`,
    success: (filePath) => {
      console.log('商品数据导出成功，文件路径:', filePath);
      options.success && options.success(filePath);
    },
    fail: (error) => {
      console.error('商品数据导出失败', error);
      options.fail && options.fail(error);
    }
  });
};

/**
 * 导出用户数据
 * @param {Object} options 配置选项
 */
export const exportUserData = (options = {}) => {
  // 设置用户导出接口URL
  const exportUrl = 'http://82.156.12.240:8080/api/users/excel';
  
  // 使用downloadFileFromApi函数处理二进制数据
  downloadFileFromApi({
    url: exportUrl,
    method: 'GET',
    header: {
      'content-type': 'application/vnd.ms-excel'
    },
    fileName: `用户数据_${Date.now()}.xlsx`,
    success: (filePath) => {
      console.log('用户数据导出成功，文件路径:', filePath);
      options.success && options.success(filePath);
    },
    fail: (error) => {
      console.error('用户数据导出失败', error);
      options.fail && options.fail(error);
    }
  });
};

/**
 * 根据产品ID导出详细报表
 * @param {String} productId 产品ID
 * @param {Object} options 配置选项
 */
export const exportProductReport = (productId, options = {}) => {
  if (!productId) {
    uni.showToast({
      title: '产品ID不能为空',
      icon: 'none'
    });
    return;
  }
  
  // 设置产品报表导出接口URL
  const exportUrl = `http://82.156.12.240:8080/api/products/${productId}/report`;
  
  // 使用downloadFileFromApi函数处理二进制数据
  downloadFileFromApi({
    url: exportUrl,
    method: 'GET',
    header: {
      'content-type': 'application/vnd.ms-excel'
    },
    fileName: `产品${productId}报表_${Date.now()}.xlsx`,
    success: (filePath) => {
      console.log('产品报表导出成功，文件路径:', filePath);
      options.success && options.success(filePath);
    },
    fail: (error) => {
      console.error('产品报表导出失败', error);
      options.fail && options.fail(error);
    }
  });
};

/**
 * 通过复制链接的方式导出报表（备用方案）
 * @param {String} url 导出链接
 * @param {Object} options 配置选项
 */
export const exportByUrl = (url, options = {}) => {
  if (!url) {
    uni.showToast({
      title: '导出链接不能为空',
      icon: 'none'
    });
    return;
  }
  
  // 使用copyDownloadUrl函数
  copyDownloadUrl({
    url: url,
    title: options.title || '下载链接已复制，请前往浏览器下载！',
    success: () => {
      console.log('导出链接已复制');
      options.success && options.success();
    },
    fail: (error) => {
      console.error('复制导出链接失败', error);
      options.fail && options.fail(error);
    }
  });
}; 