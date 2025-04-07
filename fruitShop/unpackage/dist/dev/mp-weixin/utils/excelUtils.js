"use strict";
const common_vendor = require("../common/vendor.js");
const parseExcelData = (data, options = {}) => {
  if (!data || !(data instanceof ArrayBuffer)) {
    common_vendor.index.__f__("error", "at utils/excelUtils.js:207", "无效的Excel数据");
    return { error: "无效的Excel数据" };
  }
  try {
    const workbook = common_vendor.readSync(data, { type: "array" });
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length === 0) {
      return { error: "Excel文件中没有工作表" };
    }
    let sheetName = options.sheetName;
    if (!sheetName) {
      const sheetIndex = options.sheetIndex || 0;
      sheetName = sheetNames[sheetIndex] || sheetNames[0];
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return { error: `找不到工作表: ${sheetName}` };
    }
    const jsonData = common_vendor.utils.sheet_to_json(worksheet, {
      header: options.header !== false ? 1 : void 0,
      raw: true,
      defval: ""
    });
    return {
      sheets: sheetNames,
      data: jsonData,
      sheetName
    };
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/excelUtils.js:248", "解析Excel数据失败:", error);
    return { error: "解析Excel数据失败: " + error.message };
  }
};
const getExcelFromApi = (options) => {
  if (!options.url) {
    common_vendor.index.showToast({
      title: "接口地址不能为空",
      icon: "none"
    });
    return;
  }
  common_vendor.index.showLoading({
    title: "正在获取数据..."
  });
  common_vendor.index.request({
    url: options.url,
    method: options.method || "GET",
    data: options.data || {},
    header: {
      ...options.header,
      "content-type": "application/json"
    },
    responseType: "arraybuffer",
    // 重要：设置响应类型为arraybuffer
    success: function(res) {
      common_vendor.index.hideLoading();
      if (res.statusCode === 200) {
        const result = parseExcelData(res.data, options);
        if (result.error) {
          common_vendor.index.showToast({
            title: result.error,
            icon: "none"
          });
          options.fail && options.fail(result.error);
        } else {
          options.success && options.success(result);
        }
      } else {
        const errMsg = "获取数据失败: " + res.statusCode;
        common_vendor.index.showToast({
          title: errMsg,
          icon: "none"
        });
        options.fail && options.fail(errMsg);
      }
    },
    fail: function(error) {
      common_vendor.index.hideLoading();
      common_vendor.index.__f__("error", "at utils/excelUtils.js:313", "请求失败:", error);
      common_vendor.index.showToast({
        title: "网络请求失败",
        icon: "none"
      });
      options.fail && options.fail(error);
    },
    complete: function() {
      options.complete && options.complete();
    }
  });
};
const createWorkbook = (data, headers, sheetName = "Sheet1") => {
  const workbook = common_vendor.utils.book_new();
  let sheetData = [];
  if (headers && headers.length > 0) {
    sheetData.push(headers);
  }
  if (data && data.length > 0) {
    sheetData = sheetData.concat(data);
  }
  const worksheet = common_vendor.utils.aoa_to_sheet(sheetData);
  common_vendor.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
};
const exportToUserSelectedLocation = (options) => {
  try {
    const workbook = createWorkbook(
      options.data,
      options.headers,
      "Sheet1"
    );
    const wbout = common_vendor.writeSync(workbook, { bookType: "xlsx", type: "array" });
    if (typeof window !== "undefined" && window.Blob && window.URL) {
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = options.fileName || "export.xlsx";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      options.success && options.success();
      return;
    }
    const fs = common_vendor.index.getFileSystemManager();
    const tempFilePath = `${common_vendor.index.env.USER_DATA_PATH}/${options.fileName || "export.xlsx"}`;
    fs.writeFileSync(tempFilePath, wbout, "binary");
    common_vendor.index.saveFile({
      tempFilePath,
      success: function(saveRes) {
        const savedFilePath = saveRes.savedFilePath;
        common_vendor.index.openDocument({
          filePath: savedFilePath,
          showMenu: true,
          success: function() {
            common_vendor.index.showToast({
              title: "文件已打开",
              icon: "success"
            });
            options.success && options.success(savedFilePath);
          },
          fail: function(error) {
            common_vendor.index.__f__("error", "at utils/excelUtils.js:518", "打开文件失败:", error);
            common_vendor.index.showToast({
              title: "文件已保存，但无法打开",
              icon: "none"
            });
            options.success && options.success(savedFilePath);
          }
        });
      },
      fail: function(error) {
        common_vendor.index.__f__("error", "at utils/excelUtils.js:528", "保存文件失败:", error);
        common_vendor.index.openDocument({
          filePath: tempFilePath,
          showMenu: true,
          success: function() {
            common_vendor.index.showToast({
              title: "文件已打开",
              icon: "success"
            });
            options.success && options.success(tempFilePath);
          },
          fail: function(openError) {
            common_vendor.index.__f__("error", "at utils/excelUtils.js:542", "打开文件失败:", openError);
            common_vendor.index.showToast({
              title: "导出失败，请重试",
              icon: "none"
            });
            options.fail && options.fail(error);
          }
        });
      }
    });
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/excelUtils.js:553", "导出Excel失败:", error);
    common_vendor.index.showToast({
      title: "导出Excel失败",
      icon: "none"
    });
    options.fail && options.fail(error);
  }
};
exports.exportToUserSelectedLocation = exportToUserSelectedLocation;
exports.getExcelFromApi = getExcelFromApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/excelUtils.js.map
