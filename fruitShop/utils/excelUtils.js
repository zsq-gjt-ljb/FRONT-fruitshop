import * as XLSX from 'xlsx';

/**
 * 解析压缩的Excel二进制数据并转换为JSON
 * @param {ArrayBuffer} compressedData 压缩的Excel文件二进制数据
 * @param {Object} options 解析选项
 * @returns {Object} 解析结果
 */
export const parseCompressedExcelData = (compressedData, options = {}) => {
  if (!compressedData) {
    console.error('无效的压缩数据');
    return { error: '无效的压缩数据' };
  }
  
  try {
    // 将压缩的二进制数据转换为base64字符串
    const base64Data = arrayBufferToBase64(compressedData);
    
    // 使用SheetJS直接解析，它支持解析压缩的Excel数据
    // SheetJS可以自动检测并处理各种Excel格式，包括ZIP压缩过的
    const workbook = XLSX.read(base64Data, { type: 'base64' });
    
    // 获取所有表名
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length === 0) {
      return { error: 'Excel文件中没有工作表' };
    }
    
    // 确定要处理的工作表
    let sheetName = options.sheetName;
    if (!sheetName) {
      const sheetIndex = options.sheetIndex || 0;
      sheetName = sheetNames[sheetIndex] || sheetNames[0];
    }
    
    // 获取指定工作表
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return { error: `找不到工作表: ${sheetName}` };
    }
    
    // 将工作表转换为JSON对象
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: options.header !== false ? 1 : undefined,
      raw: true,
      defval: ''
    });
    
    // 返回解析结果
    return {
      sheets: sheetNames,
      data: jsonData,
      sheetName: sheetName
    };
  } catch (error) {
    console.error('解析压缩Excel数据失败:', error);
    return { error: '解析压缩Excel数据失败: ' + error.message };
  }
};

/**
 * 将ArrayBuffer转换为Base64字符串
 * @param {ArrayBuffer} buffer 要转换的ArrayBuffer
 * @returns {String} 转换后的Base64字符串
 */
function arrayBufferToBase64(buffer) {
  if (!buffer) {
    return '';
  }
  
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  // 小程序环境中使用wx.arrayBufferToBase64
  if (typeof wx !== 'undefined' && wx.arrayBufferToBase64) {
    return wx.arrayBufferToBase64(buffer);
  }
  
  // 浏览器环境中使用btoa
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  
  // 如果以上方法都不可用，就使用自己实现的base64编码
  return customBase64Encode(binary);
}

/**
 * 自定义base64编码实现（当wx.arrayBufferToBase64和btoa都不可用时）
 * @param {String} str 要编码的字符串
 * @returns {String} base64编码后的字符串
 */
function customBase64Encode(str) {
  // base64编码表
  const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  do {
    let a = str.charCodeAt(i++);
    let b = str.charCodeAt(i++);
    let c = str.charCodeAt(i++);
    
    a = a ? a : 0;
    b = b ? b : 0;
    c = c ? c : 0;
    
    const b1 = (a >> 2) & 0x3F;
    const b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
    const b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3);
    const b4 = c & 0x3F;
    
    if (!b) {
      b3 = b4 = 64;
    } else if (!c) {
      b4 = 64;
    }
    
    result += b64chars.charAt(b1) + b64chars.charAt(b2) + b64chars.charAt(b3) + b64chars.charAt(b4);
  } while (i < str.length);
  
  return result;
}

/**
 * 从接口获取压缩的Excel数据并解析为JSON
 * @param {Object} options 配置选项
 */
export const getCompressedExcelFromApi = (options) => {
  if (!options.url) {
    uni.showToast({
      title: '接口地址不能为空',
      icon: 'none'
    });
    return;
  }
  
  // 显示加载中
  uni.showLoading({
    title: '正在获取数据...'
  });
  
  // 请求接口获取压缩的Excel文件数据
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
      uni.hideLoading();
      if (res.statusCode === 200) {
        // 解析压缩的Excel数据
        const result = parseCompressedExcelData(res.data, options);
        if (result.error) {
          uni.showToast({
            title: result.error,
            icon: 'none'
          });
          options.fail && options.fail(result.error);
        } else {
          options.success && options.success(result);
        }
      } else {
        const errMsg = '获取数据失败: ' + res.statusCode;
        uni.showToast({
          title: errMsg,
          icon: 'none'
        });
        options.fail && options.fail(errMsg);
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

/**
 * 解析Excel二进制数据并转换为JSON
 * @param {ArrayBuffer} data Excel文件的二进制数据
 * @param {Object} options 解析选项
 * @param {String} options.sheetName 指定要读取的工作表名称
 * @param {Number} options.sheetIndex 指定要读取的工作表索引，默认为0
 * @param {Boolean} options.header 是否将第一行作为表头，默认为true
 * @returns {Object} 解析结果，包含sheets(所有表)和data(指定表的数据)
 */
export const parseExcelData = (data, options = {}) => {
  if (!data || !(data instanceof ArrayBuffer)) {
    console.error('无效的Excel数据');
    return { error: '无效的Excel数据' };
  }
  
  try {
    // 将二进制数据转换为workbook对象
    const workbook = XLSX.read(data, { type: 'array' });
    
    // 获取所有表名
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length === 0) {
      return { error: 'Excel文件中没有工作表' };
    }
    
    // 确定要处理的工作表
    let sheetName = options.sheetName;
    if (!sheetName) {
      const sheetIndex = options.sheetIndex || 0;
      sheetName = sheetNames[sheetIndex] || sheetNames[0];
    }
    
    // 获取指定工作表
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return { error: `找不到工作表: ${sheetName}` };
    }
    
    // 将工作表转换为JSON对象
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: options.header !== false ? 1 : undefined,
      raw: true,
      defval: ''
    });
    
    // 返回解析结果
    return {
      sheets: sheetNames,
      data: jsonData,
      sheetName: sheetName
    };
  } catch (error) {
    console.error('解析Excel数据失败:', error);
    return { error: '解析Excel数据失败: ' + error.message };
  }
};

/**
 * 从接口获取Excel数据并解析为JSON
 * @param {Object} options 配置选项
 * @param {String} options.url 接口地址
 * @param {String} options.method 请求方法，默认为'GET'
 * @param {Object} options.data 请求参数
 * @param {Object} options.header 请求头
 * @param {Function} options.success 成功回调，参数为解析后的JSON数据
 * @param {Function} options.fail 失败回调，参数为错误信息
 * @param {Function} options.complete 完成回调
 */
export const getExcelFromApi = (options) => {
  if (!options.url) {
    uni.showToast({
      title: '接口地址不能为空',
      icon: 'none'
    });
    return;
  }
  
  // 显示加载中
  uni.showLoading({
    title: '正在获取数据...'
  });
  
  // 请求接口获取Excel文件数据
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
      uni.hideLoading();
      if (res.statusCode === 200) {
        // 解析Excel数据
        const result = parseExcelData(res.data, options);
        if (result.error) {
          uni.showToast({
            title: result.error,
            icon: 'none'
          });
          options.fail && options.fail(result.error);
        } else {
          options.success && options.success(result);
        }
      } else {
        const errMsg = '获取数据失败: ' + res.statusCode;
        uni.showToast({
          title: errMsg,
          icon: 'none'
        });
        options.fail && options.fail(errMsg);
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

/**
 * 创建一个新的Excel工作簿
 * @param {Array} data 数据数组
 * @param {Array} headers 表头数组，如 ['姓名', '年龄', '性别']
 * @param {String} sheetName 工作表名称，默认为'Sheet1'
 * @returns {Object} 工作簿对象
 */
export const createWorkbook = (data, headers, sheetName = 'Sheet1') => {
  // 创建一个新的工作簿
  const workbook = XLSX.utils.book_new();
  
  // 如果有表头，将其添加到数据的前面
  let sheetData = [];
  if (headers && headers.length > 0) {
    sheetData.push(headers);
  }
  
  // 添加数据
  if (data && data.length > 0) {
    sheetData = sheetData.concat(data);
  }
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return workbook;
};

/**
 * 将工作簿导出为Excel文件并保存
 * @param {Object} workbook 工作簿对象
 * @param {String} fileName 文件名，默认为'export.xlsx'
 */
export const exportWorkbook = (workbook, fileName = 'export.xlsx') => {
  try {
    // 将工作簿导出为二进制数据
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // 将二进制数据保存为临时文件
    const fs = uni.getFileSystemManager();
    const tempFilePath = `${uni.env.USER_DATA_PATH}/${fileName}`;
    
    fs.writeFileSync(tempFilePath, wbout, 'binary');
    
    // 显示文件保存位置的提示
    uni.showModal({
      title: '文件已导出',
      content: `文件已保存到：${tempFilePath}`,
      confirmText: '打开文件',
      cancelText: '关闭',
      success: function(res) {
        if (res.confirm) {
          // 尝试打开文档
          uni.openDocument({
            filePath: tempFilePath,
            showMenu: true,
            success: function() {
              console.log('文档打开成功');
            },
            fail: function(error) {
              console.error('打开文档失败:', error);
              
              // 尝试保存到本地
              uni.saveFile({
                tempFilePath: tempFilePath,
                success: function(saveRes) {
                  const savedFilePath = saveRes.savedFilePath;
                  
                  uni.showModal({
                    title: '文件已保存',
                    content: `文件已永久保存到：${savedFilePath}`,
                    confirmText: '我知道了',
                    showCancel: false
                  });
                },
                fail: function(saveError) {
                  console.error('保存文件失败:', saveError);
                  
                  // 如果还是失败，提供分享选项
                  uni.showModal({
                    title: '无法直接打开文件',
                    content: '您想要分享此文件到微信或保存到相册吗？',
                    confirmText: '分享文件',
                    cancelText: '取消',
                    success: function(modalRes) {
                      if (modalRes.confirm) {
                        // 尝试使用分享功能
                        uni.shareFileMessage({
                          filePath: tempFilePath,
                          success: function() {
                            console.log('文件分享成功');
                          },
                          fail: function(shareError) {
                            console.error('文件分享失败:', shareError);
                            uni.showToast({
                              title: '分享失败，请重试',
                              icon: 'none'
                            });
                          }
                        });
                      }
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
    
    return tempFilePath;
  } catch (error) {
    console.error('导出Excel失败:', error);
    uni.showToast({
      title: '导出Excel失败',
      icon: 'none'
    });
    return null;
  }
};

/**
 * 将Excel数据通过API下载，用户可选择保存位置
 * @param {Object} options 选项
 * @param {Object} options.data 要导出的数据
 * @param {Array} options.headers 表头
 * @param {String} options.fileName 文件名，默认为'export.xlsx'
 * @param {Function} options.success 成功回调
 * @param {Function} options.fail 失败回调
 */
export const exportToUserSelectedLocation = (options) => {
  try {
    // 创建工作簿
    const workbook = createWorkbook(
      options.data,
      options.headers,
      'Sheet1'
    );
    
    // 转换为二进制
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // 转换为Blob URL (小程序环境不支持，仅在H5环境下有效)
    if (typeof window !== 'undefined' && window.Blob && window.URL) {
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const a = document.createElement('a');
      a.href = url;
      a.download = options.fileName || 'export.xlsx';
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      options.success && options.success();
      return;
    }
    
    // 小程序环境下
    // 保存临时文件
    const fs = uni.getFileSystemManager();
    const tempFilePath = `${uni.env.USER_DATA_PATH}/${options.fileName || 'export.xlsx'}`;
    fs.writeFileSync(tempFilePath, wbout, 'binary');
    
    // 保存到本地文件
    uni.saveFile({
      tempFilePath: tempFilePath,
      success: function(saveRes) {
        const savedFilePath = saveRes.savedFilePath;
        
        // 直接打开文件
        uni.openDocument({
          filePath: savedFilePath,
          showMenu: true,
          success: function() {
            uni.showToast({
              title: '文件已打开',
              icon: 'success'
            });
            options.success && options.success(savedFilePath);
          },
          fail: function(error) {
            console.error('打开文件失败:', error);
            uni.showToast({
              title: '文件已保存，但无法打开',
              icon: 'none'
            });
            options.success && options.success(savedFilePath);
          }
        });
      },
      fail: function(error) {
        console.error('保存文件失败:', error);
        
        // 如果保存失败，尝试直接打开临时文件
        uni.openDocument({
          filePath: tempFilePath,
          showMenu: true,
          success: function() {
            uni.showToast({
              title: '文件已打开',
              icon: 'success'
            });
            options.success && options.success(tempFilePath);
          },
          fail: function(openError) {
            console.error('打开文件失败:', openError);
            uni.showToast({
              title: '导出失败，请重试',
              icon: 'none'
            });
            options.fail && options.fail(error);
          }
        });
      }
    });
  } catch (error) {
    console.error('导出Excel失败:', error);
    uni.showToast({
      title: '导出Excel失败',
      icon: 'none'
    });
    options.fail && options.fail(error);
  }
}; 