<template>
  <view class="login-container">
    <!-- 副标题 -->
    <view class="subtitle-container">
      <text class="subtitle">北方的鲜果 南方的春茶</text>
    </view>

    <!-- 中间部分logo -->
    <view class="logo-section">
      <view class="logo-circle">
        <image class="logo" src="/static/images/mylogo.jpg" mode="aspectFit"></image>
      </view>
    </view>

    <!-- 协议勾选框 -->
    <view class="agreement-container">
      <checkbox-group @change="checkboxChange">
        <label class="checkbox-label">
          <checkbox :checked="isAgreed" color="#4e7bef" style="transform:scale(0.8)" />
          <text class="agreement-text">我已阅读并同意</text>
          <text class="agreement-link" @tap="navigateToUserAgreement">《用户协议》</text>
          <text class="agreement-text">和</text>
          <text class="agreement-link" @tap="navigateToPrivacyPolicy">《隐私政策》</text>
        </label>
      </checkbox-group>
    </view>

    <!-- 登录按钮 -->
    <view class="button-container">
      <button class="login-button" @click="handleWechatLogin">
        授权登录
      </button>
      
      <!-- 游客模式按钮 -->
      <button class="guest-button" @click="handleGuestLogin">
        游客模式
      </button>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
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
    
    // 是否同意协议
    const isAgreed = ref(false)
    
    // 重定向URL
    const redirectUrl = ref('')
    
    // 获取页面参数
    onLoad((options) => {
      console.log('登录页面参数:', options)
      if (options.redirect) {
        redirectUrl.value = decodeURIComponent(options.redirect)
        console.log('获取到重定向URL:', redirectUrl.value)
      }
    })
    
    // 页面加载完成
    onMounted(() => {
      console.log('登录页面已加载完成')
      // 默认勾选协议
      isAgreed.value = false
    })
    
    // 勾选框变化
    const checkboxChange = (e) => {
      isAgreed.value = e.detail.value.length > 0
    }
    
    // 导航到用户协议页面
    const navigateToUserAgreement = () => {
      uni.navigateTo({
        url: '/pages/agreement/user-agreement'
      })
    }
    
    // 导航到隐私政策页面
    const navigateToPrivacyPolicy = () => {
      uni.navigateTo({
        url: '/pages/agreement/privacy-policy'
      })
    }
    
    // 处理登录成功后的跳转
    const handleSuccessNavigation = () => {
      console.log('处理导航跳转, 重定向URL:', redirectUrl.value)
      
      // 如果有重定向URL，则跳转到该URL
      if (redirectUrl.value) {
        // 判断是否是tabBar页面
        const tabBarPages = ['/pages/index/index', '/pages/category/category', '/pages/cart/cart', '/pages/user/user']
        const isTabBar = tabBarPages.includes(redirectUrl.value)
        
        if (isTabBar) {
          console.log('跳转到tabBar页面:', redirectUrl.value)
          uni.switchTab({
            url: redirectUrl.value,
            fail: (err) => {
              console.error('跳转失败:', err)
              uni.switchTab({ url: '/pages/index/index' })
            }
          })
        } else {
          console.log('跳转到非tabBar页面:', redirectUrl.value)
          uni.navigateTo({
            url: redirectUrl.value,
            fail: (err) => {
              console.error('跳转失败:', err)
              uni.switchTab({ url: '/pages/index/index' })
            }
          })
        }
      } else {
        // 没有重定向URL，跳转到首页
        console.log('无重定向URL，跳转到首页')
        try {
          uni.switchTab({
            url: '/pages/index/index',
            fail: (err) => {
              console.error('跳转到首页失败:', err)
              uni.reLaunch({ url: '/pages/index/index' })
            }
          })
        } catch (error) {
          console.error('跳转异常:', error)
          uni.reLaunch({ url: '/pages/index/index' })
        }
      }
    }

    // 微信登录
    const handleWechatLogin = () => {
      console.log('点击了微信登录按钮')
      
      // 检查是否勾选了协议
      if (!isAgreed.value) {
        uni.showToast({
          title: '请阅读并同意用户协议和隐私政策',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
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
              url: 'https://bgnc.online/api/auth/login',
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
              
              // 清除游客模式标记
              uni.removeStorageSync('isGuestMode')
              
              // 登录成功后查询路由信息
              try {
                const routeRes = await request({
                  url: `https://bgnc.online/api/order/route?phoneNumber=5713&orderNumber=SF3165555559187`,
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
              
              // 处理跳转
              setTimeout(() => {
                handleSuccessNavigation()
              }, 1600)
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
        fail: (err) => {
          uni.hideLoading()
          uni.showToast({
            title: '微信登录失败',
            icon: 'none'
          }) 
          console.error('微信登录API调用失败:', err)
        }
      })
    }
    
    // 游客模式登录
    const handleGuestLogin = () => {
      console.log('点击了游客模式按钮')
      
      // 游客模式不需要检查协议勾选
      // 直接设置游客模式标记
      uni.setStorageSync('isGuestMode', true)
      
      // 游客登录提示
      uni.showToast({
        title: '以游客身份浏览',
        icon: 'success',
        duration: 1500
      })
      
      // 游客模式总是导航到首页，忽略重定向URL
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index',
          fail: (err) => {
            console.error('跳转到首页失败:', err)
            uni.reLaunch({ url: '/pages/index/index' })
          }
        })
      }, 1600)
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
      isAgreed,
      checkboxChange,
      navigateToUserAgreement,
      navigateToPrivacyPolicy,
      handleWechatLogin,
      handleGuestLogin,
      devNavigateTo
    }
  }
}
</script>

<style lang="scss">
.login-container {
  min-height: 100vh;
  background-color: #F1F9FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  .subtitle-container {
    margin-bottom: 80rpx;
    position: absolute;
    top: 220rpx;
    
    .subtitle {
      font-size: 42rpx;
      color: #3b78db;
      font-weight: 400;
    }
  }
  
  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;
    
    .logo-circle {
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
      margin-bottom: 30rpx;
      
      .logo {
        width: 250rpx;
        height: 250rpx;
        border-radius: 50%;
      }
    }
    
    .logo-text {
      font-size: 36rpx;
      color: #3b78db;
      font-weight: 500;
    }
  }
  
  .agreement-container {
    margin-bottom: 40rpx;
    
    .checkbox-label {
      display: flex;
      align-items: center;
      font-size: 28rpx;
    }
    
    .agreement-text {
      color: #666;
    }
    
    .agreement-link {
      color: #4e7bef;
    }
  }
  
  .button-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 50rpx;
    
    .login-button {
      width: 300rpx;
      height: 100rpx;
      background-color: #4e7bef;
      color: #ffffff;
      font-size: 32rpx;
      font-weight: 400;
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 2rpx;
      box-shadow: 0 6rpx 12rpx rgba(78, 123, 239, 0.3);
      border: none;
      margin-bottom: 30rpx;
      
      &::after {
        border: none;
      }
      
      &:active {
        transform: scale(0.98);
        background-color: #4470e0;
      }
    }
    
    .guest-button {
      width: 300rpx;
      height: 100rpx;
      background-color: #ffffff;
      color: #4e7bef;
      font-size: 32rpx;
      font-weight: 400;
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 2rpx;
      box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.1);
      border: 1rpx solid #4e7bef;
      
      &::after {
        border: none;
      }
      
      &:active {
        transform: scale(0.98);
        background-color: #f5f8ff;
      }
    }
  }
}
</style> 