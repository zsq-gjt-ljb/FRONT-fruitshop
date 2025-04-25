<template>
  <view class="home-manage">
    <view class="header">
      <view class="title">南茶北果首页管理</view>
      <view class="description">管理首页展示内容</view>
    </view>
    
    <!-- 轮播图管理 -->
    <view class="section">
      <view class="section-title">轮播图管理</view>
      <view class="section-desc">从商品中选择轮播图显示的内容</view>
      
      <!-- 刷新按钮 -->
      <view class="refresh-btn" @tap="refreshData">
        <uni-icons type="reload" size="16" color="#4a90e2"></uni-icons>
        <text>刷新数据</text>
      </view>
      
      <!-- 轮播商品列表 -->
      <view class="selected-products banner-products">
        <view 
          v-for="(banner, index) in banners" 
          :key="index"
          class="selected-product-item"
        >
          <image :src="banner.indexPic || '/static/images/default-product.png'" mode="aspectFill" class="product-thumb"></image>
          <text class="product-name">{{ banner.name }}</text>
          <view class="action-btn remove-btn" @tap="deleteBanner(banner.id)">
            <uni-icons type="trash" size="16" color="#ff4d4f"></uni-icons>
          </view>
        </view>
        
        <view v-if="banners.length === 0" class="empty-selection">
          暂无轮播图商品，请添加
        </view>
      </view>
    </view>
    
    <!-- 首页商品选择 -->
    <view class="section">
      <view class="section-title">首页展示商品</view>
      <view class="section-desc">选择要在首页展示的商品</view>
      
      <!-- 已选择的首页商品 -->
      <view class="selected-products home-products">
        <view 
          v-for="(product, index) in selectedProducts" 
          :key="index"
          class="selected-product-item"
        >
          <image :src="product.indexPic || '/static/images/default-product.png'" mode="aspectFill" class="product-thumb"></image>
          <text class="product-name">{{ product.name }}</text>
          <view class="action-btn remove-btn" @tap="deleteHomeProduct(product.id)">
            <uni-icons type="trash" size="16" color="#ff4d4f"></uni-icons>
          </view>
        </view>
        
        <view v-if="selectedProducts.length === 0" class="empty-selection">
          暂无首页商品，请添加
        </view>
      </view>
    </view>
    
    <!-- 商品列表 -->
    <view class="section">
      <view class="section-title">商品列表</view>
      <view class="section-desc">从下方选择商品添加到轮播图或首页</view>
      
      <!-- 商品搜索区 -->
      <view class="search-area">
        <view class="search-box">
          <uni-icons type="search" size="16" color="#999"></uni-icons>
          <input 
            v-model="searchKeyword" 
            placeholder="搜索商品名称" 
            @input="searchProducts"
          />
        </view>
        <button class="search-btn" @tap="fetchProducts">查询</button>
      </view>
      
      <!-- 商品列表 -->
      <view class="product-list">
        <view
          v-for="(product, index) in allProducts" 
          :key="product.id"
          class="product-item"
        >
          <image :src="product.indexPic || '/static/images/default-product.png'" mode="aspectFill" class="product-thumb"></image>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">¥{{ product.price }}</text>
          </view>
          <view class="product-actions">
            <button 
              class="action-btn banner-btn" 
              @tap="addToBanner(product)"
              :disabled="isBanner(product.id)"
            >
              {{ isBanner(product.id) ? '已是轮播' : '添加轮播' }}
            </button>
            <button 
              class="action-btn home-btn" 
              @tap="addToHome(product)"
              :disabled="isHomeProduct(product.id)"
            >
              {{ isHomeProduct(product.id) ? '已在首页' : '添加首页' }}
            </button>
          </view>
        </view>
        
        <view v-if="allProducts.length === 0" class="empty-list">
          暂无商品数据
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 轮播图数据
const banners = ref([])

// 首页商品数据
const allProducts = ref([]) // 所有商品
const selectedProducts = ref([]) // 已选择的商品
const searchKeyword = ref('') // 搜索关键词
const isLoading = ref(false)
let autoCheckTimer = null // 定时器

// 生命周期钩子
onMounted(() => {
  console.log('HomeManage组件已加载')
  // 首先加载产品列表，然后加载轮播图和首页商品数据
  fetchProducts().then(() => {
    console.log('产品列表加载完成，开始加载轮播图和首页商品')
    refreshData(true) // 传入true表示这是初始加载，需要进行验证
  })
  
  // 设置自动检查定时器 - 每3分钟检查一次
  startAutoCheck()
})

// 当页面显示时触发
onShow(() => {
  console.log('HomeManage页面显示')
  // 页面显示时刷新数据
  refreshData(true)
  
  // 重新启动自动检查
  startAutoCheck()
})

// 当页面隐藏时触发
onHide(() => {
  console.log('HomeManage页面隐藏')
  // 清除定时器
  clearAutoCheck()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  console.log('HomeManage组件卸载')
  clearAutoCheck()
})

// 启动自动检查定时器
const startAutoCheck = () => {
  // 先清除可能存在的定时器
  clearAutoCheck()
  
  // 设置新的定时器 - 每3分钟检查一次
  autoCheckTimer = setInterval(() => {
    console.log('执行自动检查...')
    fetchProducts().then(() => {
      if (allProducts.value.length > 0) {
        // 获取所有有效商品ID列表
        const validProductIds = new Set(allProducts.value.map(product => String(product.id)))
        // 静默检查并清理无效商品
        checkAndCleanInvalidProducts(validProductIds)
      }
    })
  }, 3 * 60 * 1000) // 3分钟
}

// 清除自动检查定时器
const clearAutoCheck = () => {
  if (autoCheckTimer) {
    clearInterval(autoCheckTimer)
    autoCheckTimer = null
  }
}

// 获取所有商品列表
const fetchProducts = async () => {
  try {
    isLoading.value = true
    
    const result = await request({
      url: 'https://bgnc.online/api/product/list',
      method: 'GET'
    })
    
    if (result.code === 200) { 
      console.log('result是', result)
      allProducts.value = result.data|| []
      
      // 获取所有有效商品ID列表，用于后续检查
      const validProductIds = new Set(allProducts.value.map(product => String(product.id)))
      console.log('有效商品ID列表:', validProductIds)
      
      // 检查并清理无效的轮播图和首页商品
      checkAndCleanInvalidProducts(validProductIds)
    } else {
      allProducts.value = []
      uni.showToast({
        title: result.message || '获取商品失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 检查并清理无效的轮播图和首页商品
const checkAndCleanInvalidProducts = async (validProductIds) => {
  // 检查轮播图中的商品是否存在
  const invalidBanners = banners.value.filter(banner => !validProductIds.has(String(banner.productId)))
  // 检查首页商品是否存在
  const invalidHomeProducts = selectedProducts.value.filter(product => !validProductIds.has(String(product.productId)))
  
  console.log('无效轮播图数量:', invalidBanners.length, '无效首页商品数量:', invalidHomeProducts.length)
  
  // 如果存在无效商品，进行清理
  if (invalidBanners.length > 0 || invalidHomeProducts.length > 0) {
    try {
      // 清理无效轮播图
      for (const banner of invalidBanners) {
        console.log('清理无效轮播图:', banner.id, banner.name)
        await deleteBanner(banner.id, true) // 传入true表示静默删除，不显示提示
      }
      
      // 清理无效首页商品
      for (const product of invalidHomeProducts) {
        console.log('清理无效首页商品:', product.id, product.name)
        await deleteHomeProduct(product.id, true) // 传入true表示静默删除，不显示提示
      }
      
      // 清理完成后，刷新数据
      await refreshData()
      
      // 显示清理结果
      if (invalidBanners.length > 0 || invalidHomeProducts.length > 0) {
        uni.showToast({
          title: `已清理${invalidBanners.length + invalidHomeProducts.length}个无效商品`,
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('清理无效商品失败:', error)
    }
  }
}

// 搜索商品
const searchProducts = () => {
  if (!searchKeyword.value) {
    fetchProducts()
    return
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  allProducts.value = allProducts.value.filter(item => 
    item.name.toLowerCase().includes(keyword)
  )
}

// 检查商品是否已在轮播图中
const isBanner = (id) => {
  // 确保字符串比较
  const pid = String(id)
  return banners.value.some(banner => String(banner.productId) === pid)
}

// 检查商品是否已在首页商品中
const isHomeProduct = (id) => {
  // 确保字符串比较
  const pid = String(id)
  return selectedProducts.value.some(product => String(product.productId) === pid)
}

// 加载轮播图数据
const loadBanners = async () => {
  try {
    const result = await request({
      url: 'https://bgnc.online/api/productmarket/list/1',
      method: 'GET'
    })
    
    if (result.code === 200) {
      // 转换后端数据到组件需要的格式
      console.log('原始轮播数据:', result.data)
      banners.value = (result.data || []).map(item => ({
        id: item.id,
        productId: item.productId, // 确保保留productId用于比较
        name: item.name || '',
        indexPic: item.imgUrl || ''
      }))
      console.log('处理后的轮播数据:', banners.value)
    } else {
      banners.value = []
    }
  } catch (error) {
    console.error('加载轮播图失败:', error)
    banners.value = []
  }
}

// 加载首页商品数据
const loadHomeProducts = async () => {
  try {
    console.log('开始加载首页商品数据')
    const result = await request({
      url: 'https://bgnc.online/api/productmarket/list/0',
      method: 'GET'
    })
    
    console.log('首页商品接口返回:', result)
    
    if (result.code === 200) {
      // 直接使用返回的数据
      selectedProducts.value = (result.data || []).map(item => ({
        id: item.id,
        productId: item.productId, // 确保保留productId用于比较
        name: item.name || '',
        indexPic: item.imgUrl || '',
        price: item.price
      }))
      console.log('处理后的首页商品数据:', selectedProducts.value)
    } else {
      console.log('首页商品接口返回异常:', result.code, result.message)
      selectedProducts.value = []
    }
  } catch (error) {
    console.error('加载首页商品失败:', error)
    selectedProducts.value = []
  }
}

// 刷新数据
const refreshData = async (isInitialLoad = false) => {
  uni.showLoading({ title: '刷新中...' })
  try {
    await Promise.all([loadBanners(), loadHomeProducts()])
    
    // 如果是初始加载或显式要求验证，检查数据有效性
    if (isInitialLoad && allProducts.value.length > 0) {
      // 获取所有有效商品ID列表
      const validProductIds = new Set(allProducts.value.map(product => String(product.id)))
      // 检查并清理无效商品
      await checkAndCleanInvalidProducts(validProductIds)
    } else {
      uni.showToast({
        title: '数据已刷新',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('刷新数据失败:', error)
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 添加商品到轮播图
const addToBanner = async (product) => {
  // 先检查是否已在轮播图中
  if (isBanner(product.id)) {
    uni.showToast({
      title: '该商品已在轮播图中',
      icon: 'none'
    })
    return
  }
  
  // 确认商品存在于当前有效商品列表中
  const existsInProducts = allProducts.value.some(p => String(p.id) === String(product.id))
  if (!existsInProducts) {
    uni.showToast({
      title: '该商品已被删除，请刷新列表',
      icon: 'none'
    })
    // 刷新商品列表
    await fetchProducts()
    return
  }
  
  try {
    uni.showLoading({ title: '添加中...' })
    
    // 调用API添加轮播图
    const result = await request({
      url: 'https://bgnc.online/api/productmarket',
      method: 'POST',
      data: {
        productId: product.id,
        status: 1,  // 1表示轮播图
        productName: product.name,
        imgUrl: product.indexPic
      }
    })
    
    if (result.code === 200) {
      // 添加成功，刷新轮播图列表
      await loadBanners()
      console.log('轮播图添加成功，刷新后数量:', banners.value.length)
      
      uni.showToast({
        title: '添加轮播图成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: result.message || '添加失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('添加轮播图失败:', error)
    uni.showToast({
      title: '添加失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 添加商品到首页
const addToHome = async (product) => {
  // 先检查是否已在首页中
  if (isHomeProduct(product.id)) {
    uni.showToast({
      title: '该商品已在首页中',
      icon: 'none'
    })
    return
  }
  
  // 确认商品存在于当前有效商品列表中
  const existsInProducts = allProducts.value.some(p => String(p.id) === String(product.id))
  if (!existsInProducts) {
    uni.showToast({
      title: '该商品已被删除，请刷新列表',
      icon: 'none'
    })
    // 刷新商品列表
    await fetchProducts()
    return
  }
  
  try {
    uni.showLoading({ title: '添加中...' })
    
    // 调用API添加首页商品
    const result = await request({
      url: 'https://bgnc.online/api/productmarket',
      method: 'POST',
      data: {
        productId: product.id,
        status: 0,  // 0表示首页商品
        productName: product.name,
        imgUrl: product.indexPic
      }
    })
    
    if (result.code === 200) {
      // 添加成功，刷新首页商品列表
      await loadHomeProducts()
      console.log('首页商品添加成功，刷新后数量:', selectedProducts.value.length)
      
      uni.showToast({
        title: '添加首页商品成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: result.message || '添加失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('添加首页商品失败:', error)
    uni.showToast({
      title: '添加失败: ' + (error.message || '未知错误'),
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 删除轮播图商品
const deleteBanner = async (id, silent = false) => {
  try {
    if (!silent) {
      uni.showLoading({ title: '删除中...' })
    }
    
    // 调用API删除轮播图，使用id而不是productId
    const result = await request({
      url: `https://bgnc.online/api/productmarket/${id}`,
      method: 'DELETE',
    })
    
    if (result.code === 200) { 
      // 删除成功后，刷新轮播图列表
      await loadBanners()
      
      if (!silent) {
        uni.showToast({
          title: '已从轮播图移除',
          icon: 'success'
        })
      }
    } else {
      if (!silent) {
        uni.showToast({
          title: result.message || '删除失败',
          icon: 'none'
        })
      }
    }
  } catch (error) {
    console.error('删除轮播图失败:', error)
    if (!silent) {
      uni.showToast({
        title: '删除失败: ' + (error.message || '未知错误'),
        icon: 'none'
      })
    }
  } finally {
    if (!silent) {
      uni.hideLoading()
    }
  }
}

// 删除首页商品
const deleteHomeProduct = async (id, silent = false) => {
  try {
    if (!silent) {
      uni.showLoading({ title: '删除中...' })
    }
    
    // 调用API删除首页商品，使用id而不是productId
    const result = await request({
      url: `https://bgnc.online/api/productmarket/${id}`,
      method: 'DELETE',
    })
    
    if (result.code === 200) {
      // 删除成功后，刷新首页商品列表
      await loadHomeProducts()
      
      if (!silent) {
        uni.showToast({
          title: '已从首页移除',
          icon: 'success'
        })
      }
    } else {
      if (!silent) {
        uni.showToast({
          title: result.message || '删除失败',
          icon: 'none'
        })
      }
    }
  } catch (error) {
    console.error('删除首页商品失败:', error)
    if (!silent) {
      uni.showToast({
        title: '删除失败: ' + (error.message || '未知错误'),
        icon: 'none'
      })
    }
  } finally {
    if (!silent) {
      uni.hideLoading()
    }
  }
}
</script>

<style lang="scss">
.home-manage {
  padding: 30rpx;
  
  .header {
    margin-bottom: 30rpx;
    
    .title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .description {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .section {
    margin-bottom: 40rpx;
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .section-desc {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 30rpx;
    }
  }
  
  .selected-products {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10rpx;
    
    .selected-product-item {
      width: calc(33.33% - 20rpx);
      margin: 10rpx;
      background-color: #f9f9f9;
      border-radius: 8rpx;
      padding: 20rpx;
      position: relative;
      
      .product-thumb {
        width: 100%;
        height: 160rpx;
        border-radius: 6rpx;
        margin-bottom: 16rpx;
      }
      
      .product-name {
        font-size: 26rpx;
        color: #333;
        line-height: 1.4;
        height: 72rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .remove-btn {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        width: 50rpx;
        height: 50rpx;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 25rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .empty-selection {
      width: 100%;
      padding: 60rpx 0;
      text-align: center;
      color: #999;
      font-size: 28rpx;
    }
  }
  
  .search-area {
    display: flex;
    margin-bottom: 30rpx;
    
    .search-box {
      flex: 1;
      height: 80rpx;
      background-color: #f5f7fa;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      margin-right: 20rpx;
      
      input {
        flex: 1;
        height: 80rpx;
        font-size: 28rpx;
        margin-left: 16rpx;
      }
    }
    
    .search-btn {
      width: 160rpx;
      height: 80rpx;
      background-color: #4a90e2;
      color: #fff;
      font-size: 28rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .product-list {
    .product-item {
      display: flex;
      padding: 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .product-thumb {
        width: 120rpx;
        height: 120rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
      }
      
      .product-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .product-name {
          font-size: 28rpx;
          color: #333;
          line-height: 1.4;
          margin-bottom: 10rpx;
        }
        
        .product-price {
          font-size: 30rpx;
          color: #ff6b00;
          font-weight: 500;
        }
      }
      
      .product-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        
        .action-btn {
          width: 160rpx;
          height: 60rpx;
          border-radius: 30rpx;
          font-size: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10rpx;
          
          &:disabled {
            background-color: #e0e0e0 !important;
            color: #999 !important;
            cursor: not-allowed;
            opacity: 0.7;
          }
          
          &.banner-btn {
            background-color: #4a90e2;
            color: #fff;
          }
          
          &.home-btn {
            background-color: #ff9500;
            color: #fff;
          }
        }
      }
    }
    
    .empty-list {
      padding: 60rpx 0;
      text-align: center;
      color: #999;
      font-size: 28rpx;
    }
  }
  
  .refresh-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border-radius: 6rpx;
    padding: 12rpx 20rpx;
    margin: 20rpx 0;
    width: fit-content;
    
    text {
      font-size: 24rpx;
      color: #4a90e2;
      margin-left: 8rpx;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style> 