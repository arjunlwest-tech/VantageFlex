/**
 * Dashboard Page Logic
 */

function initDashboardPage() {
    loadStats();
    loadDailyQuote();
    loadSavedWorkouts();
    loadSavedRecipes();
    initQuoteButton();
}

function loadStats() {
    const stats = VantageFlex.UserState.getStats();
    
    animateValue('streak-count', stats.streak);
    animateValue('total-workouts', stats.workoutsCompleted);
    animateValue('total-minutes', stats.totalMinutes);
}

function animateValue(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const start = parseInt(el.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * easeOut);
        
        el.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function loadDailyQuote() {
    const quote = VantageFlex.getDailyMotivation();
    
    const quoteEl = document.getElementById('daily-quote');
    const authorEl = document.getElementById('quote-author');
    
    if (quoteEl) quoteEl.textContent = `"${quote.quote}"`;
    if (authorEl) authorEl.textContent = `— ${quote.author}`;
}

function initQuoteButton() {
    const btn = document.getElementById('new-quote-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        const quote = VantageFlex.getRandomQuote();
        
        const quoteEl = document.getElementById('daily-quote');
        const authorEl = document.getElementById('quote-author');
        
        quoteEl.style.opacity = '0';
        authorEl.style.opacity = '0';
        
        setTimeout(() => {
            quoteEl.textContent = `"${quote.quote}"`;
            authorEl.textContent = `— ${quote.author}`;
            quoteEl.style.opacity = '1';
            authorEl.style.opacity = '1';
        }, 200);
    });
}

function loadSavedWorkouts() {
    const saved = VantageFlex.Storage.get('savedWorkouts', []);
    const container = document.getElementById('saved-workouts-list');
    const countEl = document.getElementById('saved-count');
    
    if (countEl) countEl.textContent = `${saved.length} saved`;
    
    if (!container) return;
    
    if (saved.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-small" style="color: var(--text-muted);">
                No saved workouts yet. Generate and save workouts from the Workouts page!
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    saved.slice().reverse().forEach((workout, index) => {
        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <div class="exercise-number">${saved.length - index}</div>
            <div class="exercise-info">
                <div class="exercise-name">${workout.split.toUpperCase()} • ${workout.level}</div>
                <div class="exercise-details">
                    ${workout.exercises.length} exercises • ${workout.duration} min • ${formatDate(workout.date)}
                </div>
            </div>
            <button class="btn btn-icon delete-workout-btn" data-index="${saved.length - 1 - index}" style="opacity: 0.5;">
                <span>🗑️</span>
            </button>
        `;
        
        item.querySelector('.delete-workout-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteWorkout(parseInt(e.currentTarget.dataset.index));
        });
        
        container.appendChild(item);
    });
}

function deleteWorkout(index) {
    const saved = VantageFlex.Storage.get('savedWorkouts', []);
    saved.splice(index, 1);
    VantageFlex.Storage.set('savedWorkouts', saved);
    loadSavedWorkouts();
    VantageFlex.showToast('Workout deleted', 'info');
}

function loadSavedRecipes() {
    const saved = VantageFlex.UserState.getSavedRecipes();
    const container = document.getElementById('saved-recipes-list');
    const countEl = document.getElementById('saved-recipes-count');
    
    if (countEl) countEl.textContent = `${saved.length} saved`;
    
    if (!container) return;
    
    if (saved.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-small" style="color: var(--text-muted);">
                No saved recipes yet. Find and save recipes from the Recipes page!
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    saved.slice().reverse().forEach((recipe, index) => {
        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.innerHTML = `
            <div style="font-size: 24px;">${recipe.emoji}</div>
            <div class="exercise-info">
                <div class="exercise-name">${recipe.name}</div>
                <div class="exercise-details">
                    ${recipe.macros.calories} cal • ${recipe.macros.protein}g protein
                </div>
            </div>
            <button class="btn btn-icon delete-recipe-btn" data-index="${saved.length - 1 - index}" style="opacity: 0.5;">
                <span>🗑️</span>
            </button>
        `;
        
        item.querySelector('.delete-recipe-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRecipe(parseInt(e.currentTarget.dataset.index));
        });
        
        container.appendChild(item);
    });
}

function deleteRecipe(index) {
    const saved = VantageFlex.UserState.getSavedRecipes();
    saved.splice(index, 1);
    VantageFlex.Storage.set('savedRecipes', saved);
    loadSavedRecipes();
    VantageFlex.showToast('Recipe deleted', 'info');
}

function formatDate(isoString) {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

document.addEventListener('DOMContentLoaded', initDashboardPage);
