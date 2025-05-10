<template>
  <view class="home-container">
    
    <!-- 轮播图区 -->
    <view class="banner-wrapper">
      <swiper 
        class="banner-swiper" 
        indicator-dots
        autoplay 
        circular
        :interval="3000" 
        :duration="500"
        :indicator-color="'rgba(255,255,255,0.5)'"
        :indicator-active-color="'#FF6B6B'"
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="banner.id" @tap="goToDetail(banner.productId)">
          <image :src="banner.indexPic" mode="aspectFill" class="banner-image"></image>
          <view class="banner-content">
            <view class="banner-info">
              <text class="banner-name">{{ banner.name }}</text>
              <!-- <view class="banner-btn">
                <text>查看</text>
                <uni-icons type="arrowright" size="12" color="#fff"></uni-icons>
              </view> -->
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    
  
    
    <!-- 品牌承诺部分 -->
    <view class="promise-section">
      <view class="promise-inner">
        <view class="promise-item">
          <view class="promise-icon-bg">
            <image src="/static/icons/medal.png" class="promise-icon"></image>
          </view>
          <text>品质甄选</text>
        </view>
        <view class="divider"></view>
        <view class="promise-item">
          <view class="promise-icon-bg">
            <image src="/static/icons/exchange.png" class="promise-icon"></image>
          </view>
          <text>安心食材</text>
        </view>
        <view class="divider"></view>
        <view class="promise-item">
          <view class="promise-icon-bg">
            <image src="/static/icons/quality.png" class="promise-icon"></image>
          </view>
          <text>无忧退换</text>
        </view>
      </view>
    </view>
    
   
    <view class="category-section">
      <view class="section-header">
        <view class="section-title">
          <text>商品分类</text>
        </view>
        <text class="view-more" @tap="navigateToAllCategories">全部分类 ></text>
      </view>
      
      <view class="category-grid">
        <view 
          v-for="(category, index) in categories.slice(0, 8)" 
          :key="category.id"
          class="category-item"
          @tap="navigateToCategory(category)"
        >
          <view class="category-icon-wrapper">
            <image :src="category.image || '/static/images/category-default.png'" mode="aspectFill" class="category-image"></image>
          </view>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 首页推荐商品 -->
    <view class="featured-section">
      <view class="section-header">
        <view class="section-title">
          <text>精品推荐</text>
        </view>
        
      </view>
      
      <view class="product-grid">
        <view 
          v-for="(product, index) in homeProducts" 
          :key="product.id"
          class="product-item"
          @tap="goToDetail(product.productId)"
        >
          <view class="product-image-wrapper">
            <image :src="product.indexPic" mode="aspectFill" class="product-image"></image>
            <view class="product-tag" v-if="index < 2">精选</view>
          </view>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <view class="product-meta">
              <text class="product-price">¥{{ product.price || '暂无价格' }}</text>
              <view class="cart-btn" @tap.stop="showQuickBuy(product)">
                <uni-icons type="cart" size="16" color="#fff"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加悬浮客服按钮 -->
    <FloatingContact 
      :bottom="150"
      :right="30"
      @contact="handleContactEvent"
    />
    
    <!-- 底部品牌 -->
    <view class="footer">
      <view class="footer-logo">
        <text class="logo-text">北果南茶</text>
      </view>
      <view class="footer-slogan">品质生活 自然美味</view>
      <view class="footer-copyright">© 2023 北果南茶 All Rights Reserved</view>
    </view>
    
    <!-- 规格选择弹窗 - 高级设计 -->
    <view class="specs-popup" v-if="showSpecs">
      <view class="popup-mask" @tap="hideSpecsPopup"></view>
      <view class="popup-content">
        <!-- 弹窗头部 -->
        <view class="popup-header">
          <view class="product-brief">
            <image :src="currentProduct.image" mode="aspectFill" class="popup-image"></image>
            <view class="brief-info">
              <view class="popup-price">¥{{ currentProduct.price }} <text class="popup-original-price" v-if="currentProduct.originalPrice">¥{{ currentProduct.originalPrice }}</text></view>
              <view class="popup-stock">库存 · {{ currentProduct.stock || 0 }}</view>
              <view class="popup-selected">已选 · {{ selectedSpec }}</view>
            </view>
          </view>
          <view class="close-btn" @tap="hideSpecsPopup">
            <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <!-- 规格选择区域 -->
        <view class="specs-section">
          <view class="specs-title">规格</view>
          <view class="specs-options">
            <view 
              v-for="(spec, index) in currentProduct.specs" 
              :key="index"
              :class="['spec-option', selectedSpecIndex === index ? 'active' : '']"
              @tap="selectSpec(index)"
            >
              {{ spec.name }}
            </view>
          </view>
        </view>
        
        <!-- 数量调整区域 -->
        <view class="quantity-section">
          <view class="quantity-title">数量</view>
          <view class="quantity-adjuster">
            <view 
              :class="['quantity-btn', 'minus', quantity <= 1 ? 'disabled' : '']" 
              @tap="decreaseQuantity"
            >-</view>
            <input 
              type="number" 
              v-model.number="quantity" 
              class="quantity-input"
              @blur="validateQuantity"
            />
            <view 
              :class="['quantity-btn', 'plus', quantity >= currentProduct.stock ? 'disabled' : '']" 
              @tap="increaseQuantity"
            >+</view>
          </view>
        </view>
        
        <!-- 弹窗底部操作按钮 -->
        <view class="popup-actions">
          <view class="action-btn add-to-cart" @tap="addToCartWithSpec">加入购物车</view>
          <view class="action-btn buy-now" @tap="buyNow">立即购买</view>
        </view>
      </view>
    </view>

    <!-- 添加快速购买弹窗 -->
    <view class="quick-buy-popup" v-if="showQuickBuyPopup">
      <view class="popup-mask" @tap="hideQuickBuyPopup"></view>
      <view class="popup-content">
        <!-- 弹窗头部 - 商品信息 -->
        <view class="popup-header">
          <image :src="quickBuyProduct.indexPic" mode="aspectFill" class="product-thumb"></image>
          <view class="header-right">
            <view class="popup-price">¥ {{ quickBuyProduct.price }}</view>
            <view class="popup-stock">库存：{{ quickBuyProduct.stock || 1000 }}</view>
            <view class="popup-selected">已选规格：{{ selectedSpec }}</view>
          </view>
          <view class="close-btn" @tap="hideQuickBuyPopup">
            <uni-icons type="close" size="16" color="#666"></uni-icons>
          </view>
        </view>
        
        <!-- 规格选择区 -->
        <view class="popup-section">
          <view class="section-title">规格</view>
          <view class="specs-list">
            <view 
              v-for="(spec, index) in productSpecs" 
              :key="index" 
              :class="['spec-item', selectedSpecIndex === index ? 'active' : '']"
              @tap="selectSpec(index)"
            >
              {{ spec.name }} 
              <text class="spec-price" v-if="spec.price">¥{{ spec.price }}</text>
              <text class="spec-stock" v-if="spec.stock !== undefined">(库存:{{ spec.stock }})</text>
            </view>
          </view>
        </view>
        
        <!-- 数量选择区 -->
        <view class="popup-section">
          <view class="section-title">购买数量：</view>
          <view class="quantity-control">
            <view class="quantity-btn minus" @tap="decreaseQuantity">−</view>
            <input type="number" class="quantity-input" v-model.number="quantity" @blur="validateQuantity" />
            <view class="quantity-btn plus" @tap="increaseQuantity">+</view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <view class="action-btn cart-btn" @tap="addToCartWithSpec">加入购物车</view>
          <view class="action-btn buy-btn" @tap="buyNow">立即购买</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, defineExpose } from 'vue'
import request from '@/utils/request'
import FloatingContact from '@/components/FloatingContact.vue'

// 状态数据
const bannerList = ref([])      // 轮播图数据
const categories = ref([])      // 分类数据
const homeProducts = ref([])    // 首页推荐商品数据
const isLoading = ref(false)    // 加载状态

// 加载轮播图数据
const loadBanners = async () => {
  try {
    console.log('开始加载轮播图数据')
    const result = await request({
      url: 'https://bgnc.online/api/product/market/1',
      method: 'GET'
    })
    
    console.log('轮播图API返回结果:', result)
    if (result.code === 200) {
      console.log('轮播图数据:', result.data)
      bannerList.value = (result.data || []).map(item => ({
        id: item.id,
        productId: item.id,
        name: item.productName || '',
        indexPic: item.indexPic || ''
      }))
      console.log('处理后的轮播图数据:', bannerList.value)
    } else {
      console.error('获取轮播图失败:', result.message)
      bannerList.value = []
    }
  } catch (error) {
    console.error('加载轮播图出错:', error)
    bannerList.value = []
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    console.log('开始加载分类数据')
    const result = await request({
      url: 'https://bgnc.online/api/category/list',
      method: 'GET'
    })
    
    console.log('分类API返回结果:', result)
    if (result.code === 200) {
      console.log('分类数据:', result.data)
      categories.value = result.data || []
      
      // 为分类添加默认图片 - 使用自定义图标
      const categoryIcons = [
       '/static/images/category-fruit.png',
 '/static/images/category-tea.png',
 '/static/images/category-leaf.png',
 '/static/images/category-dried.png',  
 '/static/images/category-snack.png',
'/static/images/category-digi.png',
'/static/images/category-gift.png',
 '/static/images/category-feature.png'
        
        
      ]
      
      categories.value = categories.value.map((cat, index) => ({
        ...cat,
        image: categoryIcons[index % categoryIcons.length]
      }))
      
      console.log('处理后的分类数据:', categories.value)
    } else {
      console.error('获取分类失败:', result.message)
      categories.value = []
    }
  } catch (error) {
    console.error('加载分类出错:', error)
    categories.value = []
  }
}

// 加载首页推荐商品
const loadHomeProducts = async () => {
  try {
    console.log('开始加载首页推荐商品')
    const result = await request({
      url: 'https://bgnc.online/api/product/market/0',
      method: 'GET'
    })
    
    console.log('首页商品API返回结果:', result)
    if (result.code === 200) {
      console.log('首页商品数据:', result.data)
      homeProducts.value = (result.data || []).map(item => ({
        id: item.id,
        productId: item.id,
        name: item.name || '',
        indexPic: item.indexPic || '',
        price: item.price || '暂无价格'
      }))
      console.log('处理后的首页商品数据:', homeProducts.value)
    } else {
      console.error('获取首页商品失败:', result.message)
      homeProducts.value = []
    }
  } catch (error) {
    console.error('加载首页商品出错:', error)
    homeProducts.value = []
  }
}

// 初始化加载所有数据
const initData = async () => {
  isLoading.value = true
  try {
    console.log('开始初始化首页数据')
    // 依次加载数据，确保每个请求都能正确执行
    await loadBanners()
    await loadCategories()
    await loadHomeProducts()
    
    console.log('首页数据加载完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 导航到商品详情页
const goToDetail = (productId) => {
  if (!productId) {
    console.error('无效的商品ID')
    return
  }
  
  console.log('首页跳转到商品详情，ID:', productId)
  const id = typeof productId === 'object' ? productId.id : productId
  
  uni.navigateTo({
    url: `/pages/detail/detail?id=${id}`,
    success: (res) => {
      console.log('跳转成功:', res)
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.navigateTo({
        url: '/pages/detail/detail',
        success: function(res) {
          res.eventChannel.emit('acceptDataFromOpener', { id: id })
        }
      })
    }
  })
}

// 根据ID导航到分类页面 
const navigateToCategoryById = (categoryId, categoryName) => {
  console.log('跳转到分类页面:', categoryId, categoryName);
  
  // 只存储必要的ID信息
  uni.setStorageSync('selectedCategoryId', categoryId);
  
  // 直接跳转
  uni.switchTab({
    url: '/pages/category/category'
  });
}

// 导航到分类页面 - 将所有旧代码删除，使用新函数统一处理
const navigateToCategory = (category) => {
  // 直接调用统一的跳转函数
  navigateToCategoryById(category.id, category.name);
}

// 跳转到全部分类
const navigateToAllCategories = () => {
  // 清除选中的分类ID，显示全部分类
  uni.removeStorageSync('selectedCategoryId');
  uni.switchTab({
    url: '/pages/category/category'
  });
}

// 导航到搜索页面
const navigateToSearch = () => {
  uni.navigateTo({
    url: '/pages/search/search'
  })
}

// 添加到购物车
const addToCart = (product) => {
  // 显示规格选择弹窗
  showQuickBuy(product)
}

// 生命周期钩子 - 组件挂载时加载数据
onMounted(() => {
  console.log('首页组件已挂载')
  initData()
})

// 在页面显示时刷新数据 - 使用uni-app的页面生命周期函数
// 在setup中使用生命周期钩子时，不需要导入，直接赋值给同名变量
const onShow = () => {
  console.log('首页显示，刷新数据')
  initData()
}

// 规格选择弹窗相关逻辑
const showSpecs = ref(false)
const currentProduct = ref({})
const selectedSpecIndex = ref(0)
const quantity = ref(1)

// 选中的规格名称
const selectedSpec = computed(() => {
  if (currentProduct.value.specs && currentProduct.value.specs.length > 0) {
    return currentProduct.value.specs[selectedSpecIndex.value].name
  }
  return '默认规格'
})

// 显示规格选择弹窗
const showSpecsPopup = (product) => {
  currentProduct.value = product
  selectedSpecIndex.value = 0
  quantity.value = 1
  showSpecs.value = true
}

// 隐藏规格选择弹窗
const hideSpecsPopup = () => {
  showSpecs.value = false
}

// 选择规格
const selectSpec = (index) => {
  selectedSpecIndex.value = index
  
  // 更新选中的规格名称
  if (productSpecs.value[index]) {
    selectedSpec.value = productSpecs.value[index].name
    
    // 找到对应的SKU，更新价格和库存以及SKU ID
    if (productSkuList.value.length > 0) {
      const selectedSku = productSkuList.value.find(sku => 
        sku.spData.includes(productSpecs.value[index].id + ':' + productSpecs.value[index].value)
      )
      
      if (selectedSku) {
        quickBuyProduct.value.price = selectedSku.price
        quickBuyProduct.value.stock = selectedSku.stock
        selectedSkuId.value = selectedSku.id // 更新选中的SKU ID
        
        // 检查数量是否超过库存
        if (quantity.value > selectedSku.stock) {
          quantity.value = selectedSku.stock > 0 ? selectedSku.stock : 1
        }
      }
    }
  }
}

// 增加数量
const increaseQuantity = () => {
  if (quantity.value < (currentProduct.value.stock || 999)) {
    quantity.value++
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 验证数量是否有效
const validateQuantity = () => {
  const stock = currentProduct.value.stock || 999
  if (isNaN(quantity.value) || quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > stock) {
    quantity.value = stock
  }
}

// 添加到购物车（带规格）
const addToCartWithSpec = async () => {
  // 检查是否选择了有效的SKU
  if (!selectedSkuId.value) {
    uni.showToast({
      title: '请选择有效的规格',
      icon: 'none'
    })
    return
  }
  
  try {
    // 准备要提交的数据
    const cartData = {
      skuId: selectedSkuId.value,
      productId: quickBuyProduct.value.id,
      quantity: quantity.value
    }
    
    console.log('添加到购物车数据:', cartData)
    
    // 发送请求添加到购物车
    const result = await request({
      url: 'https://bgnc.online/api/cart/add',
      method: 'POST',
      data: cartData
    })
    
    if (result.code === 200) {
      // 添加成功
      uni.showToast({
        title: '已添加到购物车',
        icon: 'success'
      })
      
      // 关闭弹窗
      hideQuickBuyPopup()
    } else {
      uni.showToast({
        title: result.message || '添加失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('添加到购物车出错:', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  }
}

// 立即购买
const buyNow = () => {
  if (!selectedSpec ) {
    showSpecsPopup()
    return
  }
  
  // 创建结算项
  const checkoutItem = {
    productId: quickBuyProduct.value.id,
    productName: quickBuyProduct.value.name,
    productImage: quickBuyProduct.value.indexPic,
    price: quickBuyProduct.value.price,
    quantity: quantity.value,
    skuId: selectedSkuId.value || '',
    spec: selectedSpec.value || ''
  }
  
  // 保存到本地存储
  uni.setStorageSync('checkoutItems', JSON.stringify([checkoutItem]))
  
  // 跳转到结算页面
  uni.navigateTo({
    url: '/pages/checkout/checkout?type=buyNow'
  })
}

// 快速购买弹窗相关状态
const showQuickBuyPopup = ref(false)
const quickBuyProduct = ref({})
const productSpecs = ref([])
const productSkuList = ref([]) // 存储商品的SKU列表
const selectedSkuId = ref('') // 存储选中的SKU ID

// 显示快速购买弹窗
const showQuickBuy = async (product) => {
  console.log('显示快速购买弹窗:', product)
  
  // 设置初始商品信息
  quickBuyProduct.value = {
    ...product,
    stock: 0 // 默认设置为0，后续从SKU中获取
  }
  
  // 重置选择的规格和数量
  selectedSpecIndex.value = 0
  quantity.value = 1
  productSpecs.value = []
  productSkuList.value = []
  selectedSkuId.value = '' // 重置选中的SKU ID
  
  // 获取商品详情和规格数据
  try {
    const result = await request({
      url: `https://bgnc.online/api/product/${product.id}`,
      method: 'GET'
    })
    
    if (result.code === 200 && result.data) {
      // 更新商品详情
      console.log('获取到商品详情:', result.data)
      
      // 处理SKU列表数据
      if (result.data.skuList && result.data.skuList.length > 0) {
        productSkuList.value = result.data.skuList
        
        // 提取规格信息
        const specMap = new Map()
        
        // 解析规格数据并去重
        result.data.skuList.forEach(sku => {
          if (sku.spData) {
            // 假设spData格式为"规格ID:规格值"
            const specs = sku.spData.split(';') // 处理可能的多规格情况
            
            specs.forEach(spec => {
              const [specId, specValue] = spec.split(':')
              if (!specMap.has(specValue)) {
                specMap.set(specValue, {
                  id: specId,
                  value: specValue,
                  name: `规格${specValue}`, // 可根据需要修改规格名称
                  price: sku.price,
                  stock: sku.stock,
                  skuId: sku.id // 存储SKU ID
                })
              }
            })
          }
        })
        
        // 转换为数组
        productSpecs.value = Array.from(specMap.values())
        
        // 如果有规格，设置默认选中第一个规格
        if (productSpecs.value.length > 0) {
          selectedSpec.value = productSpecs.value[0].name
          
          // 设置对应规格的库存和价格
          const defaultSku = productSkuList.value.find(sku => 
            sku.spData.includes(productSpecs.value[0].id + ':' + productSpecs.value[0].value)
          )
          
          if (defaultSku) {
            quickBuyProduct.value.stock = defaultSku.stock
            quickBuyProduct.value.price = defaultSku.price
            selectedSkuId.value = defaultSku.id // 存储选中的SKU ID
          }
        } else {
          // 如果没有规格数据，使用第一个SKU的信息
          if (productSkuList.value[0]) {
            quickBuyProduct.value.stock = productSkuList.value[0].stock
            quickBuyProduct.value.price = productSkuList.value[0].price
            selectedSkuId.value = productSkuList.value[0].id // 存储第一个SKU ID
            selectedSpec.value = '默认规格'
          }
        }
      } else {
        // 没有SKU数据时的处理
        productSpecs.value = [{ name: '默认规格', price: product.price, stock: 100 }]
        selectedSpec.value = '默认规格'
        quickBuyProduct.value.stock = 100 // 默认库存
      }
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    // 出错时设置默认规格
    productSpecs.value = [{ name: '默认规格', price: product.price, stock: 100 }]
    selectedSpec.value = '默认规格'
    quickBuyProduct.value.stock = 100 // 默认库存
  }
  
  // 显示弹窗
  showQuickBuyPopup.value = true
}

// 隐藏快速购买弹窗
const hideQuickBuyPopup = () => {
  showQuickBuyPopup.value = false
}

// 处理联系客服事件
const handleContactEvent = () => {
  console.log('联系客服事件被触发')
  // 在这里可以添加联系客服的逻辑
}

// 分享配置
const onShareAppMessage = (res) => {
  return {
    title: '北果南茶 - 新鲜水果，健康生活',
    path: '/pages/index/index',
    imageUrl: homeProducts.value[0]?.indexPic || '/static/images/share.png'
  }
}

// 分享到朋友圈
const onShareTimeline = () => {
  return {
    title: '北果南茶 - 新鲜水果，健康生活',
    query: '',
    imageUrl: homeProducts.value[0]?.indexPic || '/static/images/share.png'
  }
}

// 导出分享方法
defineExpose({
  onShareAppMessage,
  onShareTimeline
})
</script>

<style lang="scss">
.home-container {
  min-height: 100vh;
  background-color: #f7f9fc;
  background-image: linear-gradient(to bottom, #f0f5ff, #f7f9fc);
  
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 15% 15%, rgba(75, 145, 241, 0.03) 5%, transparent 10%),
      radial-gradient(circle at 85% 45%, rgba(255, 107, 107, 0.03) 5%, transparent 10%),
      radial-gradient(circle at 45% 75%, rgba(140, 198, 63, 0.03) 8%, transparent 15%);
    z-index: 0;
    pointer-events: none;
  }
  
  .feature-icons, .promise-section, .category-section, .featured-section {
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 24rpx;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.03);
    overflow: hidden;
  }
  
  // 顶部标题栏
  .header-section {
    background: linear-gradient(135deg, #4B91F1, #6FB1FF);
    padding: 15rpx 30rpx;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: "";
      position: absolute;
      top: -50rpx;
      right: -50rpx;
      width: 200rpx;
      height: 200rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }
    
    &::after {
      content: "";
      position: absolute;
      bottom: -80rpx;
      left: -60rpx;
      width: 250rpx;
      height: 250rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
    }
    
    .brand-simple {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      
      .brand-logo-img {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
      
      .brand-name-text {
        color: #fff;
        font-size: 32rpx;
        font-weight: 600;
        letter-spacing: 1rpx;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  // 轮播图区
  .banner-wrapper {
    margin: 0 0 30rpx;
    position: relative;
    z-index: 2;
    overflow: hidden;
    
    .banner-swiper {
      height: 600rpx;
      width: 100%;
      
      .banner-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .banner-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
        padding: 80rpx 40rpx 40rpx;
        display: flex;
        align-items: flex-end;
        
        .banner-info {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .banner-name {
          color: #ffffff;
          font-size: 34rpx;
          font-weight: 600;
          text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
          max-width: 70%;
        }
        
        .banner-btn {
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          color: #fff;
          font-size: 24rpx;
          padding: 12rpx 24rpx;
          border-radius: 40rpx;
          font-weight: 500;
          box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          
          text {
            margin-right: 6rpx;
          }
        }
      }
    }
  }
  
  // 品牌特色分类
  .feature-icons {
    margin: 0 24rpx 24rpx;
    padding: 24rpx;
    
    .feature-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 20rpx;
      text-align: center;
      position: relative;
      
      &::after {
        content: "";
        position: absolute;
        bottom: -8rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 50rpx;
        height: 3rpx;
        background: linear-gradient(to right, #4B91F1, #6FB1FF);
        border-radius: 2rpx;
      }
    }
    
    .feature-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      padding: 10rpx 0;
      
      .feature-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 33.33%;
        margin-bottom: 20rpx;
        
        .feature-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 40rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10rpx;
          box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
          
          &.fruit {
            background: linear-gradient(135deg, #FFD700, #FFA500);
          }
          
          &.season {
            background: linear-gradient(135deg, #52E93A, #00C86F);
          }
          
          &.import {
            background: linear-gradient(135deg, #FF5E7A, #FF3355);
          }
          
          &.tea {
            background: linear-gradient(135deg, #8B5CFF, #5856D6);
          }
          
          &.nuts {
            background: linear-gradient(135deg, #FF7043, #FF3B30);
          }
          
          &.gift {
            background: linear-gradient(135deg, #4B91F1, #6FB1FF);
          }
        }
        
        .feature-text {
          font-size: 24rpx;
          color: #333;
          text-align: center;
        }
      }
    }
  }
  
  // 品牌承诺部分
  .promise-section {
    margin: 0 24rpx 24rpx;
    padding: 24rpx 0;
  }
  
  .promise-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .promise-item {
    display: flex;
    align-items: center;
    color: #444;
    font-size: 26rpx;
    padding: 0 30rpx;
    
    .promise-icon-bg {
      width: 44rpx;
      height: 44rpx;
      border-radius: 50%;
      background-color: rgba(75, 145, 241, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10rpx;
      flex-shrink: 0;
      overflow: hidden;
      
      .promise-icon {
        width: 24rpx;
        height: 24rpx;
        display: block;
      }
    }
    
    text {
      margin-left: 8rpx;
      font-size: 26rpx;
      line-height: 1;
      display: flex;
      align-items: center;
      height: 44rpx;
    }
  }
  
  .divider {
    width: 2rpx;
    height: 30rpx;
    background-color: rgba(75, 145, 241, 0.2);
  }
  
  // 分类部分
  .category-section {
    margin: 0 24rpx 24rpx;
    padding: 24rpx;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      position: relative;
      padding-left: 16rpx;
      
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 6rpx;
        width: 6rpx;
        height: 28rpx;
        background: linear-gradient(to bottom, #4B91F1, #6FB1FF);
        border-radius: 3rpx;
      }
    }
    
    .view-more {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .category-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 20rpx;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 25%;
      margin-bottom: 30rpx;
      
      .category-icon-wrapper {
        width: 120rpx;
        height: 120rpx;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        margin-bottom: 16rpx;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
        border: 4rpx solid rgba(255, 255, 255, 0.8);
        transition: all 0.3s ease;
        
        .category-image {
          width: 70%;
          height: 70%;
          transition: transform 0.3s ease;
        }

        &:active {
          transform: scale(0.95);
          .category-image {
            transform: scale(0.95);
          }
        }
      }
      
      .category-name {
        font-size: 24rpx;
        color: #333;
        text-align: center;
        font-weight: 500;
      }
    }
  }
  
  // 推荐商品部分
  .featured-section {
    margin: 0 24rpx 24rpx;
    padding: 24rpx;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      position: relative;
      padding-left: 16rpx;
      
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 6rpx;
        width: 6rpx;
        height: 28rpx;
        background: linear-gradient(to bottom, #FF6B6B, #FF8E8E);
        border-radius: 3rpx;
      }
    }
    
    .view-more {
      font-size: 24rpx;
      color: #999;
      background-color: rgba(75, 145, 241, 0.05);
      padding: 6rpx 14rpx;
      border-radius: 20rpx;
    }
  }
  
  .product-grid {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 10rpx 0 20rpx;
    justify-content: space-between;
    position: relative;
    z-index: 2;
    
    .product-item {
      display: flex;
      flex-direction: column;
      width: 48%;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      border: 1rpx solid rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease;
      
      &:active {
        transform: scale(0.98);
      }
      
      &:nth-child(odd) {
        margin-right: 0;
      }
      
      .product-image-wrapper {
        width: 100%;
        height: 260rpx;
        position: relative;
        overflow: hidden;
        
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        &:hover .product-image {
          transform: scale(1.05);
        }
        
        .product-tag {
          position: absolute;
          top: 12rpx;
          right: 12rpx;
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          color: #fff;
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 16rpx;
          font-weight: 500;
          box-shadow: 0 2rpx 6rpx rgba(255, 107, 107, 0.2);
        }
      }
      
      .product-info {
        padding: 16rpx;
        background: linear-gradient(to bottom, #fff, rgba(240, 248, 255, 0.5));
        
        .product-name {
          font-size: 26rpx;
          color: #333;
          line-height: 1.4;
          margin-bottom: 12rpx;
          height: 72rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .product-price {
            font-size: 30rpx;
            color: #FF6B6B;
            font-weight: 600;
          }
          
          .cart-btn {
            width: 40rpx;
            height: 40rpx;
            background: linear-gradient(135deg, #4B91F1, #6FB1FF);
            border-radius: 20rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4rpx 8rpx rgba(75, 145, 241, 0.2);
            transition: transform 0.2s ease;
            
            &:active {
              transform: scale(0.9);
            }
          }
        }
      }
    }
  }
  
  // 底部品牌
  .footer {
    text-align: center;
    padding: 30rpx 0 80rpx;
    margin-top: 20rpx;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
    
    &::before, &::after {
      content: "";
      position: absolute;
      width: 300rpx;
      height: 300rpx;
      border-radius: 50%;
      opacity: 0.05;
      z-index: 0;
    }
    
    &::before {
      background: linear-gradient(135deg, #4B91F1, #6FB1FF);
      top: -150rpx;
      left: -150rpx;
    }
    
    &::after {
      background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
      bottom: -150rpx;
      right: -150rpx;
    }
    
    .footer-logo {
      margin-bottom: 20rpx;
      position: relative;
      z-index: 2;
      
      .logo-text {
        font-size: 36rpx;
        font-weight: 600;
        background: linear-gradient(to right, #4B91F1, #FF6B6B);
        -webkit-background-clip: text;
        color: transparent;
        letter-spacing: 2rpx;
      }
    }
    
    .footer-slogan {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 16rpx;
      position: relative;
      z-index: 2;
    }
    
    .footer-copyright {
      font-size: 22rpx;
      color: #999;
      position: relative;
      z-index: 2;
    }
  }
}

// 弹窗样式 - 蓝色主题化
.specs-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  
  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.7);
    backdrop-filter: blur(4rpx);
  }
  
  .popup-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 32rpx 32rpx 0 0;
    padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
    box-shadow: 0 -12rpx 30rpx rgba(0,0,0,0.1);
    
    .popup-header {
      padding: 30rpx;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1rpx solid #f0f0f0;
      
      .product-brief {
        display: flex;
        
        .popup-image {
          width: 160rpx;
          height: 160rpx;
          border-radius: 16rpx;
          box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
        }
        
        .brief-info {
          margin-left: 20rpx;
          
          .popup-price {
            font-size: 36rpx;
            font-weight: bold;
            color: #4B91F1;
            margin-bottom: 10rpx;
            
            .popup-original-price {
              font-size: 24rpx;
              color: #999;
              text-decoration: line-through;
              font-weight: normal;
              margin-left: 10rpx;
            }
          }
          
          .popup-stock, .popup-selected {
            font-size: 24rpx;
            color: #666;
            margin-top: 10rpx;
          }
        }
      }
      
      .close-btn {
        width: 48rpx;
        height: 48rpx;
        background-color: rgba(0,0,0,0.05);
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .specs-section, .quantity-section {
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .specs-title, .quantity-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
        font-weight: 500;
      }
      
      .specs-options {
        display: flex;
        flex-wrap: wrap;
        
        .spec-option {
          padding: 12rpx 24rpx;
          border-radius: 8rpx;
          background-color: #f8f8fa;
          margin-right: 20rpx;
          margin-bottom: 20rpx;
          font-size: 24rpx;
          color: #333;
          border: 1rpx solid transparent;
          transition: all 0.2s;
          
          &:active {
            opacity: 0.8;
          }
          
          &.active {
            background-color: rgba(92, 142, 58, 0.1);
            color: #4B91F1;
            border: 1rpx solid #4B91F1;
            font-weight: 500;
          }
        }
      }
      
      .quantity-adjuster {
        display: flex;
        align-items: center;
        
        .quantity-btn {
          width: 60rpx;
          height: 60rpx;
          border: 1rpx solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          color: #333;
          background-color: #f8f8fa;
          transition: all 0.2s;
          
          &.minus {
            border-radius: 30rpx 0 0 30rpx;
          }
          
          &.plus {
            border-radius: 0 30rpx 30rpx 0;
          }
          
          &.disabled {
            color: #ccc;
            pointer-events: none;
          }
          
          &:active {
            background-color: #e8e9eb;
          }
        }
        
        .quantity-input {
          width: 80rpx;
          height: 60rpx;
          border-top: 1rpx solid #eee;
          border-bottom: 1rpx solid #eee;
          text-align: center;
          font-size: 28rpx;
          color: #333;
        }
      }
    }
    
    .popup-actions {
      display: flex;
      padding: 30rpx;
      
      .action-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 500;
        transition: transform 0.2s;
        
        &:active {
          transform: scale(0.98);
        }
        
        &.add-to-cart {
          background-color: #333;
          color: #fff;
          margin-right: 15rpx;
          letter-spacing: 1rpx;
        }
        
        &.buy-now {
          background: linear-gradient(135deg, #4B91F1, #4B91F1);
          color: #fff;
          margin-left: 15rpx;
          letter-spacing: 1rpx;
          box-shadow: 0 6rpx 16rpx rgba(92, 142, 58, 0.2);
        }
      }
    }
  }
}

// 快速购买弹窗样式
.quick-buy-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4rpx);
  }
  
  .popup-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-radius: 32rpx 32rpx 0 0;
    padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
    box-shadow: 0 -12rpx 40rpx rgba(0, 0, 0, 0.1);
    
    .popup-header {
      display: flex;
      padding: 30rpx;
      position: relative;
      border-bottom: 1rpx solid #f5f5f5;
      
      .product-thumb {
        width: 180rpx;
        height: 180rpx;
        border-radius: 16rpx;
        margin-top: -60rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
        border: 4rpx solid #fff;
        background-color: #fff;
      }
      
      .header-right {
        flex: 1;
        padding-left: 20rpx;
        
        .popup-price {
          font-size: 40rpx;
          color: #4B91F1;
          font-weight: 600;
          margin-bottom: 12rpx;
        }
        
        .popup-stock, .popup-selected {
          font-size: 24rpx;
          color: #666;
          margin-top: 8rpx;
        }
      }
      
      .close-btn {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0,0,0,0.05);
        border-radius: 24rpx;
      }
    }
    
    .popup-section {
      padding: 20rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .section-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
        font-weight: 500;
      }
      
      .specs-list {
        display: flex;
        flex-wrap: wrap;
        
        .spec-item {
          padding: 12rpx 24rpx;
          background-color: #f8f8fa;
          color: #333;
          font-size: 26rpx;
          margin-right: 20rpx;
          margin-bottom: 16rpx;
          border-radius: 8rpx;
          border: 1rpx solid transparent;
          
          .spec-price {
            margin-left: 10rpx;
            color: #4B91F1;
            font-weight: 500;
          }
          
          .spec-stock {
            margin-left: 6rpx;
            font-size: 22rpx;
            color: #999;
          }
          
          &.active {
            background-color: rgba(92, 142, 58, 0.1);
            color: #4B91F1;
            border-color: #4B91F1;
          }
        }
      }
      
      .quantity-control {
        display: flex;
        align-items: center;
        
        .quantity-btn {
          width: 60rpx;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f8fa;
          font-size: 28rpx;
          
          &.minus {
            border-radius: 30rpx 0 0 30rpx;
          }
          
          &.plus {
            border-radius: 0 30rpx 30rpx 0;
          }
          
          &.disabled {
            color: #ccc;
          }
        }
        
        .quantity-input {
          width: 80rpx;
          height: 60rpx;
          text-align: center;
          border-top: 1rpx solid #eee;
          border-bottom: 1rpx solid #eee;
          font-size: 28rpx;
        }
      }
    }
    
    .action-buttons {
      display: flex;
      padding: 30rpx;
      
      .action-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 500;
        transition: transform 0.2s;
        
        &:active {
          transform: scale(0.96);
        }
        
        &.cart-btn {
          background-color: #333;
          color: #fff;
          margin-right: 12rpx;
        }
        
        &.buy-btn {
          background: linear-gradient(135deg, #4B91F1, #4B91F1);
          color: #fff;
          margin-left: 12rpx;
          box-shadow: 0 6rpx 16rpx rgba(92, 142, 58, 0.2);
        }
      }
    }
  }
}
</style>