<template>
    <view class="detail-container">
      <!-- 加载中提示 -->
      <view class="loading-container" v-if="isLoading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 内容区域 - 仅在加载完成后显示 -->
      <block v-else>
        <!-- 返回按钮 -->
        <view class="floating-back" @tap="goBack">
          <uni-icons type="back" size="20" color="#fff"></uni-icons>
        </view>
        
        <!-- 商品图片轮播 -->
        <swiper class="product-swiper" circular indicator-dots autoplay 
          :indicator-color="'rgba(255,255,255,0.5)'"
          :indicator-active-color="'#4B91F1'">
          <swiper-item v-for="(item, index) in productImages" :key="index">
            <image :src="item" mode="aspectFill" class="swiper-image" />
          </swiper-item>
        </swiper>
    
        <!-- 商品信息卡片 -->
        <view class="info-card">
          <view class="price-section">
            <view class="current-price">¥{{ productInfo.price }}</view>
            <view class="original-price" v-if="productInfo.originalPrice">¥{{ productInfo.originalPrice }}</view>
            <view class="sales-info">已售 {{ productInfo.sale || 0 }}</view>
          </view>
          
          <view class="title-section">
            <view class="product-title">{{ productInfo.name }}</view>
            <view class="share-button" @tap="handleShare">
              <uni-icons type="redo-filled" size="24" color="#4B91F1"></uni-icons>
              <text>分享</text>
            </view>
          </view>
          
          <view class="desc-section">
            {{ productInfo.description || '暂无商品描述' }}
          </view>
        </view>
        
        <!-- 规格选择入口 -->
        <view class="option-card" @tap="showSpecsPopup">
          <view class="option-item">
            <text class="item-label">规格</text>
            <view class="item-value">
              <text>{{ selectedSpec || '请选择' }}</text>
              <uni-icons type="right" size="16" color="#ccc"></uni-icons>
            </view>
          </view>
        </view>
        
        <!-- 商品详情卡片 -->
        <view class="detail-card">
          <view class="card-title">
            <view class="title-decorator"></view>
            <text>商品详情</text>
          </view>
          
          <view class="detail-content">
            <rich-text :nodes="productInfo.detailHtml || '<p>暂无详情</p>'"></rich-text>
          </view>
        </view>
    
        <!-- 底部操作栏 -->
        <view class="action-bar">
          <view class="action-left">
            <view class="action-icon" @tap="goHome">
              <uni-icons type="home" size="24" color="#666"></uni-icons>
              <text>首页</text>
            </view>
            <view class="action-icon" @tap="contactService">
              <uni-icons type="headphones" size="24" color="#666"></uni-icons>
              <text>客服</text>
            </view>
            <view class="action-icon" @tap="goToCart">
              <uni-icons type="cart" size="24" color="#666"></uni-icons>
              <text>购物车</text>
            </view>
          </view>
          
          <view class="action-right">
            <view class="cart-btn" @tap="showSpecsPopup">加入购物车</view>
            <view class="buy-btn" @tap="showSpecsPopup">立即购买</view>
          </view>
        </view>
        
        <!-- 规格选择弹窗 -->
        <view class="specs-popup" v-if="showSpecs">
          <view class="popup-mask" @tap="hideSpecsPopup"></view>
          <view class="popup-content">
            <!-- 弹窗头部 -->
            <view class="popup-header">
              <view class="product-brief">
                <image :src="productImages[0]" mode="aspectFill" class="popup-image"></image>
                <view class="brief-info">
                  <view class="popup-price">¥{{ currentSku.price || productInfo.price }}</view>
                  <view class="popup-stock">库存 · {{ currentSku.stock || 0 }}</view>
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
                  v-for="(spec, index) in productSpecs" 
                  :key="index"
                  :class="['spec-option', selectedSpecIndex === index ? 'active' : '']"
                  @tap="selectSpec(index)"
                >
                  {{ spec.name }}
                  <text class="spec-price" v-if="spec.price">¥{{ spec.price }}</text>
                  <text class="spec-stock" v-if="spec.stock !== undefined">(库存:{{ spec.stock }})</text>
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
                  :class="['quantity-btn', 'plus', quantity >= currentSku.stock ? 'disabled' : '']" 
                  @tap="increaseQuantity"
                >+</view>
              </view>
            </view>
            
            <!-- 弹窗底部操作按钮 -->
            <view class="popup-actions">
              <view class="action-btn add-to-cart" @tap="addToCart">加入购物车</view>
              <view class="action-btn buy-now" @tap="buyNow">立即购买</view>
            </view>
          </view>
        </view>
      </block>
    </view>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import request from '@/utils/request'
  
  // 页面参数
  const productId = ref('')
  
  // 商品数据
  const productImages = ref([])
  const productInfo = ref({})
  const skuList = ref([])
  const productSpecs = ref([])
  
  // UI状态
  const selectedSpecIndex = ref(0)
  const selectedSpec = ref('默认规格')
  const quantity = ref(1)
  const showSpecs = ref(false)
  const currentSku = ref({})
  const selectedSkuId = ref('')
  const isLoading = ref(true)
  
  const specMap = new Map()
  
  // 处理SKU规格数据 - 这个函数缺失导致了整个流程中断
  const processSkuData = (skuDataList) => {
    try {
      console.log('开始处理SKU数据:', skuDataList)
      productSpecs.value = []
      specMap.clear()
      
      // 没有SKU数据时的处理
      if (!skuDataList || skuDataList.length === 0) {
        productSpecs.value = [{ 
          name: '默认规格', 
          price: productInfo.value.price, 
          stock: 100,
          skuId: ''
        }]
        
        currentSku.value = {
          price: productInfo.value.price,
          stock: 100,
          id: ''
        }
        
        selectedSpec.value = '默认规格'
        return
      }
      
      // 解析规格数据
      skuDataList.forEach(sku => {
        console.log('处理SKU项:', sku)
        if (sku.spData) {
          // 解析spData (格式例如: "8:8")
          const specs = sku.spData.split(';') // 处理可能的多规格情况
          
          specs.forEach(spec => {
            const [specId, specValue] = spec.split(':')
            const specKey = `${specId}:${specValue}`
            
            if (!specMap.has(specKey)) {
              const specItem = {
                id: specId,
                value: specValue,
                name: `规格${specValue}`,
                price: sku.price,
                stock: sku.stock,
                skuId: sku.id
              }
              
              specMap.set(specKey, specItem)
              productSpecs.value.push(specItem)
            }
          })
        } else {
          // 没有规格数据的情况
          const specItem = {
            name: '默认规格',
            price: sku.price,
            stock: sku.stock,
            skuId: sku.id
          }
          
          if (productSpecs.value.length === 0) {
            productSpecs.value.push(specItem)
          }
        }
      })
      
      // 设置默认选中的规格
      if (productSpecs.value.length > 0) {
        selectedSpec.value = productSpecs.value[0].name
        selectedSkuId.value = productSpecs.value[0].skuId
        
        currentSku.value = {
          price: productSpecs.value[0].price,
          stock: productSpecs.value[0].stock,
          id: productSpecs.value[0].skuId
        }
      }
      
      console.log('处理后的规格数据:', productSpecs.value)
    } catch (error) {
      console.error('处理SKU数据出错:', error)
      // 出错时设置默认值
      productSpecs.value = [{ name: '默认规格', price: productInfo.value.price, stock: 100 }]
      selectedSpec.value = '默认规格'
    }
  }
  
  // 获取商品详情
  const getProductDetail = async (id) => {
    if (!id) {
      uni.showToast({
        title: '商品ID无效',
        icon: 'none'
      });
      isLoading.value = false;
      return;
    }
    
    isLoading.value = true;
    console.log(`尝试获取商品数据，ID=${id}`)
    
    try {
      console.log('正在获取商品详情, ID:', id);
      
      const result = await request({
        url: `https://bgnc.online/api/product/${id}`,
        method: 'GET'
      });
      
      console.log('API返回结果:', result);
      
      if (result.code === 200 && result.data) {
        console.log('获取到商品详情:', result.data);
        productInfo.value = result.data;
        
        // 处理商品图片
        productImages.value = [];
        
        // 添加主图
        if (result.data.indexPic) {
          productImages.value.push(result.data.indexPic);
        }
        
        // 添加相册图片
        if (result.data.albumPicsList && result.data.albumPicsList.length > 0) {
          result.data.albumPicsList.forEach(pic => {
            // 避免重复添加indexPic
            if (pic !== result.data.indexPic) {
              productImages.value.push(pic);
            }
          });
        }
        
        // 确保至少有一张图片
        if (productImages.value.length === 0) {
          productImages.value.push('/static/images/product-default.png');
        }
        
        // 处理规格数据
        skuList.value = result.data.skuList || [];
        processSkuData(result.data.skuList || []);
        
        console.log('处理后的商品数据:', {
          images: productImages.value,
          info: productInfo.value,
          specs: productSpecs.value,
          currentSku: currentSku.value
        });
      } else {
        uni.showToast({
          title: '获取商品详情失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取商品详情出错:', error);
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      });
    } finally {
      isLoading.value = false;
    }
  }
  
  // 在页面加载时获取商品ID并加载数据
  onLoad((options) => {
    console.log('详情页收到参数:', options);
    if (options.id) {
      productId.value = options.id;
      getProductDetail(options.id);
    } else {
      console.error('没有收到有效的商品ID');
      uni.showToast({
        title: '商品ID无效',
        icon: 'none'
      });
      isLoading.value = false;
    }
    
    // 设置页面分享信息
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  });
  
  // 返回上一页
  const goBack = () => {
    uni.navigateBack();
  }
  
  // 跳转到首页
  const goHome = () => {
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
  
  // 跳转到购物车
  const goToCart = () => {
    uni.switchTab({
      url: '/pages/cart/cart'
    });
  }
  
  // 联系客服
  const contactService = () => {
    uni.showToast({
      title: '客服功能暂未开放',
      icon: 'none'
    });
  }
  
  // 显示规格弹窗
  const showSpecsPopup = () => {
    showSpecs.value = true;
  }
  
  // 隐藏规格弹窗
  const hideSpecsPopup = () => {
    showSpecs.value = false;
  }
  
  // 选择规格
  const selectSpec = (index) => {
    if (index < 0 || index >= productSpecs.value.length) return
    
    selectedSpecIndex.value = index
    selectedSpec.value = productSpecs.value[index].name
    selectedSkuId.value = productSpecs.value[index].skuId
    
    currentSku.value = {
      price: productSpecs.value[index].price,
      stock: productSpecs.value[index].stock,
      id: productSpecs.value[index].skuId
    }
    
    // 更新产品价格显示
    productInfo.value.price = currentSku.value.price
    
    // 检查数量是否超过库存
    if (quantity.value > currentSku.value.stock) {
      quantity.value = currentSku.value.stock > 0 ? currentSku.value.stock : 1
    }
  }
  
  // 减少数量
  const decreaseQuantity = () => {
    if (quantity.value > 1) {
      quantity.value--
    }
  }
  
  // 增加数量
  const increaseQuantity = () => {
    if (quantity.value < currentSku.value.stock) {
      quantity.value++
    } else {
      uni.showToast({
        title: '已达最大库存',
        icon: 'none'
      })
    }
  }
  
  // 验证数量
  const validateQuantity = () => {
    const val = parseInt(quantity.value)
    if (isNaN(val) || val < 1) {
      quantity.value = 1
    } else if (val > currentSku.value.stock) {
      quantity.value = currentSku.value.stock > 0 ? currentSku.value.stock : 1
    } else {
      quantity.value = val
    }
  }
  
  // 添加到购物车
  const addToCart = async () => {
    // 检查是否选择了规格
    if (!selectedSkuId.value) {
      uni.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    
    try {
      const result = await request({
        url: 'https://bgnc.online/api/cart/add',
        method: 'POST',
        data: {
          skuId: selectedSkuId.value,
          productId: productId.value,
          quantity: quantity.value
        }
      })
      
      if (result.code === 200) {
        uni.showToast({
          title: '已加入购物车',
          icon: 'success'
        })
        hideSpecsPopup()
      } else {
        uni.showToast({
          title: result.message || '添加失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('添加购物车失败:', error)
      uni.showToast({
        title: '网络错误，请稍后再试',
        icon: 'none'
      })
    }
  }
  
  // 立即购买
  const buyNow = async () => {
    if (!selectedSpec && productInfo.value.hasSpecs) {
      showSpecsPopup()
      return
    }
    
    // 获取会员信息
    let memberLevel = '';
    try {
      const result = await request({
        url: 'https://bgnc.online/api/user/profile',
        method: 'GET'
      })
      
      if (result.code === 200) {
        memberLevel = result.data.memberLevel || ''
      }
    } catch (error) {
      console.error('获取会员信息失败:', error)
    }
    
    // 获取价格，考虑规格和会员折扣
    let price = parseFloat(currentSku.value?.price || productInfo.value.price);
    
    // 创建结算项
    const checkoutItem = {
      productId: productInfo.value.id,
      productName: productInfo.value.name,
      productImage: productImages.value[0],
      price: price,
      quantity: quantity.value,
      skuId: selectedSkuId.value || '',
      spec: selectedSpec.value || '',
      memberLevel: memberLevel // 保存会员等级，用于结算页面计算折扣
    }
    
    // 保存到本地存储
    uni.setStorageSync('checkoutItems', JSON.stringify([checkoutItem]))
    
    // 跳转到结算页面
    uni.navigateTo({
      url: '/pages/checkout/checkout?type=buyNow'
    })
  }
  
  // 分享商品
  const handleShare = () => {
    // #ifdef MP-WEIXIN
    try {
      // 1. 生成分享图片
      uni.showLoading({
        title: '生成分享图片...'
      });
      
      // 收集分享内容
      const shareContent = {
        title: productInfo.value.name,
        price: `¥${productInfo.value.price}`,
        imageUrl: productImages.value[0],
        qrPath: `/pages/detail/detail?id=${productId.value}`
      };
      
      // 2. 使用微信API创建分享图片
      uni.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        success: function(res) {
          const tempFilePath = res.tempFilePath;
          
          // 3. 保存图片到相册
          uni.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: function() {
              uni.hideLoading();
              uni.showModal({
                title: '分享提示',
                content: '分享图片已保存到相册，可前往分享给好友',
                showCancel: false
              });
            },
            fail: function() {
              uni.hideLoading();
              uni.showModal({
                title: '分享提示',
                content: '请先授权保存图片到相册的权限',
                showCancel: false
              });
            }
          });
        },
        fail: function(err) {
          console.error('生成分享图片失败', err);
          uni.hideLoading();
          // 备用方案：直接使用右上角分享
          uni.showToast({
            title: '请点击右上角进行分享',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('分享功能出错:', error);
      uni.hideLoading();
      // 备用方案：直接使用右上角分享
      uni.showToast({
        title: '请点击右上角进行分享',
        icon: 'none'
      });
    }
    // #endif
    
    // 非微信小程序环境
    // #ifndef MP-WEIXIN
    uni.showToast({
      title: '请点击右上角进行分享',
      icon: 'none',
      duration: 2000
    });
    // #endif
  }
  
  // 定义页面的分享行为
  onShareAppMessage(() => {
    return {
      title: productInfo.value?.name || '好物推荐',
      path: `/pages/detail/detail?id=${productId.value}`,
      imageUrl: productImages.value[0]
    }
  })
  
  // 分享到朋友圈
  // 注意：此功能只有微信小程序支持
  try {
    onShareTimeline(() => {
      return {
        title: productInfo.value?.name || '好物推荐',
        query: `id=${productId.value}`,
        imageUrl: productImages.value[0]
      }
    })
  } catch (error) {
    console.log('分享到朋友圈功能不可用')
  }
  </script>
  
  <style lang="scss">
  .detail-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    display: flex;
    flex-direction: column;
    position: relative;
  
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      
      .loading-spinner {
        width: 60rpx;
        height: 60rpx;
        border: 6rpx solid #f0f0f0;
        border-top-color: #4B91F1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      .loading-text {
        font-size: 28rpx;
        color: #666;
        margin-top: 20rpx;
      }
      
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    }
    
    .floating-back {
      position: fixed;
      top: 60rpx;
      left: 30rpx;
      width: 70rpx;
      height: 70rpx;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
  
    .product-swiper {
      width: 100%;
      height: 750rpx;
      
      .swiper-image {
        width: 100%;
        height: 100%;
      }
    }
    
    .info-card {
      background-color: #fff;
      border-radius: 24rpx 24rpx 0 0;
      margin-top: -30rpx;
      padding: 30rpx;
      position: relative;
      z-index: 10;
      
      .price-section {
        display: flex;
        align-items: flex-end;
        margin-bottom: 20rpx;
        
        .current-price {
          font-size: 42rpx;
          color: #4B91F1;
          font-weight: bold;
        }
        
        .original-price {
          font-size: 24rpx;
          color: #999;
          text-decoration: line-through;
          margin-left: 12rpx;
          margin-bottom: 4rpx;
        }
        
        .sales-info {
          font-size: 24rpx;
          color: #999;
          margin-left: auto;
        }
      }
      
      .title-section {
        margin-bottom: 16rpx;
        
        .product-title {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
          line-height: 1.4;
        }
        
        // 添加分享按钮样式
        .share-button {
          position: fixed;
          right: 20rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(75, 145, 241, 0.1);
          border-radius: 50%;
          width: 80rpx;
          height: 80rpx;
          justify-content: center;
          margin-top: -15rpx;
          
          text {
            font-size: 20rpx;
            color: #4B91F1;
            margin-top: 2rpx;
          }
        }
      }
      
      .desc-section {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
      }
    }
    
    .option-card {
      background-color: #fff;
      margin-top: 16rpx;
      padding: 0 30rpx;
      
      .option-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 0;
        font-size: 28rpx;
        
        .item-label {
          color: #666;
        }
        
        .item-value {
          display: flex;
          align-items: center;
          color: #333;
          
          text {
            margin-right: 10rpx;
          }
        }
      }
    }
    
    .detail-card {
      background-color: #fff;
      margin-top: 16rpx;
      margin-bottom: 150rpx;
      padding-bottom: 30rpx;
      
      .card-title {
        display: flex;
        align-items: center;
        padding: 30rpx;
        
        .title-decorator {
          width: 6rpx;
          height: 32rpx;
          background-color: #4B91F1;
          border-radius: 3rpx;
          margin-right: 16rpx;
        }
        
        text {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
        }
      }
      
      .detail-content {
        padding: 20rpx;
        
        :deep(img), :deep(image) {
          width: 100% !important;
          height: auto !important;
          display: block;
          margin: 20rpx 0;
        }
        
        :deep(p) {
          margin: 20rpx 0;
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
        }
      }
    }
  
    .action-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 120rpx;
      display: flex;
      background-color: #fff;
      border-top: 1rpx solid #f0f0f0;
      box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
      padding-bottom: env(safe-area-inset-bottom, 0);
      
      .action-left {
        display: flex;
        padding: 0 20rpx;
        
        .action-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 20rpx;
          
          text {
            font-size: 20rpx;
            color: #666;
            margin-top: 6rpx;
          }
        }
      }
      
      .action-right {
        flex: 1;
        display: flex;
        align-items: center;
        padding-right: 20rpx;
        
        .cart-btn, .buy-btn {
          flex: 1;
          height: 80rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          font-weight: 500;
          border-radius: 40rpx;
        }
        
        .cart-btn {
          background-color: rgba(75, 145, 241, 0.1);
          color: #4B91F1;
          margin-right: 16rpx;
        }
        
        .buy-btn {
          background: linear-gradient(to right, #4B91F1, #83B4FF);
          color: #fff;
          box-shadow: 0 6rpx 16rpx rgba(75, 145, 241, 0.2);
        }
      }
    }
    
    // 规格选择弹窗
    .specs-popup {
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
        background-color: rgba(0, 0, 0, 0.6);
      }
      
      .popup-content {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #fff;
        border-radius: 30rpx 30rpx 0 0;
        padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
        
        .popup-header {
          display: flex;
          padding: 30rpx;
          position: relative;
          border-bottom: 1rpx solid #f5f5f5;
          
          .product-brief {
            display: flex;
            
            .popup-image {
              width: 160rpx;
              height: 160rpx;
              border-radius: 12rpx;
              margin-top: -60rpx;
              border: 4rpx solid #fff;
              box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
            }
            
            .brief-info {
              margin-left: 20rpx;
              padding-top: 10rpx;
              
              .popup-price {
                font-size: 36rpx;
                color: #4B91F1;
                font-weight: 600;
              }
              
              .popup-stock, .popup-selected {
                font-size: 24rpx;
                color: #666;
                margin-top: 10rpx;
              }
            }
          }
          
          .close-btn {
            position: absolute;
            top: 20rpx;
            right: 20rpx;
            padding: 10rpx;
          }
        }
        
        .specs-section {
          padding: 30rpx;
          border-bottom: 1rpx solid #f5f5f5;
          
          .specs-title {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 20rpx;
          }
          
          .specs-options {
            display: flex;
            flex-wrap: wrap;
            
            .spec-option {
              padding: 12rpx 24rpx;
              background-color: #f5f5f5;
              color: #333;
              font-size: 26rpx;
              margin-right: 20rpx;
              margin-bottom: 20rpx;
              border-radius: 8rpx;
              
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
                background-color: rgba(75, 145, 241, 0.1);
                color: #4B91F1;
                border: 1rpx solid #4B91F1;
              }
            }
          }
        }
        
        .quantity-section {
          padding: 30rpx;
          border-bottom: 1rpx solid #f5f5f5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .quantity-title {
            font-size: 28rpx;
            color: #333;
          }
          
          .quantity-adjuster {
            display: flex;
            align-items: center;
            
            .quantity-btn {
              width: 60rpx;
              height: 60rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #f5f5f5;
              color: #333;
              font-size: 36rpx;
              
              &.minus {
                border-radius: 8rpx 0 0 8rpx;
              }
              
              &.plus {
                border-radius: 0 8rpx 8rpx 0;
              }
              
              &.disabled {
                color: #ccc;
              }
            }
            
            .quantity-input {
              width: 80rpx;
              height: 60rpx;
              background-color: #f5f5f5;
              text-align: center;
              font-size: 28rpx;
            }
          }
        }
        
        .popup-actions {
          padding: 30rpx;
          display: flex;
          
          .action-btn {
            flex: 1;
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
            font-weight: 500;
            border-radius: 40rpx;
            
            &.add-to-cart {
              background-color: rgba(75, 145, 241, 0.1);
              color: #4B91F1;
              margin-right: 16rpx;
            }
            
            &.buy-now {
              background: linear-gradient(to right, #4B91F1, #83B4FF);
              color: #fff;
              box-shadow: 0 6rpx 16rpx rgba(75, 145, 241, 0.2);
            }
          }
        }
      }
    }
  }
  </style>