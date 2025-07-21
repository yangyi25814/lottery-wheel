class LotteryWheel {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.spinBtn = document.getElementById('spinBtn');
        this.resultValue = document.getElementById('resultValue');
        this.historyContainer = document.getElementById('history');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        this.isSpinning = false;
        this.currentRotation = 0;
        this.history = this.loadHistory();
        
        // 轮盘选项配置
        this.options = [
            { value: '三三', color: '#ffeaa7' },
            { value: '小璐', color: '#fdcb6e' },
            { value: '小马', color: '#ffeaa7' },
            { value: '小刘', color: '#fdcb6e' },
            { value: '云墨', color: '#ffeaa7' },
            { value: '刘总', color: '#fdcb6e' },
            { value: '芋圆', color: '#ffeaa7' },
            { value: '花子', color: '#fdcb6e' }
        ];
        
        this.sectorAngle = 360 / this.options.length; // 每个扇形的角度
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderHistory();
        this.updateButtonState();
        
        // 添加触摸事件支持
        this.addTouchSupport();
    }
    
    bindEvents() {
        // 桌面端点击事件
        this.spinBtn.addEventListener('click', () => this.spin());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // 移动端触摸事件
        this.spinBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.spin();
        });
        
        this.clearHistoryBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.clearHistory();
        });
        
        // 防止触摸时的默认行为
        this.spinBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
        
        this.clearHistoryBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
    }
    
    addTouchSupport() {
        // 防止页面滚动和缩放
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.wheel-wrapper') || e.target.closest('.spin-button') || e.target.closest('.clear-button')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 添加触摸反馈
        this.addTouchFeedback(this.spinBtn);
        this.addTouchFeedback(this.clearHistoryBtn);
        
        // 防止iOS Safari的双击缩放
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
        
        // 设置viewport防止缩放
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    
    addTouchFeedback(element) {
        element.addEventListener('touchstart', () => {
            element.style.transform = 'scale(0.95)';
            element.style.transition = 'transform 0.1s ease';
        });
        
        element.addEventListener('touchend', () => {
            element.style.transform = 'scale(1)';
        });
        
        element.addEventListener('touchcancel', () => {
            element.style.transform = 'scale(1)';
        });
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.updateButtonState();
        
        // 随机旋转角度 (至少转3圈)
        const minRotation = 1080; // 3圈
        const maxRotation = 1800; // 5圈
        const randomRotation = Math.random() * (maxRotation - minRotation) + minRotation;
        
        // 计算最终角度
        const finalRotation = this.currentRotation + randomRotation;
        
        // 应用旋转动画
        this.wheel.style.transform = `rotate(${finalRotation}deg)`;
        this.currentRotation = finalRotation % 360;
        
        // 添加旋转动画类
        this.spinBtn.classList.add('spinning');
        
        // 动画结束后处理结果
        setTimeout(() => {
            this.handleSpinResult();
        }, 4000);
    }
    
    handleSpinResult() {
        // 计算指针指向的选项
        // 指针在顶部，所以需要调整计算方式
        const normalizedRotation = (360 - (this.currentRotation % 360)) % 360;
        const sectorIndex = Math.floor(normalizedRotation / this.sectorAngle);
        const result = this.options[sectorIndex];
        
        // 显示结果
        this.showResult(result.value);
        
        // 添加到历史记录
        this.addToHistory(result.value);
        
        // 重置状态
        this.isSpinning = false;
        this.updateButtonState();
        this.spinBtn.classList.remove('spinning');
        
        // 添加结果动画
        this.animateResult();
    }
    
    showResult(result) {
        this.resultValue.textContent = result;
        this.resultValue.style.animation = 'none';
        setTimeout(() => {
            this.resultValue.style.animation = 'pulse 0.6s ease-in-out';
        }, 10);
    }
    
    animateResult() {
        const resultContainer = document.querySelector('.result-container');
        const resultValue = document.getElementById('resultValue');
        
        // 添加弹跳动画
        resultContainer.classList.add('result-animation');
        
        // 添加按钮发光效果
        this.spinBtn.classList.add('button-glow');
        
        setTimeout(() => {
            resultContainer.classList.remove('result-animation');
            this.spinBtn.classList.remove('button-glow');
        }, 800);
    }
    
    addToHistory(result) {
        const timestamp = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        this.history.unshift({
            result: result,
            time: timestamp,
            date: new Date().toISOString()
        });
        
        // 限制历史记录数量
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistory();
        this.renderHistory();
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyContainer.innerHTML = '<div class="history-empty">暂无记录</div>';
            return;
        }
        
        const historyHTML = this.history.map(item => `
            <div class="history-item">
                <span class="history-result">${item.result}</span>
                <span class="history-time">${item.time}</span>
            </div>
        `).join('');
        
        this.historyContainer.innerHTML = historyHTML;
    }
    
    clearHistory() {
        if (this.history.length === 0) return;
        
        if (confirm('确定要清空所有历史记录吗？')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
        }
    }
    
    updateButtonState() {
        if (this.isSpinning) {
            this.spinBtn.disabled = true;
            this.spinBtn.querySelector('.button-text').textContent = '抽签中...';
            this.spinBtn.querySelector('.button-icon').textContent = '⏳';
        } else {
            this.spinBtn.disabled = false;
            this.spinBtn.querySelector('.button-text').textContent = '开始抽签';
            this.spinBtn.querySelector('.button-icon').textContent = '🎲';
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem('lottery_history', JSON.stringify(this.history));
        } catch (e) {
            console.warn('无法保存历史记录到本地存储');
        }
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('lottery_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('无法从本地存储加载历史记录');
            return [];
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new LotteryWheel();
});

// 添加页面可见性API支持，防止后台运行时的问题
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停动画
        const wheel = document.getElementById('wheel');
        if (wheel) {
            wheel.style.animationPlayState = 'paused';
        }
    } else {
        // 页面显示时恢复动画
        const wheel = document.getElementById('wheel');
        if (wheel) {
            wheel.style.animationPlayState = 'running';
        }
    }
});

// 添加错误处理
window.addEventListener('error', (e) => {
    console.error('页面发生错误:', e.error);
});

// 防止页面刷新时丢失状态
window.addEventListener('beforeunload', (e) => {
    // 如果正在抽签，提醒用户
    const lottery = window.lottery;
    if (lottery && lottery.isSpinning) {
        e.preventDefault();
        e.returnValue = '抽签正在进行中，确定要离开吗？';
    }
});