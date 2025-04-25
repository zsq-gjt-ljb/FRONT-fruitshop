<template>
  <view class="product-manage">
    <!-- 顶部操作栏 -->
    
    
    <!-- 视图切换按钮 -->
    <view class="view-toggle">
      <view 
        :class="['toggle-btn', currentView === 'list' ? 'active' : '']"
        @click="switchToList()"
      >
        <uni-icons type="list" size="18" :color="getIconColor('list')"></uni-icons>
        <text>商品列表</text>
      </view>
      <view
        :class="['toggle-btn', currentView === 'edit' ? 'active' : '']"
        @click="switchToEdit()"
      >
        <uni-icons type="plusempty" size="18" :color="getIconColor('edit')"></uni-icons>
        <text>{{ isEditing ? '修改商品' : '添加商品' }}</text>
      </view>
    </view>
    
    <!-- 商品列表视图 -->
    <view v-if="currentView === 'list'" class="product-list-container">
      <view class="list-header">
        <text class="header-title">商品列表</text>
        <view class="search-bar">
          <uni-icons type="search" size="16" color="#999"></uni-icons>
          <input 
            v-model="searchKeyword" 
            placeholder="搜索商品名称" 
            @input="searchProducts"
          />
        </view>
      </view>

      <!-- 商品卡片列表 -->
      <view class="product-cards">
        <view 
          v-for="(product, index) in displayProducts" 
          :key="product.id"
          class="product-card"
        >
          <view class="card-content" @click="viewProduct(product)">
            <image 
              :src="product.indexPic || '/static/images/default-product.png'" 
              mode="aspectFill" 
              class="product-image"
            ></image>
            <view class="product-info">
              <view class="product-name">{{ product.name }}</view>
              <view class="product-title">{{ product.description }}</view>
              <!-- <view class="product-category">分类：{{ product.categoryName }}</view> -->
            </view>
          </view>
          <view class="card-actions">
            <view class="action-btn edit-btn" @click="editProduct(product)">
              <uni-icons type="compose" size="16" color="#4a90e2"></uni-icons>
              <text>修改</text>
            </view>
            <view class="action-btn delete-btn" @click="confirmDelete(product)">
              <uni-icons type="trash" size="16" color="#ff4d4f"></uni-icons>
              <text>删除</text>
            </view>
          </view>
        </view>

        <!-- 添加商品卡片 -->
        <view class="product-card add-card" @click="addNewProduct">
          <uni-icons type="plusempty" size="36" color="#ddd"></uni-icons>
          <text class="add-text">添加商品</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="products.length > 0 && !isLoading && hasMoreProducts" class="load-more" @click="loadMoreProducts">
        加载更多
      </view>
      <view v-if="isLoading" class="loading">
        <uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
        <text>加载中...</text>
      </view>
      <view v-if="products.length === 0 && !isLoading" class="empty-tip">
        暂无商品，请添加
      </view>
    </view>

    <!-- 编辑视图 - 步骤指示器 -->
    <view v-if="currentView === 'edit'" class="steps-container">
      <view 
        v-for="(step, index) in 3" 
        :key="index"
        :class="['step-item', currentStep === index+1 ? 'active' : '']">
        <text class="step-number">{{ index+1 }}</text>
        <text class="step-title">{{ ['基本信息', '商品详情', '规格设置'][index] }}</text>
      </view>
    </view>

    <!-- 步骤内容 -->
    <view v-if="currentView === 'edit'" class="step-content">
      <!-- 第一步：基本信息 -->
      <view v-if="currentStep === 1" class="form-section">
        <uni-forms :modelValue="formData.basic">
          <uni-forms-item label="商品类别" required>
            <view class="category-selector">
              <view class="selector-input" @tap="showCategoryPicker">
                <text v-if="formData.basic.category">{{ formData.basic.category }}</text>
                <text v-else class="placeholder">请选择商品类别</text>
                <uni-icons type="bottom" size="14" color="#999"></uni-icons>
              </view>
              
              <!-- 分类选择弹出层 -->
              <uni-popup ref="categoryPopup" type="bottom">
                <view class="dropdown-content">
                  <view class="popup-header">
                    <text class="popup-title">选择商品类别</text>
                    <view class="close-btn" @tap="hideCategoryPicker">
                      <uni-icons type="close" size="20" color="#666"></uni-icons>
                    </view>
                  </view>
                  
                  <scroll-view scroll-y class="category-list">
                    <view 
                      v-for="(category, index) in categoryList" 
                      :key="index"
                      class="category-item"
                      :class="{'active': formData.basic.category === category.name}"
                      @tap="selectCategory(category)"
                    >
                      <text class="category-name">{{ category.name }}</text>
                      <uni-icons v-if="formData.basic.category === category.name" type="checkmarkempty" size="18" color="#4a90e2"></uni-icons>
                    </view>
                    
                    <view v-if="categoryLoading" class="loading-box">
                      <text>加载中...</text>
                    </view>
                    
                    <view v-if="!categoryLoading && categoryList.length === 0" class="empty-box">
                      <text>暂无分类数据</text>
                    </view>
                  </scroll-view>
                </view>
              </uni-popup>
            </view>
          </uni-forms-item>
          <uni-forms-item label="商品名称" required>
            <input v-model="formData.basic.name" />
          </uni-forms-item>
          <uni-forms-item label="商品标题" required>
            <input v-model="formData.basic.title" />
          </uni-forms-item>
          <uni-forms-item label="是否上架">
            <view class="switch-container">
              <switch 
                :checked="formData.basic.status === 1" 
                @change="handleSwitchChange" 
                color="#4a90e2"
              />
              <text class="switch-status">{{ formData.basic.status === 1 ? '已上架' : '未上架' }}</text>
            </view>
          </uni-forms-item>
          <uni-forms-item label="商品图片">
            <uni-file-picker 
              v-model="formData.basic.images"
              limit="9" 
              file-mediatype="image"
              return-type="array"
              :image-styles="{
                width: '200rpx',
                height: '200rpx'
              }"
              @select="handleImageSelect"
              @delete="handleImageDelete"
            />
          </uni-forms-item>
        </uni-forms>
      </view>

      <!-- 第二步：商品详情 -->
      <view v-if="currentStep === 2" class="detail-section">
        <view class="section-title">商品详情编辑</view>
        
        <!-- 使用 WeUI 富文本编辑器 -->
        <view class="weui-editor-container">
          <!-- 编辑器区域 -->
          <view class="editor-edit-mode">
            <view class="editor-title">编辑内容</view>
            <textarea
              v-model="formData.details"
              class="html-textarea"
              placeholder="请输入HTML内容或使用工具栏编辑"
            ></textarea>
            
            <view class="weui-toolbar">
              <view class="toolbar-item" @tap="insertHtmlTag('<b>粗体文本</b>')">
                <text class="toolbar-icon">B</text>
              </view>
              <view class="toolbar-item" @tap="insertHtmlTag('<i>斜体文本</i>')">
                <text class="toolbar-icon" style="font-style: italic;">I</text>
              </view>
              <view class="toolbar-item" @tap="insertHtmlTag('<u>下划线文本</u>')">
                <text class="toolbar-icon" style="text-decoration: underline;">U</text>
              </view>
              <view class="toolbar-item" @tap="insertHtmlTag('<h3>标题文本</h3>')">
                <text class="toolbar-icon">H</text>
              </view>
              <view class="toolbar-item" @tap="insertHtmlTag('<ul><li>列表项1</li><li>列表项2</li></ul>')">
                <text class="toolbar-icon">•</text>
              </view>
              <view class="toolbar-item" @tap="insertHtmlImage">
                <text class="toolbar-icon">🖼️</text>
              </view>
            </view>
          </view>
          
          <!-- 预览区域 -->
          <view class="editor-preview-mode">
            <view class="preview-title">预览效果</view>
            
            <!-- 使用微信小程序原生rich-text组件 -->
            <rich-text 
              class="preview-content"
              :nodes="formData.details || '<p>暂无内容，请在上方输入内容</p>'"
            ></rich-text>
            
            <!-- 分隔线 -->
            <view class="preview-divider"></view>
            
            <!-- 增强版可视化预览 -->
            <view class="visual-preview">
              <view class="preview-row" v-if="hasBoldText">
                <text class="feature-label">粗体文本:</text>
                <text class="feature-preview bold-preview">{{ extractBoldText() }}</text>
              </view>
              
              <view class="preview-row" v-if="hasItalicText">
                <text class="feature-label">斜体文本:</text>
                <text class="feature-preview italic-preview">{{ extractItalicText() }}</text>
              </view>
              
              <view class="preview-row" v-if="hasUnderlineText">
                <text class="feature-label">下划线文本:</text>
                <text class="feature-preview underline-preview">{{ extractUnderlineText() }}</text>
              </view>
              
              <view class="preview-row" v-if="hasImages">
                <text class="feature-label">包含图片数量:</text>
                <text class="feature-preview">{{ countImages() }}张</text>
              </view>
              
              <view class="preview-row" v-if="hasList">
                <text class="feature-label">列表项:</text>
                <text class="feature-preview">包含列表，共{{ countListItems() }}项</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 详情图片上传 -->
        <view class="detail-images">
          <view class="section-subtitle">商品详情图片</view>
          <view class="tips">上传高清商品图片，建议尺寸750x1334或等比例图片</view>
          
          <uni-file-picker 
            v-model="formData.detailImages" 
            file-mediatype="image"
            mode="grid"
            return-type="array"
            limit="20"
            @select="handleDetailImageSelect"
            @delete="handleDetailImageDelete"
          ></uni-file-picker>
        </view>
      </view>

      <!-- 第三步：规格设置 -->
      <view v-if="currentStep === 3">
        <view class="specs-container">
          <view v-for="(spec, index) in formData.specs" :key="index" class="spec-item">
            <input 
              v-model="spec.name" 
              placeholder="名称（如：重量）"
              class="spec-input"
            />
            <input
              v-model="spec.value"
              placeholder="值（如：1kg）"
              class="spec-input"
            />
            <input
              v-model="spec.price"
              type="number"
              placeholder="价格"
              class="spec-input price"
            />
            <input
              v-model="spec.stock"
              type="number"
              placeholder="库存"
              class="spec-input stock"
            />
            <view class="remove-btn" @click="removeSpec(index)">
              <uni-icons type="close" size="18" color="#ff4d4f"></uni-icons>
        </view>
          </view>
          <button class="add-spec-btn" @click="addSpec">
            <uni-icons type="plus" size="16"></uni-icons>
            添加规格
          </button>
        </view>
      </view>
    </view>

    <!-- 导航按钮 -->
    <view v-if="currentView === 'edit'" class="action-buttons">
      <button v-if="currentStep > 1" @click="prevStep">上一步</button>
      <button @click="saveData" class="save-btn">保存</button>
      <button v-if="currentStep < 3" @click="nextStep">下一步</button>
      <button v-else @click="submitProduct">{{ isEditing ? '保存修改' : '提交商品' }}</button>
    </view>
  </view>
</template>

<script>
// 在页面顶部添加以下配置，用于声明组件
export default {
  name: 'ProductManage',
  options: {
    styleIsolation: 'shared'
  },
}
</script>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import { onLoad, onShow, onReady } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 小程序特有的生命周期
onLoad(() => {
  console.log('小程序页面加载')
  // 从本地存储恢复数据
  restoreDataFromStorage()
  
  // 获取分类数据
  fetchCategories()
  
  // 检查WeUI组件是否可用

})

// 定义编辑器初始化函数
const initEditor = () => {
  console.log('编辑器初始化')
  // 这里可以添加实际的编辑器初始化代码
  // 如果使用的是第三方编辑器，需要确保已正确引入相关库
}

onShow(() => {
  console.log('小程序页面显示')
})

onReady(() => {
  console.log('页面渲染完成')
  // 在这里初始化编辑器
  setTimeout(() => {
    initEditor()
  }, 500) // 增加延迟时间
})

const currentStep = ref(1)
const formData = reactive({
  basic: {
    category: '',
    categoryId: '',
    name: '',
    title: '',
    status: 1,
    images: []
  },
  details: '',
  detailImages: [],
  specs: []
})

// 预览刷新辅助变量
const previewKey = ref(0)

// 监听内容变化，强制刷新预览
watch(() => formData.details, (newVal) => {
  console.log('内容已更新，长度:', newVal?.length)
  // 通过改变key来强制mp-html组件重新渲染
  previewKey.value = Date.now()
})

// 插入HTML标签
const insertHtmlTag = (htmlTag) => {
  formData.details = formData.details + htmlTag
  // 强制刷新预览
  previewKey.value = Date.now()
}

// 插入HTML图片
const insertHtmlImage = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      try {
        if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
          uni.showToast({
            title: '没有选择图片',
            icon: 'none'
          })
          return
        }
        
        uni.showLoading({ title: '上传中...' })
        
        // 检查临时文件是否存在
        const tempFilePath = res.tempFilePaths[0]
        const fs = uni.getFileSystemManager()
        
        try {
          // 检查文件是否存在
          fs.accessSync(tempFilePath)
          
          // 文件存在，继续上传
          const imageUrl = await uploadImageToServer(tempFilePath)
          
          // 添加图片标签
          const imgTag = `<img src="${imageUrl}" style="max-width:100%;" />`
          formData.details = formData.details + imgTag
          
          // 强制刷新预览
          previewKey.value = Date.now()
          
          uni.showToast({
            title: '图片插入成功',
            icon: 'success'
          })
        } catch (fsError) {
          console.error('文件访问错误:', fsError)
          uni.showToast({
            title: '无法访问选中的图片',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('上传图片失败:', error)
        uni.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

// 预览图片
const previewImage = (src) => {
  uni.previewImage({
    urls: [src],
    current: src
  })
}

// 通用上传图片到服务器的方法
const uploadImageToServer = async (tempFilePath) => {
  try {
    console.log('开始上传图片:', tempFilePath)
    
    // 检查临时文件是否存在
    if (!tempFilePath) {
      throw new Error('临时文件路径不存在')
    }
    
    // 使用uni.uploadFile上传文件到服务器
    const uploadTask = () => {
      return new Promise((resolve, reject) => {
        // 检查临时文件是否存在
        try {
          // 使用getFileSystemManager API检查文件
          const fs = uni.getFileSystemManager()
          fs.access({
            path: tempFilePath,
            success: () => {
              // 文件存在，执行上传
              uni.uploadFile({
                url: 'https://bgnc.online/api/file/upload',
                filePath: tempFilePath,
                name: 'file',
                header: {
                  'Authorization': `Bearer ${uni.getStorageSync('token')}`
                },
                success: (uploadRes) => {
                  console.log('上传成功, 原始响应:', uploadRes)
                  try {
                    // 统一处理响应数据
                    const response = typeof uploadRes.data === 'string' 
                      ? JSON.parse(uploadRes.data) 
                      : uploadRes.data
                    
                    if (response.code === 200) {
                      resolve(response.msg) // 直接返回msg中的图片URL
                    } else {
                      reject(new Error(response.msg || '上传失败'))
                    }
                  } catch (e) {
                    reject(new Error('响应解析失败'))
                  }
                },
                fail: (err) => {
                  console.error('上传失败:', err)
                  reject(new Error('网络错误'))
                }
              })
            },
            fail: (err) => {
              console.error('文件不存在:', tempFilePath, err)
              reject(new Error('临时文件不存在或已被删除'))
            }
          })
        } catch (fsError) {
          console.error('文件系统错误:', fsError)
          reject(new Error('文件系统错误'))
        }
      })
    }
    
    const imageUrl = await uploadTask()
    console.log('上传成功, 图片URL:', imageUrl)
    return imageUrl
  } catch (error) {
    console.error('上传图片错误:', error)
    uni.showToast({
      title: '图片上传失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
    throw error
  }
}

// 基本信息的图片上传
const handleImageSelect = async (e) => {
  try {
    console.log('选择商品图片', e)
    const { tempFilePaths, tempFiles } = e
    
    if (!tempFilePaths || tempFilePaths.length === 0) {
      uni.showToast({
        title: '没有选择图片',
        icon: 'none'
      })
      return
    }
    
    // 显示上传中提示
    uni.showLoading({
      title: '上传中...',
      mask: true
    })
    
    const fs = uni.getFileSystemManager()
    
    // 上传所有选中的图片
    const uploadPromises = tempFilePaths.map(async (path) => {
      try {
        // 检查文件是否存在
        await new Promise((resolve, reject) => {
          fs.access({
            path: path,
            success: resolve,
            fail: (err) => {
              console.error('文件不存在:', path, err)
              reject(new Error('临时文件不存在或已被删除'))
            }
          })
        })
        
        // 文件存在，继续上传
        const imageUrl = await uploadImageToServer(path)
        return {
          name: path.split('/').pop(),
          url: imageUrl
        }
      } catch (err) {
        console.error('文件访问失败:', path, err)
        return null // 返回null表示这个文件处理失败
      }
    })
    
    const uploadedImages = (await Promise.all(uploadPromises))
      .filter(item => item !== null) // 过滤掉处理失败的项
    
    if (uploadedImages.length === 0) {
      throw new Error('所有图片上传失败')
    }
    
    // 更新表单数据中的图片列表
    formData.basic.images = [...formData.basic.images, ...uploadedImages]
    
    uni.hideLoading()
    uni.showToast({
      title: `成功上传${uploadedImages.length}张图片`,
      icon: 'success'
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '上传失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
  }
}

// 基本信息的图片删除
const handleImageDelete = (e) => {
  console.log('删除商品图片', e)
  // 从图片数组中删除相应图片
  const { index } = e
  formData.basic.images.splice(index, 1)
}

// 详情图片上传
const handleDetailImageSelect = async (e) => {
  try {
    console.log('选择详情图片', e)
    const { tempFilePaths, tempFiles } = e
    
    if (!tempFilePaths || tempFilePaths.length === 0) {
      uni.showToast({
        title: '没有选择图片',
        icon: 'none'
      })
      return
    }
    
    uni.showLoading({
      title: '上传中...',
      mask: true
    })
    
    const fs = uni.getFileSystemManager()
    
    // 上传所有选中的图片
    const uploadPromises = tempFilePaths.map(async (path) => {
      try {
        // 检查文件是否存在
        await new Promise((resolve, reject) => {
          fs.access({
            path: path,
            success: resolve,
            fail: (err) => {
              console.error('文件不存在:', path, err)
              reject(new Error('临时文件不存在或已被删除'))
            }
          })
        })
        
        // 文件存在，继续上传
        const imageUrl = await uploadImageToServer(path)
        return {
          name: path.split('/').pop(),
          url: imageUrl
        }
      } catch (err) {
        console.error('文件访问失败:', path, err)
        return null // 返回null表示这个文件处理失败
      }
    })
    
    const uploadedImages = (await Promise.all(uploadPromises))
      .filter(item => item !== null) // 过滤掉处理失败的项
    
    if (uploadedImages.length === 0) {
      throw new Error('所有图片上传失败')
    }
    
    // 更新表单数据中的详情图片列表
    formData.detailImages = [...formData.detailImages, ...uploadedImages]
    
    uni.hideLoading()
    uni.showToast({
      title: `成功上传${uploadedImages.length}张图片`,
      icon: 'success'
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '上传失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
  }
}

// 详情图片删除
const handleDetailImageDelete = (e) => {
  console.log('删除详情图片', e)
  // 从详情图片数组中删除相应图片
  const { index } = e
  formData.detailImages.splice(index, 1)
}

// 添加新规格
const addSpec = () => {
  formData.specs.push({
    id: null, // 新增规格id为null
    name: '',
    value: '',
    price: '',
    stock: '',
    productId:''
  })
}

// 删除规格 - 修复删除功能
const removeSpec = (index) => {
  console.log('删除规格', index)  // 添加调试日志
  formData.specs.splice(index, 1)
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 1) {
  currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < 3) {
    currentStep.value++
      
      // 保存到本地存储，防止切换步骤数据丢失
      saveDataToStorage()
    }
  }
}

// 验证当前步骤的数据
const validateCurrentStep = () => {
  if (currentStep.value === 1) {
    if (!formData.basic.name) {
      uni.showToast({
        title: '请输入商品名称',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.basic.title) {
      uni.showToast({
        title: '请输入商品标题',
        icon: 'none'
      })
      return false
    }
  }
  
  return true
}

// 保存当前数据（不提交）
const saveData = () => {
  saveDataToStorage()
  
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}

// 保存数据到本地存储
const saveDataToStorage = () => {
  try {
    const data = JSON.stringify(formData)
    uni.setStorageSync('product_draft', data)
    console.log('数据已保存到本地存储')
  } catch (e) {
    console.error('保存到本地存储失败', e)
  }
}

// 从本地存储恢复数据
const restoreDataFromStorage = () => {
  try {
    const data = uni.getStorageSync('product_draft')
    if (data) {
      const parsed = JSON.parse(data)
      Object.assign(formData, parsed)
      console.log('从本地存储恢复数据成功')
    }
  } catch (e) {
    console.error('从本地存储恢复数据失败', e)
  }
}

// 处理上架状态开关变化
const handleSwitchChange = (e) => {
  formData.basic.status = e.detail.value ? 1 : 0
  console.log('商品上架状态:', formData.basic.status)
}

// 重置表单
const resetForm = () => {
  formData.basic = {
    name: '',
    title: '',
    category: '',
    categoryId: '',
    status: 1,
    images: [],
    skuid:''
  }
  
  formData.details = ''
  formData.detailImages = []
  formData.specs = [
    {
      id: null,
      name: '',
      value: '',
      price: '',
      stock: '',
      productId:''
    }
  ]
  currentStep.value = 1
  isEditing.value = false
  editingProductId.value = ''
}

// 完全重写提交商品方法，确保数据格式符合API要求
const submitProduct = async () => {
  try {
    // 表单验证
    if (!validateForm()) {
      return
    }
    
    uni.showLoading({ title: '正在提交...' })
    
    // 准备图片数据
    let indexPic = ''
    if (formData.basic.images && formData.basic.images.length > 0) {
      indexPic = formData.basic.images[0].url || formData.basic.images[0]
    }
    
    // 将详情图片数组转换为逗号分隔的字符串
    let albumPics = ''
    if (formData.detailImages && formData.detailImages.length > 0) {
      albumPics = formData.detailImages.map(img => img.url || img).join(',')
    }
    
    // 准备规格数据 - 修改为保留id的逻辑
    const skus = formData.specs.map(spec => {
      // 创建基本SKU对象
      const skuObj = {
        stock: parseInt(spec.stock) || 0,
        price: parseFloat(spec.price) || 0,
        spData: spec.name + ':' + spec.value
      }
      
      // 如果是编辑已有SKU，添加id字段
      if (spec.id) {
        skuObj.id = spec.id
      }
      
      // 确保添加productId（针对编辑的情况）
      if (isEditing.value && editingProductId.value) {
        skuObj.productId = editingProductId.value
      } else if (spec.productId) {
        skuObj.productId = spec.productId
      }
      
      return skuObj
    })
    
    // 构建符合API要求的数据结构
    const productData = {
      name: formData.basic.name,
      categoryId: formData.basic.categoryId || 0,
      status: formData.basic.status,
      description: formData.basic.title,
      detailHtml: formData.details,
      albumPics: albumPics,
      indexPic: indexPic,
      skus: skus
    }
    
    // 添加调试输出
    console.log('提交的商品数据:', JSON.stringify(productData, null, 2))
    console.log('编辑模式:', isEditing.value, '商品ID:', editingProductId.value)
    
    let result
    if (isEditing.value) {
      // 更新商品 - PUT请求
      result = await request({
        url: 'https://bgnc.online/api/product',
        method: 'PUT',
        data: {
          ...productData,
          id: editingProductId.value  // 将ID放在请求体中
        }
      })
    } else {
      // 新建商品 - POST请求
      result = await request({
        url: 'https://bgnc.online/api/product',
      method: 'POST',
        data: productData
      })
    }
    
    if (result.code === 200) {
      uni.showToast({
        title: isEditing.value ? '修改成功' : '提交成功',
        icon: 'success'
      })
      
      // 清空表单
      resetForm()
      
      // 刷新商品列表
      fetchProducts()
      
      // 切换回列表视图
      switchToList()
    } else {
      uni.showToast({
        title: result?.message || '提交失败，请检查数据',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('提交商品出错:', error)
    uni.showToast({
      title: '提交失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 页面跳转方法
const navigateTo = (url) => {
  uni.navigateTo({
    url: url
  })
}

// 预览增强功能 - 计算属性
const hasBoldText = computed(() => {
  return formData.details && formData.details.includes('<b>') && formData.details.includes('</b>')
})

const hasItalicText = computed(() => {
  return formData.details && formData.details.includes('<i>') && formData.details.includes('</i>')
})

const hasUnderlineText = computed(() => {
  return formData.details && formData.details.includes('<u>') && formData.details.includes('</u>')
})

const hasImages = computed(() => {
  return formData.details && formData.details.includes('<img')
})

const hasList = computed(() => {
  return formData.details && (formData.details.includes('<ul>') || formData.details.includes('<ol>'))
})

// 预览增强功能 - 方法
const extractBoldText = () => {
  if (!formData.details) return ''
  
  const regex = /<b>(.*?)<\/b>/g
  const matches = formData.details.match(regex)
  
  if (!matches) return '无'
  
  return matches.map(match => {
    return match.replace(/<b>/g, '').replace(/<\/b>/g, '')
  }).join(', ')
}

const extractItalicText = () => {
  if (!formData.details) return ''
  
  const regex = /<i>(.*?)<\/i>/g
  const matches = formData.details.match(regex)
  
  if (!matches) return '无'
  
  return matches.map(match => {
    return match.replace(/<i>/g, '').replace(/<\/i>/g, '')
  }).join(', ')
}

const extractUnderlineText = () => {
  if (!formData.details) return ''
  
  const regex = /<u>(.*?)<\/u>/g
  const matches = formData.details.match(regex)
  
  if (!matches) return '无'
  
  return matches.map(match => {
    return match.replace(/<u>/g, '').replace(/<\/u>/g, '')
  }).join(', ')
}

const countImages = () => {
  if (!formData.details) return 0
  
  const regex = /<img/g
  const matches = formData.details.match(regex)
  
  return matches ? matches.length : 0
}

const countListItems = () => {
  if (!formData.details) return 0
  
  const regex = /<li>(.*?)<\/li>/g
  const matches = formData.details.match(regex)
  
  return matches ? matches.length : 0
}

// 分类选择相关
const categoryList = ref([])
const categoryLoading = ref(false)
const categoryPopup = ref(null)

// 获取商品分类列表
const fetchCategories = async () => {
  categoryLoading.value = true
  try {
    const result = await request({
      url: 'https://bgnc.online/api/category/list',
      method: 'GET'
    })
    
    console.log('获取的分类数据:', result)
    
    if (result && result.data) {
      categoryList.value = result.data.map(item => {
        return {
          id: item.id || item.categoryId || item._id,
          name: item.name || item.categoryName
        }
      })
      console.log('处理后的分类列表:', categoryList.value)
    } else {
      categoryList.value = []
      uni.showToast({
        title: '获取分类失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取分类出错:', error)
    uni.showToast({
      title: '获取分类失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
    
    // 添加一些测试数据，以便在API未连接时也能展示
    categoryList.value = [
      { id: '1', name: '新鲜水果' },
      { id: '2', name: '时令蔬菜' },
      { id: '3', name: '南茶北果' },
      { id: '4', name: '坚果零食' },
      { id: '5', name: '冲饮茶品' }
    ]
  } finally {
    categoryLoading.value = false
  }
}

// 显示分类选择器
const showCategoryPicker = () => {
  if (categoryPopup.value) {
    categoryPopup.value.open('bottom')
  }
  
  // 如果分类列表为空，则获取分类数据
  if (categoryList.value.length === 0 && !categoryLoading.value) {
    fetchCategories()
  }
}

// 隐藏分类选择器
const hideCategoryPicker = () => {
  if (categoryPopup.value) {
    categoryPopup.value.close()
  }
}

// 选择分类
const selectCategory = (category) => {
  formData.basic.category = category.name
  console.log('选择的分类:', category)
  formData.basic.categoryId = category.id
  console.log('设置的categoryId:', formData.basic.categoryId)
  hideCategoryPicker()
}

// 验证表单
const validateForm = () => {
  if (currentStep.value === 1) {
    if (!formData.basic.categoryId) {
      uni.showToast({
        title: '请选择商品类别',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.basic.name) {
      uni.showToast({
        title: '请输入商品名称',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.basic.title) {
      uni.showToast({
        title: '请输入商品标题',
        icon: 'none'
      })
      return false
    }
  } else if (currentStep.value === 3) {
    // 检查规格价格
    for (let i = 0; i < formData.specs.length; i++) {
      if (!formData.specs[i].price) {
        uni.showToast({
          title: `请为规格 ${i+1} 设置价格`,
          icon: 'none'
        })
        return false
      }
    }
  }
  
  return true
}

// 视图控制
const currentView = ref('list')  // 'list' 或 'edit'
const isEditing = ref(false)     // 是否为编辑模式
const editingProductId = ref(null) // 正在编辑的商品ID

// 商品列表数据
const products = ref([])
const displayProducts = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalProducts = ref(0)
const isLoading = ref(false)
const hasMoreProducts = ref(true)
const categoryFilter = ref('')
const editMode = ref('add')  // 'add' 或 'edit'

// 获取商品列表
const fetchProducts = async (append = false) => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      orderByColumn: 'createTime',
      isAsc: 'desc'
    }
    
    if (searchKeyword.value.trim()) {
      params.name = searchKeyword.value.trim()
    }
    
    if (categoryFilter.value) {
      params.categoryId = categoryFilter.value
    }
    
    console.log('正在获取商品列表，参数:', params)
    
    const response = await request({
      url: 'https://bgnc.online/api/product/list',
      method: 'GET',
      data: params
    })
    
    console.log('获取到的商品列表响应:', response)
    
    if (response.code === 200) {
      // 接口直接返回数组而不是rows包装
      let productData = response.data
      
      // 如果是数组直接使用，否则尝试取rows属性
      if (Array.isArray(productData)) {
        if (append) {
          products.value = [...products.value, ...productData]
        } else {
          products.value = productData
        }
      } else if (productData && productData.rows) {
        // 处理包含rows的情况
        if (append) {
          products.value = [...products.value, ...productData.rows]
        } else {
          products.value = productData.rows
        }
        totalProducts.value = productData.total || 0
      } else {
        // 兜底处理：直接赋值
        if (append) {
          products.value = [...products.value, ...(productData || [])]
        } else {
          products.value = productData || []
        }
      }
      
      // 始终更新显示列表
      displayProducts.value = [...products.value]
      console.log('处理后的商品列表:', displayProducts.value)
      
      // 更新是否有更多数据
      hasMoreProducts.value = append ? 
        products.value.length < totalProducts.value : 
        Array.isArray(productData) ? productData.length >= pageSize.value : false
    } else {
      uni.showToast({
        title: response.msg || '获取商品列表失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 切换到列表视图
const switchToList = () => {
  currentView.value = 'list'
  if (products.value.length === 0) {
    fetchProducts()
  }
}

// 切换到编辑视图
const switchToEdit = () => {
  currentView.value = 'edit'
}

// 添加新商品
const addNewProduct = () => {
  // 重置表单
  resetForm()
  isEditing.value = false
  editingProductId.value = null
  currentStep.value = 1
  switchToEdit()
}

// 查看商品详情
const viewProduct = (product) => {
  uni.showToast({
    title: '查看商品: ' + product.name,
    icon: 'none'
  })
  // 这里可以跳转到商品详情页或展示详情弹窗
}

// 编辑商品
const editProduct = async (product) => {
  try {
    isLoading.value = true
    
    // 获取完整的商品信息
    const result = await request({
      url: `https://bgnc.online/api/product/${product.id}`,
      method: 'GET'
    })
    
    if (result.code === 200 && result.data) { 
      console.log('111获取的商品数据:', result.data)
      const productData = result.data
      console.log('productData是', productData) 
	console.log('productData.skuList', productData.skuList)
      
      // 填充表单数据
      formData.basic.name = productData.name
      formData.basic.title = productData.description
      formData.basic.category = productData.categoryName
      formData.basic.categoryId = productData.categoryId
      formData.basic.status = productData.status
      
      // 处理图片
      if (productData.indexPic) {
        formData.basic.images = [{url: productData.indexPic}]
      }
      
      // 处理详情图片
      if (productData.albumPics) {
        formData.detailImages = productData.albumPics.split(',').map(url => ({url}))
      }
      
      // 处理富文本内容
      formData.details = productData.detailHtml || ''
      
      // 处理规格 - 优先使用skuList
      formData.specs = []
      console.log('productData.skuList', productData.skuList)
      
      // 优先使用skuList，如果存在
      if (productData.skuList && productData.skuList.length > 0) {
        console.log('使用skuList数据:', productData.skuList)
        productData.skuList.forEach(sku => {
          if (sku.spData) {
            const parts = sku.spData.split(':')
            if (parts.length === 2) {
              formData.specs.push({
                id: sku.id, // 保存原始SKU的ID
                name: parts[0],
                value: parts[1],
                price: sku.price,
                stock: sku.stock,
                productId: sku.productId,
              })
            }
          }
        })
      } 
      // 如果没有skuList，尝试使用skus
      else if (productData.skus && productData.skus.length > 0) {
        console.log('使用skus数据:', productData.skus)
        productData.skus.forEach(sku => {
          if (sku.spData) {
            const parts = sku.spData.split(':')
            if (parts.length === 2) {
              formData.specs.push({
                id: sku.id,
                name: parts[0],
                value: parts[1],
                price: sku.price,
                stock: sku.stock,
                productId: sku.productId || product.id,
              })
            }
          }
        })
      }
      
      // 如果没有规格，至少添加一个空规格
      if (formData.specs.length === 0) {
        formData.specs.push({
          id: null,
          name: '',
          value: '',
          price: '',
          stock: ''
        })
      }
      
      // 记录规格数据，用于调试
      console.log('解析后的规格数据:', formData.specs)
      
      // 设置编辑状态
      isEditing.value = true
      editingProductId.value = product.id
      currentStep.value = 1
      switchToEdit()
      
      uni.showToast({
        title: '已加载商品数据',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '获取商品详情失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    uni.showToast({
      title: '获取商品详情失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 确认删除商品
const confirmDelete = (product) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除商品"${product.name}"吗？此操作不可恢复。`,
    confirmColor: '#ff4d4f',
    success: (res) => {
      if (res.confirm) {
        deleteProduct(product.id)
      }
    }
  })
}

// 删除商品
const deleteProduct = async (productId) => {
  try {
    isLoading.value = true
    
    const result = await request({
      url: `https://bgnc.online/api/product/${productId}`,
      method: 'DELETE'
    })
    
    if (result.code === 200) {
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
      // 从列表中移除已删除商品
      products.value = products.value.filter(item => item.id !== productId)
      // 同步更新显示的列表
      displayProducts.value = products.value
    } else {
      uni.showToast({
        title: result?.message || '删除失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('删除商品失败:', error)
    uni.showToast({
      title: '删除失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 加载更多商品
const loadMoreProducts = () => {
  if (hasMoreProducts.value && !isLoading.value) {
    currentPage.value++
    fetchProducts(true)
  }
}

// 搜索商品
const searchProducts = debounce(() => {
  currentPage.value = 1 // 重置到第一页
  fetchProducts()
}, 500)

// 防抖函数
function debounce(fn, delay) {
  let timer = null
  return function() {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments)
      timer = null
    }, delay)
  }
}

// 页面加载时获取商品列表
onMounted(() => {
  fetchProducts()
})

// 添加颜色计算方法
const getIconColor = (type) => {
  return currentView.value === type ? '#4a90e2' : '#666'
}
</script>

<style lang="scss">
.product-manage {
  padding: 20rpx;
  background: #f5f7fa;
  min-height: 100vh;

  .action-bar {
    margin-bottom: 40rpx;
    
    .add-btn {
      background: #4a90e2;
      color: white;
      border-radius: 8rpx;
      padding: 16rpx 32rpx;
      font-size: 28rpx;
    }
  }

  .view-toggle {
    display: flex;
    background: #fff;
    margin-bottom: 20rpx;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .toggle-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24rpx 0;
      font-size: 28rpx;
      color: #666;
      
      uni-icons {
        margin-right: 10rpx;
      }
      
      &.active {
        background-color: #f0f7ff;
        color: #4a90e2;
        font-weight: 500;
      }
    }
  }

.steps-container {
  display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    background: #fff;
  padding: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
      width: 33.33%;
      position: relative;
      
      &:not(:last-child):after {
        content: '';
        position: absolute;
        top: 24rpx;
        right: -50%;
        width: 100%;
        height: 2rpx;
        background: #eee;
        z-index: 1;
      }
      
      .step-number {
        width: 40rpx;
        height: 40rpx;
        background: #eee;
        color: #999;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        margin-bottom: 12rpx;
        position: relative;
        z-index: 2;
      }
      
      .step-title {
        color: #999;
        font-size: 24rpx;
      }
      
      &.active {
        .step-number {
          background: #4a90e2;
  color: white;
}
        
        .step-title {
          color: #4a90e2;
          font-weight: 500;
        }
      }
    }
  }

  .form-section {
    background: white;
    padding: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
    .category-selector {
      width: 100%;
      position: relative;
      
      .selector-input {
        box-sizing: border-box;
        width: 100%;
        height: 70rpx;
        padding: 0 24rpx;
        border: 2rpx solid #eee;
        border-radius: 8rpx;
        font-size: 26rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #fff;
        
        &:active {
          background-color: #f9f9f9;
        }
        
        .placeholder {
          color: #999;
        }
      }
    }
    
    .uni-file-picker {
      margin-top: 16rpx;
    }

    .switch-container {
      display: flex;
      align-items: center;
      
      .switch-status {
        margin-left: 20rpx;
        font-size: 26rpx;
        color: #333;
      }
    }
  }

  .stock-section {
    background: white;
    padding: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .stock-input {
      width: 100%;
      height: 70rpx;
      padding: 0 20rpx;
      border: 2rpx solid #eee;
      border-radius: 8rpx;
      font-size: 26rpx;
      box-sizing: border-box;
    }
  }

  .specs-container {
    margin-top: 20rpx;
    
    .spec-item {
      display: flex;
      margin-bottom: 20rpx;
      align-items: center;
      
      .spec-input {
        width: 22%;
        height: 70rpx;
        background-color: #f5f7fa;
        border-radius: 8rpx;
        padding: 0 20rpx;
        margin-right: 10rpx;
        font-size: 26rpx;
        
        &.price {
          color: #ff6b00;
        }
        
        &.stock {
          color: #4a90e2;
        }
      }
      
      .remove-btn {
        min-width: 70rpx;
        height: 70rpx;
        background-color: #ff4d4f;
        color: #fff;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        
        &:active {
          background-color: #ff7875;
        }
      }
    }
    
    .add-spec-btn {
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      color: #4a90e2;
      font-size: 26rpx;
      border-radius: 8rpx;
      margin-top: 20rpx;
      border: 2rpx dashed #ddd;
      
      &:active {
        background-color: #e5e5e5;
      }
    }
  }

  .action-buttons {
    margin-top: 30rpx;
    display: flex;
    gap: 24rpx;
    
    button {
      flex: 1;
      height: 80rpx;
      border-radius: 8rpx;
      font-size: 26rpx;
      background: #4a90e2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:nth-child(1) {
        background: #f5f7fa;
        color: #666;
      }
      
      &.save-btn {
        background: #67c23a;
        color: white;
        flex: 0.8;
      }
    }
  }

  .detail-section {
    background: white;
    padding: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
    .section-title {
      font-size: 28rpx;
      font-weight: 500;
      margin-bottom: 20rpx;
      color: #333;
    }
    
    .section-subtitle {
      font-size: 26rpx;
      font-weight: 500;
      margin: 20rpx 0 12rpx;
      color: #333;
    }
    
    .tips {
      font-size: 22rpx;
      color: #999;
      margin-bottom: 16rpx;
    }
    
    .weui-editor-container {
      border: 2rpx solid #eee;
      border-radius: 8rpx;
      overflow: hidden;
      margin-bottom: 30rpx;
      
      .editor-edit-mode {
        .editor-title {
          font-size: 26rpx;
          color: #666;
          padding: 15rpx 20rpx;
          background-color: #f5f5f5;
          border-bottom: 2rpx solid #eee;
        }
        
        .html-textarea {
          width: 100%;
          min-height: 200rpx;
          padding: 20rpx;
          font-size: 28rpx;
          line-height: 1.5;
          box-sizing: border-box;
          background-color: #fff;
        }
        
        .weui-toolbar {
          display: flex;
          flex-wrap: wrap;
          padding: 10rpx;
          background-color: #f9f9f9;
          border-top: 2rpx solid #eee;
          
          .toolbar-item {
            flex: 1;
            height: 70rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            
            &:active {
              background: #eee;
            }
            
            .toolbar-icon {
              font-size: 28rpx;
              font-weight: bold;
            }
          }
        }
      }
      
      .editor-preview-mode {
        border-top: 2rpx solid #eee;
        padding: 20rpx;
        min-height: 150rpx;
        background-color: #fff;
        
        .preview-title {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 15rpx;
        }
        
        .preview-divider {
          height: 1rpx;
          background-color: #eee;
          margin-bottom: 15rpx;
        }
      }
    }
    
    .detail-images {
      margin-top: 20rpx;
    }
  }

  .product-list-container {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background: #fff;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      
      .header-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }
      
      .search-bar {
        display: flex;
        align-items: center;
        width: 400rpx;
        height: 70rpx;
        background: #f5f7fa;
        border-radius: 35rpx;
        padding: 0 24rpx;
        
        uni-icons {
          margin-right: 10rpx;
        }
        
        input {
          flex: 1;
          height: 100%;
          font-size: 26rpx;
        }
      }
    }
    
    .product-cards {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -10rpx;
      
      .product-card {
        width: calc(50% - 20rpx);
        margin: 10rpx;
        background: #fff;
        border-radius: 16rpx;
        overflow: hidden;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
        
        .card-content {
          padding: 20rpx;
          
          .product-image {
            width: 100%;
            height: 240rpx;
            border-radius: 8rpx;
            margin-bottom: 16rpx;
          }
          
          .product-info {
            .product-name {
              font-size: 28rpx;
              font-weight: 500;
              color: #333;
              margin-bottom: 8rpx;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .product-title {
              font-size: 24rpx;
              color: #666;
              margin-bottom: 8rpx;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .product-category {
              font-size: 22rpx;
              color: #999;
            }
          }
        }
        
        .card-actions {
          display: flex;
          border-top: 2rpx solid #f5f5f5;
          
          .action-btn {
            flex: 1;
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26rpx;
            
            uni-icons {
              margin-right: 6rpx;
            }
            
            &.edit-btn {
              color: #4a90e2;
              border-right: 2rpx solid #f5f5f5;
            }
            
            &.delete-btn {
              color: #ff4d4f;
            }
            
            &:active {
              background-color: #f9f9f9;
            }
          }
        }
        
        &.add-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400rpx;
          border: 2rpx dashed #ddd;
          background-color: #fafafa;
          box-shadow: none;
          
          .add-text {
            margin-top: 20rpx;
            color: #999;
            font-size: 28rpx;
          }
          
          &:active {
            background-color: #f5f5f5;
          }
        }
      }
    }
    
    .load-more {
      text-align: center;
      padding: 30rpx 0;
      color: #4a90e2;
      font-size: 28rpx;
    }
    
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30rpx 0;
      color: #999;
      font-size: 28rpx;
      
      uni-icons {
        margin-right: 10rpx;
        animation: rotate 1s linear infinite;
      }
    }
    
    .empty-tip {
      text-align: center;
      padding: 100rpx 0;
      color: #999;
      font-size: 28rpx;
    }
  }
}

.editor-preview-mode {
  .visual-preview {
    margin-top: 20rpx;
    
    .preview-row {
      margin-bottom: 10rpx;
      
      .feature-label {
        font-size: 24rpx;
        font-weight: 500;
        color: #333;
      }
      
      .feature-preview {
        font-size: 24rpx;
        color: #666;
        margin-left: 10rpx;
      }
    }
  }
}

.preview-content {
  padding: 15rpx;
  background-color: #fff;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  min-height: 100rpx;
  white-space: normal;
  word-break: break-all;
}

.preview-divider {
  height: 1rpx;
  background-color: #eee;
  margin: 20rpx 0;
}

.visual-preview {
  padding: 15rpx;
  background-color: #f9f9f9;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  
  .preview-row {
    display: flex;
    margin-bottom: 12rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .feature-label {
      width: 180rpx;
      font-size: 24rpx;
      color: #666;
      flex-shrink: 0;
    }
    
    .feature-preview {
      flex: 1;
      font-size: 24rpx;
      color: #333;
      word-break: break-all;
      
      &.bold-preview {
        font-weight: bold;
      }
      
      &.italic-preview {
        font-style: italic;
      }
      
      &.underline-preview {
        text-decoration: underline;
      }
    }
  }
}

.dropdown-content {
  background-color: #fff;
  border-radius: 12rpx 12rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #eee;
    
    .popup-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
    }
    
    .close-btn {
      padding: 10rpx;
    }
  }
  
  .category-list {
    max-height: 500rpx;
    padding-bottom: 20rpx;
    
    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 26rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      &:active {
        background-color: #f9f9f9;
      }
      
      &.active {
        background-color: #f0f7ff;
      }
      
      .category-name {
        font-size: 28rpx;
        color: #333;
      }
    }
    
    .loading-box, .empty-box {
      padding: 40rpx 0;
      text-align: center;
      color: #999;
      font-size: 26rpx;
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 