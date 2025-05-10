<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// 获取本地存储的token和游客模式标记
			const token = uni.getStorageSync('token')
			const isGuestMode = uni.getStorageSync('isGuestMode')
			
			console.log('App启动，检查登录状态: token=', token, 'isGuestMode=', isGuestMode)
			
			// 如果有token，说明用户已登录，不需要处理
			if (token) {
				console.log('用户已登录，token存在')
				return
			}
			
			// 如果没有token也没有设置游客模式，自动设置为游客模式
			if (!isGuestMode) {
				console.log('首次启动，自动设置为游客模式')
				uni.setStorageSync('isGuestMode', true)
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		// 全局分享配置
		onShareAppMessage(res) {
			return {
				title: '北果南茶 - 新鲜水果，健康生活',
				path: '/pages/index/index',
				imageUrl: '/static/images/share.png' // 确保此图片存在
			}
		},
		// 分享到朋友圈
		onShareTimeline() {
			return {
				title: '北果南茶 - 新鲜水果，健康生活',
				query: '',
				imageUrl: '/static/images/share.png' // 确保此图片存在
			}
		}
	}
</script>

<style>
	/* 全局样式 */
	page {
		background-color: #f8f9fc; /* 设置淡蓝色背景 */
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}

	/* 主题色变量 */
	:root {
		--primary-color: #4a90e2;
		--secondary-color: #f0f7ff;
		--text-color: #333333;
		--border-color: #e5e5e5;
	}
</style>
