<template>
  <view class="login-container">
    <!-- 顶部区域 -->
    <view class="header">
      <view class="blur-background"></view>
      <view class="logo-container">
        <image class="logo" src="/static/images/mylogo.png" mode="aspectFit"></image>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <view class="title-section">
        <text class="subtitle">南茶北果</text>
      </view>

      <!-- 微信登录按钮 -->
      <button class="login-button" @tap="handleWechatLogin">
        <text class="iconfont icon-wechat"></text>
        <text>微信一键登录</text>
      </button>
    </view>

    <!-- 开发环境下显示快速导航 -->
    <view v-if="isDev" class="dev-buttons">
      <button @tap="devNavigateTo('/pages/index/index')">首页</button>
      <button @tap="devNavigateTo('/pages/category/category')">分类</button>
      <button @tap="devNavigateTo('/pages/cart/cart')">购物车</button>
      <button @tap="devNavigateTo('/pages/user/user')">我的</button>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import request from '@/utils/request'

export default {
  name: 'Login',
  setup() {
    // 判断是否为开发环境
    const isDev = process.env.NODE_ENV === 'development'

    const form = ref({
      phone: '',
      password: ''
    })

    // 微信登录
    const handleWechatLogin = () => {
      // 显示加载中
      uni.showLoading({
        title: '登录中...'
      })

      // 调用微信登录
      uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
          try {
            // 获取到微信登录code后，发送给后端
            const response = await request({
              url: 'http://82.156.12.240:8080/api/auth/login',
              method: 'POST',
              data: {
                xcxCode: loginRes.code,
                grantType:'xcx'
              }
            })
            
            // 关闭加载提示
            uni.hideLoading()
            
            if (response.code === 200) {
              // 保存用户信息和token
              uni.setStorageSync('token', response.data.access_token)
              
              // 登录成功后查询路由信息
              try {
                const routeRes = await request({
                  url: `http://82.156.12.240:8080/api/order/route?phoneNumber=5713&orderNumber=SF3165555559187`,
                  method: 'GET'
                })
                console.log('路由查询结果:', routeRes)
              } catch (error) {
                console.error('路由查询失败:', error)
              }
              
              // 登录成功提示
              uni.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
              })
              
              // 立即跳转
              try {
                const pages = getCurrentPages()
                if (pages.length >= 10) {
                  uni.reLaunch({ 
                    url: '/pages/index/index'
                  })
                } else {
                  uni.switchTab({
                    url: '/pages/index/index',
                    fail: (err) => {
                      console.error('跳转失败:', err)
                      uni.reLaunch({ url: '/pages/index/index' })
                    }
                  })
                }
              } catch (error) {
                uni.reLaunch({ url: '/pages/index/index' })
              }
            } else {
              uni.showToast({
                title: response.message || '登录失败',
                icon: 'none'
              })
            }
          } catch (error) {
            uni.hideLoading()
            uni.showToast({
              title: '登录失败，请稍后再试',
              icon: 'none'
            })
            console.error('微信登录失败：', error)
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({
            title: '微信登录失败',
            icon: 'none'
          }) 
        }
      })
    }

    // 开发环境导航方法
    const devNavigateTo = (url) => {
      // 模拟登录状态
      uni.setStorageSync('token', 'dev_token')
      uni.setStorageSync('userInfo', {
        level: 1,
        // 其他测试数据
      })
      
      // 跳转到对应页面
      uni.switchTab({
        url: url
      })
    }

    return {
      isDev,
      form,
      handleWechatLogin,
      devNavigateTo
    }
  }
}
</script>

<style lang="scss">
.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  
  .header {
    position: relative;
    height: 45vh;
    overflow: hidden;
    
    .blur-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
      backdrop-filter: blur(20px);
    }
    
    .logo-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      
      .logo {
        width: 180rpx;
        height: 180rpx;
        filter: drop-shadow(0 8rpx 24rpx rgba(74, 144, 226, 0.2));
      }
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -60rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 120rpx;
      height: 6rpx;
      background: linear-gradient(90deg, rgba(74, 144, 226, 0) 0%, rgba(74, 144, 226, 0.2) 50%, rgba(74, 144, 226, 0) 100%);
      border-radius: 3rpx;
    }
  }
  
  .content {
    flex: 1;
    padding: 80rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .title-section {
      text-align: center;
      margin-bottom: 100rpx;
      
      .subtitle {
        font-size: 36rpx;
        color: #4a90e2;
        letter-spacing: 8rpx;
        text-transform: uppercase;
        font-weight: 300;
        position: relative;
        padding-bottom: 20rpx;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: linear-gradient(90deg, rgba(74, 144, 226, 0) 0%, rgba(74, 144, 226, 0.5) 50%, rgba(74, 144, 226, 0) 100%);
        }
      }
    }
    
    .login-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 85%;
      height: 96rpx;
      background: #ffffff;
      color: #4a90e2;
      font-size: 32rpx;
      font-weight: 500;
      border-radius: 48rpx;
      box-shadow: 
        0 4rpx 12rpx rgba(74, 144, 226, 0.1),
        0 12rpx 24rpx rgba(74, 144, 226, 0.05);
      border: 1px solid rgba(74, 144, 226, 0.1);
      position: relative;
      
      &::after {
        border: none;
      }
      
      .iconfont {
        font-size: 40rpx;
        margin-right: 16rpx;
      }
    }
  }
  
  .dev-buttons {
    position: absolute;
    bottom: 40rpx;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    padding: 0 30rpx;
    
    button {
      margin: 0;
      background: #f5f7fa;
      padding: 10rpx 20rpx;
      font-size: 24rpx;
      border-radius: 10rpx;
      color: #666;
    }
  }
}
</style> 