<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// 获取本地存储的token和游客模式标记
			const token = uni.getStorageSync('token')
			const isGuestMode = uni.getStorageSync('isGuestMode')
			
			console.log('App启动，检查登录状态: token=', token, 'isGuestMode=', isGuestMode)
			
			// 如果没有token且不是游客模式，跳转到登录页
			if (!token && !isGuestMode) {
				console.log('未登录状态，导航到登录页面')
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/login/login',
						success: () => {
							console.log('成功导航到登录页面')
						},
						fail: (err) => {
							console.error('导航到登录页面失败:', err)
						}
					})
				}, 100) // 延迟执行，确保应用完全初始化
			} else {
				console.log('已有登录状态或游客模式，不跳转')
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
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
