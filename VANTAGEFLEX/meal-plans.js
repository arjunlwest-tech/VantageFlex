/**
 * Meal Plans Page Logic
 */

let currentPlan = null;

function initMealPlansPage() {
    initGenerateButton();
    initResetButton();
    loadSavedPlan();
}

function initGenerateButton() {
    const btn = document.getElementById('generate-plan-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        generateMealPlan();
    });
}

function initResetButton() {
    const btn = document.getElementById('reset-plan-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        document.getElementById('plan-goal').value = 'maintenance';
        document.getElementById('plan-diet').value = 'balanced';
        document.getElementById('plan-calories').value = '2200';
        
        document.getElementById('meal-plan-result').classList.add('hidden');
        document.getElementById('empty-plan').classList.remove('hidden');
        
        VantageFlex.Storage.remove('currentMealPlan');
    });
}

function generateMealPlan() {
    const goal = document.getElementById('plan-goal').value;
    const diet = document.getElementById('plan-diet').value;
    const targetCalories = parseInt(document.getElementById('plan-calories').value) || 2200;
    
    btnLoading(document.getElementById('generate-plan-btn'), true);
    
    setTimeout(() => {
        currentPlan = VantageFlex.generateMealPlan(goal);
        
        adjustPlanCalories(currentPlan, targetCalories);
        
        renderMealPlan(currentPlan);
        
        document.getElementById('empty-plan').classList.add('hidden');
        document.getElementById('meal-plan-result').classList.remove('hidden');
        
        VantageFlex.Storage.set('currentMealPlan', {
            plan: currentPlan,
            goal,
            diet,
            targetCalories,
            createdAt: new Date().toISOString()
        });
        
        btnLoading(document.getElementById('generate-plan-btn'), false);
        
        VantageFlex.showToast('Meal plan generated!', 'success');
    }, 600);
}

function adjustPlanCalories(plan, targetCalories) {
    const template = VantageFlex.MEAL_TEMPLATES.weight_loss;
    const ratio = targetCalories / (template.breakfast.calories + template.lunch.calories + 
                                     template.dinner.calories + template.snacks.calories);
    
    Object.values(plan).forEach(day => {
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            if (day[mealType]) {
                day[mealType].adjustedMacros = {
                    protein: Math.round(day[mealType].macros.protein * ratio),
                    carbs: Math.round(day[mealType].macros.carbs * ratio),
                    fat: Math.round(day[mealType].macros.fat * ratio),
                    calories: Math.round(day[mealType].macros.calories * ratio)
                };
            }
        });
    });
}

function renderMealPlan(plan) {
    const container = document.getElementById('planner-container');
    container.innerHTML = '';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    let totalCalories = 0;
    let totalProtein = 0;
    let mealCount = 0;
    
    days.forEach((day, index) => {
        const dayData = plan[day];
        const dayEl = document.createElement('div');
        dayEl.className = 'planner-day';
        
        const dayTotals = { calories: 0, protein: 0 };
        
        let mealsHtml = '';
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            const meal = dayData[mealType];
            if (meal) {
                const macros = meal.adjustedMacros || meal.macros;
                dayTotals.calories += macros.calories;
                dayTotals.protein += macros.protein;
                totalCalories += macros.calories;
                totalProtein += macros.protein;
                mealCount++;
                
                mealsHtml += `
                    <div class="day-meal">
                        <div style="font-weight: 600; margin-bottom: 2px;">${meal.emoji} ${meal.name}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">
                            ${macros.calories} cal • ${macros.protein}g protein
                        </div>
                    </div>
                `;
            }
        });
        
        dayEl.innerHTML = `
            <div class="day-header">${dayLabels[index]}</div>
            <div class="day-content">
                ${mealsHtml}
            </div>
            <div class="day-total">
                ${dayTotals.calories} cal • ${dayTotals.protein}g protein
            </div>
        `;
        
        container.appendChild(dayEl);
    });
    
    document.getElementById('plan-total-calories').textContent = 
        Math.round(totalCalories / 7).toLocaleString();
    document.getElementById('plan-total-protein').textContent = 
        `${Math.round(totalProtein / 7)}g`;
    document.getElementById('plan-meal-count').textContent = mealCount;
}

function loadSavedPlan() {
    const saved = VantageFlex.Storage.get('currentMealPlan');
    if (saved) {
        document.getElementById('plan-goal').value = saved.goal;
        document.getElementById('plan-diet').value = saved.diet;
        document.getElementById('plan-calories').value = saved.targetCalories;
        
        currentPlan = saved.plan;
        renderMealPlan(currentPlan);
        
        document.getElementById('empty-plan').classList.add('hidden');
        document.getElementById('meal-plan-result').classList.remove('hidden');
    }
}

function btnLoading(btn, loading) {
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span> Generating...';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText;
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', initMealPlansPage);
