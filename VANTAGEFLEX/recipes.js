/**
 * Recipe Generator Page Logic
 */

let currentIngredients = [];
let matchedRecipes = [];
let recipePreferences = {
    mealType: 'any',
    diet: 'high-protein',
    flavor: 'any'
};

function initRecipesPage() {
    initIngredientInput();
    initSuggestedIngredients();
    initPreferenceControls();
    initFindRecipesButton();
    initClearButton();
    initModal();
    loadSavedIngredients();
    loadSavedPreferences();
}

function initPreferenceControls() {
    // Meal type select
    document.getElementById('meal-type').addEventListener('change', (e) => {
        recipePreferences.mealType = e.target.value;
        savePreferences();
    });
    
    // Diet preferences toggle buttons
    document.querySelectorAll('#diet-preferences .btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#diet-preferences .btn-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            recipePreferences.diet = btn.dataset.value;
            savePreferences();
        });
    });
    
    // Flavor preferences chips
    document.querySelectorAll('#flavor-preferences .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#flavor-preferences .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            recipePreferences.flavor = chip.dataset.value;
            savePreferences();
        });
    });
}

function savePreferences() {
    VantageFlex.Storage.set('recipePreferences', recipePreferences);
}

function loadSavedPreferences() {
    const saved = VantageFlex.Storage.get('recipePreferences');
    if (saved) {
        recipePreferences = saved;
        
        // Restore UI state
        document.getElementById('meal-type').value = saved.mealType;
        
        document.querySelectorAll('#diet-preferences .btn-toggle').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === saved.diet);
        });
        
        document.querySelectorAll('#flavor-preferences .chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.value === saved.flavor);
        });
    }
}

function initIngredientInput() {
    const input = document.getElementById('ingredient-input');
    const btn = document.getElementById('add-ingredient-btn');
    
    btn.addEventListener('click', () => addIngredient(input.value));
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addIngredient(input.value);
        }
    });
}

function initSuggestedIngredients() {
    document.querySelectorAll('#suggested-ingredients .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            addIngredient(chip.textContent);
        });
    });
}

function addIngredient(value) {
    if (!value.trim()) return;
    
    const normalized = value.trim().toLowerCase();
    if (currentIngredients.includes(normalized)) {
        VantageFlex.showToast('Ingredient already added', 'info');
        return;
    }
    
    currentIngredients.push(normalized);
    renderIngredients();
    
    document.getElementById('ingredient-input').value = '';
    
    VantageFlex.Storage.set('recipeIngredients', currentIngredients);
}

function removeIngredient(ingredient) {
    currentIngredients = currentIngredients.filter(i => i !== ingredient);
    renderIngredients();
    VantageFlex.Storage.set('recipeIngredients', currentIngredients);
}

function renderIngredients() {
    const container = document.getElementById('ingredient-list');
    container.innerHTML = '';
    
    currentIngredients.forEach(ingredient => {
        const chip = document.createElement('span');
        chip.className = 'chip chip-removable active';
        chip.textContent = ingredient;
        chip.addEventListener('click', () => removeIngredient(ingredient));
        container.appendChild(chip);
    });
}

function initFindRecipesButton() {
    const btn = document.getElementById('find-recipes-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        findRecipes();
    });
}

function initClearButton() {
    const btn = document.getElementById('clear-ingredients-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        currentIngredients = [];
        renderIngredients();
        VantageFlex.Storage.remove('recipeIngredients');
        document.getElementById('recipes-result').classList.add('hidden');
    });
}

function findRecipes() {
    if (currentIngredients.length === 0) {
        VantageFlex.showToast('Add some ingredients first!', 'error');
        return;
    }
    
    const targetCalories = parseInt(document.getElementById('target-calories').value) || 500;
    const minProtein = parseInt(document.getElementById('min-protein').value) || 25;
    
    btnLoading(document.getElementById('find-recipes-btn'), true);
    
    setTimeout(() => {
        // Get base matches from ingredients
        matchedRecipes = VantageFlex.findRecipesByIngredients(currentIngredients);
        
        // Apply preference filters
        matchedRecipes = applyPreferenceFilters(matchedRecipes, {
            minProtein,
            targetCalories,
            mealType: recipePreferences.mealType,
            diet: recipePreferences.diet,
            flavor: recipePreferences.flavor
        });
        
        renderRecipes(matchedRecipes, targetCalories);
        
        document.getElementById('recipes-result').classList.remove('hidden');
        document.getElementById('recipe-count').textContent = 
            `${matchedRecipes.length} custom recipes found`;
        
        document.getElementById('recipes-result').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
        
        btnLoading(document.getElementById('find-recipes-btn'), false);
        
        if (matchedRecipes.length > 0) {
            VantageFlex.showToast(`Found ${matchedRecipes.length} matching recipes!`, 'success');
        } else {
            VantageFlex.showToast('No exact matches. Try adjusting your preferences!', 'info');
        }
    }, 600);
}

function applyPreferenceFilters(recipes, preferences) {
    return recipes.filter(recipe => {
        // Protein filter
        if (recipe.macros.protein < preferences.minProtein) {
            return false;
        }
        
        // Diet filter
        if (preferences.diet === 'low-carb' && recipe.macros.carbs > 30) {
            return false;
        }
        if (preferences.diet === 'keto' && recipe.macros.carbs > 15) {
            return false;
        }
        if (preferences.diet === 'high-protein' && recipe.macros.protein < 30) {
            return false;
        }
        
        // Meal type filter (using recipe characteristics)
        if (preferences.mealType === 'breakfast' && !isBreakfastRecipe(recipe)) {
            return false;
        }
        if (preferences.mealType === 'post-workout' && recipe.macros.protein < 25) {
            return false;
        }
        if (preferences.mealType === 'snack' && recipe.macros.calories > 400) {
            return false;
        }
        
        // Flavor filter (using recipe tags/ingredients)
        if (preferences.flavor !== 'any' && !matchesFlavor(recipe, preferences.flavor)) {
            return false;
        }
        
        return true;
    });
}

function isBreakfastRecipe(recipe) {
    const breakfastKeywords = ['egg', 'oat', 'pancake', 'breakfast', 'yogurt', 'granola'];
    return breakfastKeywords.some(kw => 
        recipe.name.toLowerCase().includes(kw) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(kw))
    );
}

function matchesFlavor(recipe, flavor) {
    const flavorMap = {
        'savory': ['chicken', 'beef', 'salmon', 'turkey', 'steak'],
        'spicy': ['chili', 'cajun', 'hot', 'spicy', 'pepper'],
        'sweet': ['honey', 'banana', 'berry', 'vanilla', 'chocolate'],
        'mediterranean': ['olive', 'feta', 'greek', 'herb', 'lemon'],
        'asian': ['soy', 'ginger', 'sesame', 'rice', 'stir-fry'],
        'mexican': ['cilantro', 'lime', 'pepper', 'bean', 'salsa']
    };
    
    const keywords = flavorMap[flavor] || [];
    return keywords.some(kw => 
        recipe.name.toLowerCase().includes(kw) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(kw))
    );
}

function renderRecipes(recipes, targetCalories) {
    const container = document.getElementById('recipes-container');
    container.innerHTML = '';
    
    if (recipes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12" style="grid-column: 1 / -1;">
                <div style="font-size: 48px; margin-bottom: var(--space-md);">🔍</div>
                <h3 class="heading-md mb-2">No Exact Matches</h3>
                <p class="text-body">Try adding more common ingredients like chicken, eggs, rice, or vegetables.</p>
            </div>
        `;
        return;
    }
    
    recipes.forEach(recipe => {
        const ratio = targetCalories / recipe.macros.calories;
        const adjustedMacros = {
            calories: Math.round(recipe.macros.calories * ratio),
            protein: Math.round(recipe.macros.protein * ratio),
            carbs: Math.round(recipe.macros.carbs * ratio),
            fat: Math.round(recipe.macros.fat * ratio)
        };
        
        const matchCount = recipe.ingredients.filter(ing => 
            currentIngredients.some(userIng => 
                ing.includes(userIng) || userIng.includes(ing)
            )
        ).length;
        
        const card = document.createElement('div');
        card.className = 'meal-card';
        card.innerHTML = `
            <div class="meal-image">${recipe.emoji}</div>
            <div class="meal-content">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
                    <h3 class="meal-title">${recipe.name}</h3>
                    <span class="badge badge-success">${matchCount} matches</span>
                </div>
                <p class="text-small" style="margin-bottom: var(--space-md);">
                    ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}
                </p>
                <div class="recipe-portion">
                    <span>🍽️</span> ${recipe.portion}
                </div>
                <div class="meal-macros">
                    <div class="macro-item">
                        <span class="macro-value macro-calories">${adjustedMacros.calories}</span>
                        <span class="macro-label">Cal</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-value macro-protein">${adjustedMacros.protein}g</span>
                        <span class="macro-label">Protein</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-value macro-carbs">${adjustedMacros.carbs}g</span>
                        <span class="macro-label">Carbs</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-value macro-fat">${adjustedMacros.fat}g</span>
                        <span class="macro-label">Fat</span>
                    </div>
                </div>
                <button class="btn btn-secondary w-full mt-4 view-recipe-btn" data-recipe-id="${recipe.id}">
                    <span>👨‍🍳</span> View Recipe
                </button>
            </div>
        `;
        
        card.querySelector('.view-recipe-btn').addEventListener('click', () => {
            showRecipeModal(recipe, adjustedMacros);
        });
        
        container.appendChild(card);
    });
}

function showRecipeModal(recipe, adjustedMacros) {
    const modal = document.getElementById('recipe-modal');
    const nameEl = document.getElementById('modal-recipe-name');
    const contentEl = document.getElementById('modal-recipe-content');
    
    nameEl.textContent = `${recipe.emoji} ${recipe.name}`;
    
    const matchCount = recipe.ingredients.filter(ing => 
        currentIngredients.some(userIng => 
            ing.includes(userIng) || userIng.includes(ing)
        )
    ).length;
    
    contentEl.innerHTML = `
        <div class="recipe-portion mb-4">
            <span>🍽️</span> ${recipe.portion}
        </div>
        
        <div class="grid-4 mb-6" style="background: rgba(255,255,255,0.03); padding: var(--space-md); border-radius: var(--radius-md);">
            <div class="text-center">
                <div style="font-size: 24px; font-weight: 900; color: var(--primary-orange);">${adjustedMacros.calories}</div>
                <div class="text-xs" style="color: var(--text-muted);">Calories</div>
            </div>
            <div class="text-center">
                <div style="font-size: 24px; font-weight: 900; color: #22c55e;">${adjustedMacros.protein}g</div>
                <div class="text-xs" style="color: var(--text-muted);">Protein</div>
            </div>
            <div class="text-center">
                <div style="font-size: 24px; font-weight: 900; color: #3b82f6;">${adjustedMacros.carbs}g</div>
                <div class="text-xs" style="color: var(--text-muted);">Carbs</div>
            </div>
            <div class="text-center">
                <div style="font-size: 24px; font-weight: 900; color: #f59e0b;">${adjustedMacros.fat}g</div>
                <div class="text-xs" style="color: var(--text-muted);">Fat</div>
            </div>
        </div>
        
        <div class="mb-6">
            <h4 class="font-bold mb-3">Ingredients (${matchCount}/${recipe.ingredients.length} available)</h4>
            <div class="chips-container">
                ${recipe.ingredients.map(ing => {
                    const hasIt = currentIngredients.some(userIng => 
                        ing.includes(userIng) || userIng.includes(ing)
                    );
                    return `<span class="chip ${hasIt ? 'active' : ''}">${hasIt ? '✓' : '•'} ${ing}</span>`;
                }).join('')}
            </div>
        </div>
        
        <div class="mb-6">
            <h4 class="font-bold mb-3">Instructions</h4>
            <ol style="list-style: none; counter-reset: step;">
                ${recipe.instructions.map(step => `
                    <li style="padding: var(--space-md) 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: var(--space-md);">
                        <span style="width: 28px; height: 28px; background: var(--gradient-fire); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;"></span>
                        <span>${step}</span>
                    </li>
                `).join('')}
            </ol>
        </div>
        
        <button class="btn btn-primary w-full save-to-dashboard-btn">
            <span>💾</span> Save to Dashboard
        </button>
    `;
    
    contentEl.querySelector('.save-to-dashboard-btn').addEventListener('click', () => {
        VantageFlex.UserState.saveRecipe(recipe);
        VantageFlex.showToast('Recipe saved!', 'success');
        modal.classList.add('hidden');
    });
    
    modal.classList.remove('hidden');
}

function initModal() {
    const modal = document.getElementById('recipe-modal');
    const closeBtn = document.getElementById('close-modal');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

function loadSavedIngredients() {
    const saved = VantageFlex.Storage.get('recipeIngredients', []);
    currentIngredients = saved;
    renderIngredients();
}

function btnLoading(btn, loading) {
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span> Searching...';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText;
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', initRecipesPage);
