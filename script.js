class DinnerSuggestionApp {
    constructor() {
        this.recipes = [];
        this.currentSuggestion = null;
        this.history = this.loadHistory();
        
        this.init();
    }

    async init() {
        await this.loadRecipes();
        this.setupEventListeners();
        this.renderHistory();
    }

    async loadRecipes() {
        try {
            const response = await fetch('recipes.json');
            const data = await response.json();
            this.recipes = data.recipes;
        } catch (error) {
            console.error('レシピデータの読み込みに失敗しました:', error);
            this.showError('レシピデータの読み込みに失敗しました');
        }
    }

    setupEventListeners() {
        const suggestBtn = document.getElementById('suggest-btn');
        const decideBtn = document.getElementById('decide-btn');
        const cuisineFilter = document.getElementById('cuisine-filter');

        suggestBtn.addEventListener('click', () => this.suggestRecipe());
        decideBtn.addEventListener('click', () => this.decideRecipe());
        
        cuisineFilter.addEventListener('change', () => this.clearSuggestion());
    }

    getFilteredRecipes() {
        const cuisineFilter = document.getElementById('cuisine-filter').value;

        return this.recipes.filter(recipe => {
            const cuisineMatch = cuisineFilter === 'all' || recipe.cuisine === cuisineFilter;
            return cuisineMatch;
        });
    }

    suggestRecipe() {
        const filteredRecipes = this.getFilteredRecipes();
        
        if (filteredRecipes.length === 0) {
            this.showError('条件に合うレシピが見つかりません');
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
        this.currentSuggestion = filteredRecipes[randomIndex];
        
        this.displayRecipe(this.currentSuggestion);
    }

    displayRecipe(recipe) {
        const recipeCard = document.getElementById('recipe-card');
        const recipeName = document.getElementById('recipe-name');
        const recipeDescription = document.getElementById('recipe-description');
        const recipeLink = document.getElementById('recipe-link');
        const decideBtn = document.getElementById('decide-btn');

        recipeName.textContent = recipe.name;
        recipeDescription.textContent = recipe.description;
        recipeLink.href = `https://delishkitchen.tv/search?q=${encodeURIComponent(recipe.name)}`;

        recipeCard.style.display = 'block';
        decideBtn.style.display = 'inline-block';
        
        // アニメーション効果
        recipeCard.classList.remove('show');
        setTimeout(() => {
            recipeCard.classList.add('show');
        }, 100);
    }

    clearSuggestion() {
        const recipeCard = document.getElementById('recipe-card');
        const decideBtn = document.getElementById('decide-btn');
        
        recipeCard.style.display = 'none';
        decideBtn.style.display = 'none';
        this.currentSuggestion = null;
    }

    decideRecipe() {
        if (!this.currentSuggestion) return;

        const historyItem = {
            ...this.currentSuggestion,
            decidedAt: new Date().toISOString(),
            date: new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            })
        };

        this.history.unshift(historyItem);
        
        // 履歴は最大20件まで保持
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.renderHistory();
        this.clearSuggestion();
        
        this.showSuccess('決定しました！履歴に追加されました');
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="no-history">まだ履歴がありません</p>';
            return;
        }

        const historyHTML = this.history.map(item => `
            <div class="history-item">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <p class="date">${item.date}</p>
            </div>
        `).join('');

        historyList.innerHTML = historyHTML;
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem('dinner-history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('履歴の読み込みに失敗しました:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('dinner-history', JSON.stringify(this.history));
        } catch (error) {
            console.error('履歴の保存に失敗しました:', error);
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // スタイルを追加
        Object.assign(messageElement.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 25px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            backgroundColor: type === 'error' ? '#e74c3c' : '#27ae60'
        });

        document.body.appendChild(messageElement);

        // 3秒後に自動で削除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 3000);
    }
}

// アプリを初期化
document.addEventListener('DOMContentLoaded', () => {
    new DinnerSuggestionApp();
});