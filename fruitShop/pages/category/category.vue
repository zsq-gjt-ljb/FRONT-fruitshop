<template>
  <view class="category-container">
    <view class="category-sidebar">
      <!-- 左侧分类菜单 -->
      <scroll-view scroll-y class="sidebar-scroll">
        <view 
          v-for="(item, index) in categories" 
          :key="item.id"
          :class="['sidebar-item', currentCategoryId === item.id ? 'active' : '']"
          @tap="selectCategory(item)"
        >
          <text class="category-name">{{ item.name }}</text>
        </view>
      </scroll-view>
    </view>
    <view class="category-content">
      <!-- 右侧商品列表 -->
      <view class="header">
        <view class="title">南茶北果分类</view>
        <view class="description">发现更多优质商品</view>
      </view>
      
      <view class="content-header">
        <text class="current-category">{{ currentCategory?.name || '全部商品' }}</text>
      </view>
      
      <!-- 添加加载状态显示 -->
      <view class="loading-container" v-if="isLoading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view class="product-grid" v-else>
        <view 
          v-for="(product, index) in productList" 
          :key="product.id"
          class="product-item"
          @tap="goToDetail(product.id)"
        >
          <image :src="product.indexPic || '/static/images/default-product.png'" mode="aspectFill" class="product-image"></image>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">{{ product.price || '暂无价格' }}</text>
          </view>
        </view>
        
        <view v-if="productList.length === 0" class="empty-tip">
          <image src="/static/images/empty-cart.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">该分类暂无商品，敬请期待</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 响应式数据
const categories = ref([])
const currentCategory = ref(null)
const currentCategoryId = ref('')
const productList = ref([])
const isLoading = ref(false)

// 我们需要确保onShow钩子在uni-app环境中正确运行
onShow(() => {
  console.log('分类页面显示');
  try {
    // 检查是否有从首页传来的选中分类ID
    const selectedId = uni.getStorageSync('selectedCategoryId');
    console.log('读取到的分类ID:', selectedId);
    
    if (selectedId) {
      // 将ID转为字符串确保比较一致
      currentCategoryId.value = String(selectedId);
      console.log('设置当前分类ID:', currentCategoryId.value);
      
      // 如果已经加载了分类列表
      if (categories.value && categories.value.length > 0) {
        console.log('查找匹配分类...');
        // 查找匹配的分类
        const category = categories.value.find(item => String(item.id) === String(selectedId));
        if (category) {
          console.log('找到匹配分类:', category.name);
          // 选中该分类
          selectCategory(category);
        } else {
          console.log('未找到匹配分类');
          // 重新加载分类列表
          getCategories();
        }
      } else {
        console.log('分类列表为空，开始加载分类');
        // 如果分类尚未加载，加载分类列表
        getCategories();
      }
    }
  } catch (e) {
    console.error('读取选中分类ID失败:', e);
  }
});

// 获取分类列表
const getCategories = async () => {
  try {
    isLoading.value = true
    const res = await request({
      url: 'http://82.156.12.240:8080/api/category/list',
      method: 'GET'
    })
    
    console.log('分类数据返回:', res)
    if (res.code === 200) {
      categories.value = res.data 
      console.log('categories.value', categories.value)
      
      // 检查是否有预选分类ID
      if (currentCategoryId.value) {
        console.log('处理预选分类ID:', currentCategoryId.value);
        // 将两个ID都转为字符串进行比较
        const category = categories.value.find(item => String(item.id) === String(currentCategoryId.value));
        if (category) {
          console.log('找到匹配的分类:', category.name);
          selectCategory(category);
          // 使用后清除
          setTimeout(() => {
            uni.removeStorageSync('selectedCategoryId');
            console.log('已清除预选分类ID');
          }, 500);
          return;
        } else {
          console.log('未找到匹配的分类');
        }
      }
      
      // 默认选中第一个分类
      if (categories.value.length > 0) {
        selectCategory(categories.value[0])
      }
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 选择分类
const selectCategory = (category) => {
  console.log('选择分类:', category.name, category.id);
  currentCategory.value = category
  currentCategoryId.value = category.id
  getProductsByCategory(category.id)
}

// 根据分类获取商品
const getProductsByCategory = async (categoryId) => {
  try {
    isLoading.value = true
    productList.value = [] // 清空之前的商品列表
    const res = await request({
      url: `http://82.156.12.240:8080/api/product/list?categoryId=${categoryId}`,
      method: 'GET'
    })
    
    console.log('分类商品返回:', res)
    if (res.code === 200) {
      productList.value = res.data
      
      // 处理商品价格 - 从SKUs中提取第一个价格作为显示价格
      productList.value = productList.value.map(product => {
        if (product.skus && product.skus.length > 0) {
          product.price = product.skus[0].price
        }
        return product
      })
    }
  } catch (error) {
    console.error('获取分类商品失败：', error)
    uni.showToast({
      title: '获取商品失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 跳转到商品详情
const goToDetail = (productId) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${productId}`
  })
  console.log('跳转到商品详情:', productId)
}

// 在组件挂载时加载分类数据
onMounted(() => {
  console.log('分类页面已挂载')
  getCategories()
})
</script>

<style lang="scss">
.category-container {
  display: flex;
  min-height: 100vh;
  
  .category-sidebar {
    width: 200rpx;
    background-color: #f5f7fa;
    
    .sidebar-scroll {
      height: 100vh;
    }
    
    .sidebar-item {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #eee;
      position: relative;
      transition: all 0.3s ease;
      
      &.active {
        background-color: #fff;
        color: #4a90e2;
        font-weight: 500;
        
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 30%;
          height: 40%;
          width: 6rpx;
          background-color: #4a90e2;
          border-radius: 0 3rpx 3rpx 0;
        }
      }
      
      .category-name {
        font-size: 28rpx;
        padding: 0 10rpx;
        text-align: center;
        transition: transform 0.2s ease;
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
  
  .category-content {
    flex: 1;
    background-color: #fff;
    padding: 20rpx;
    
    .header {
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 20rpx;
      
      .title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }
      
      .description {
        font-size: 28rpx;
        color: #999;
        margin-top: 6rpx;
      }
    }
    
    .content-header {
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 20rpx;
      
      .current-category {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        position: relative;
        padding-left: 24rpx;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8rpx;
          height: 28rpx;
          background-color: #4a90e2;
          border-radius: 4rpx;
        }
      }
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;
      
      .loading-spinner {
        width: 60rpx;
        height: 60rpx;
        border: 4rpx solid #f3f3f3;
        border-top: 4rpx solid #4a90e2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20rpx;
      }
      
      .loading-text {
        font-size: 28rpx;
        color: #999;
      }
    }
    
    .product-grid {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -10rpx;
      
      .product-item {
        width: calc(50% - 20rpx);
        margin-bottom: 20rpx;
        background-color: #fff;
        border-radius: 12rpx;
        overflow: hidden;
        margin: 0 10rpx 20rpx;
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        
        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.03);
        }
        
        .product-image {
          width: 100%;
          height: 320rpx;
          object-fit: cover;
          background-color: #f9f9f9; /* 图片加载前的背景色 */
        }
        
        .product-info {
          padding: 16rpx;
          
          .product-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 10rpx;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.4;
            height: 78rpx;
          }
          
          .product-price {
            font-size: 32rpx;
            color: #ff6b00;
            font-weight: bold;
            display: flex;
            align-items: center;
            
            &::before {
              content: '¥';
              font-size: 24rpx;
              margin-right: 2rpx;
              font-weight: normal;
            }
          }
        }
      }
      
      .empty-tip {
        width: 100%;
        padding: 100rpx 0;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .empty-image {
          width: 200rpx;
          height: 200rpx;
          margin-bottom: 20rpx;
          opacity: 0.5;
        }
        
        .empty-text {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 