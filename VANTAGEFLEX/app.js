/**
 * VANTAGE FLEX - PREMIUM FITNESS APP
 * JavaScript Application Logic
 */

// ========================================
// DATA & CONFIGURATION
// ========================================

const EXERCISE_DATABASE = {
    push: {
        compound: [
            { name: "Barbell Bench Press", sets: { beginner: 3, intermediate: 4, advanced: 5, elite: 5 }, reps: "6-10" },
            { name: "Incline Dumbbell Press", sets: { beginner: 3, intermediate: 4, advanced: 4, elite: 5 }, reps: "8-12" },
            { name: "Overhead Press", sets: { beginner: 3, intermediate: 4, advanced: 5, elite: 5 }, reps: "6-10" },
            { name: "Dips", sets: { beginner: 3, intermediate: 4, advanced: 4, elite: 5 }, reps: "8-15" }
        ],
        isolation: [
            { name: "Cable Flyes", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "12-15" },
            { name: "Lateral Raises", sets: { beginner: 3, intermediate: 4, advanced: 5, elite: 5 }, reps: "12-20" },
            { name: "Tricep Pushdowns", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "10-15" },
            { name: "Overhead Tricep Extension", sets: { beginner: 3, intermediate: 3, advanced: 3, elite: 4 }, reps: "10-12" }
        ]
    },
    pull: {
        compound: [
            { name: "Deadlifts", sets: { beginner: 3, intermediate: 4, advanced: 5, elite: 5 }, reps: "5-8" },
            { name: "Pull-Ups", sets: { beginner: 3, intermediate: 4, advanced: 4, elite: 5 }, reps: "6-12" },
            { name: "Barbell Rows", sets: { beginner: 3, intermediate: 4, advanced: 4, elite: 5 }, reps: "8-12" },
            { name: "T-Bar Rows", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "8-12" }
        ],
        isolation: [
            { name: "Face Pulls", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "15-20" },
            { name: "Barbell Curls", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "10-12" },
            { name: "Hammer Curls", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "10-12" },
            { name: "Lat Pulldowns", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "10-15" }
        ]
    },
    legs: {
        compound: [
            { name: "Squats", sets: { beginner: 3, intermediate: 4, advanced: 5, elite: 6 }, reps: "6-10" },
            { name: "Romanian Deadlifts", sets: { beginner: 3, intermediate: 4, advanced: 4, elite: 5 }, reps: "8-12" },
            { name: "Leg Press", sets: { beginner: 3, intermediate: 4, advanced: 5, elite: 5 }, reps: "10-15" },
            { name: "Bulgarian Split Squats", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "10-12" }
        ],
        isolation: [
            { name: "Leg Extensions", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "12-15" },
            { name: "Leg Curls", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "12-15" },
            { name: "Calf Raises", sets: { beginner: 4, intermediate: 5, advanced: 5, elite: 6 }, reps: "15-20" },
            { name: "Hip Thrusts", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "10-15" }
        ]
    },
    fullbody: {
        compound: [
            { name: "Squats", sets: { beginner: 3, intermediate: 4, advanced: 5, elite: 5 }, reps: "6-10" },
            { name: "Bench Press", sets: { beginner: 3, intermediate: 4, advanced: 4, elite: 5 }, reps: "6-10" },
            { name: "Deadlifts", sets: { beginner: 2, intermediate: 3, advanced: 4, elite: 4 }, reps: "5-8" },
            { name: "Overhead Press", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "6-10" },
            { name: "Pull-Ups", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "6-12" }
        ],
        isolation: [
            { name: "Planks", sets: { beginner: 3, intermediate: 3, advanced: 4, elite: 4 }, reps: "30-60s" },
            { name: "Lunges", sets: { beginner: 3, intermediate: 3, advanced: 3, elite: 4 }, reps: "10-12" }
        ]
    }
};

const RECIPE_DATABASE = [
    {
        id: 1,
        name: "High-Protein Chicken Bowl",
        emoji: "🍗",
        ingredients: ["chicken breast", "rice", "broccoli", "olive oil", "garlic"],
        macros: { protein: 45, carbs: 55, fat: 12, calories: 480 },
        portion: "350g serving",
        instructions: ["Season chicken with salt, pepper, and garlic", "Grill chicken 6-7 min per side", "Steam broccoli 4-5 minutes", "Serve over 1 cup cooked rice with olive oil drizzle"]
    },
    {
        id: 2,
        name: "Salmon Power Plate",
        emoji: "🐟",
        ingredients: ["salmon", "quinoa", "asparagus", "lemon", "butter"],
        macros: { protein: 38, carbs: 35, fat: 22, calories: 490 },
        portion: "300g serving",
        instructions: ["Season salmon with lemon, salt, and pepper", "Bake at 400°F for 12-15 minutes", "Cook quinoa according to package", "Roast asparagus with butter for 8 minutes"]
    },
    {
        id: 3,
        name: "Lean Beef Stir-Fry",
        emoji: "🥩",
        ingredients: ["beef sirloin", "bell peppers", "onion", "soy sauce", "rice"],
        macros: { protein: 42, carbs: 48, fat: 15, calories: 495 },
        portion: "400g serving",
        instructions: ["Slice beef into thin strips", "Stir-fry beef 2-3 minutes until browned", "Add vegetables and soy sauce", "Serve over 1 cup rice"]
    },
    {
        id: 4,
        name: "Egg White Breakfast Scramble",
        emoji: "🍳",
        ingredients: ["egg whites", "spinach", "mushrooms", "turkey bacon", "avocado"],
        macros: { protein: 35, carbs: 8, fat: 18, calories: 320 },
        portion: "250g serving",
        instructions: ["Cook turkey bacon until crispy", "Sauté mushrooms and spinach", "Add egg whites, scramble until cooked", "Top with sliced avocado"]
    },
    {
        id: 5,
        name: "Greek Yogurt Protein Parfait",
        emoji: "🥣",
        ingredients: ["greek yogurt", "berries", "granola", "honey", "chia seeds"],
        macros: { protein: 28, carbs: 42, fat: 8, calories: 340 },
        portion: "280g serving",
        instructions: ["Layer Greek yogurt in a bowl", "Add mixed berries", "Sprinkle granola and chia seeds", "Drizzle with honey"]
    },
    {
        id: 6,
        name: "Tuna Power Salad",
        emoji: "🥗",
        ingredients: ["tuna", "mixed greens", "chickpeas", "cucumber", "olive oil", "lemon"],
        macros: { protein: 32, carbs: 22, fat: 14, calories: 340 },
        portion: "320g serving",
        instructions: ["Drain tuna and mix with olive oil and lemon", "Chop cucumber and greens", "Combine all ingredients in a bowl", "Season with salt and pepper"]
    },
    {
        id: 7,
        name: "Turkey & Sweet Potato",
        emoji: "🦃",
        ingredients: ["ground turkey", "sweet potato", "green beans", "garlic", "paprika"],
        macros: { protein: 40, carbs: 45, fat: 10, calories: 420 },
        portion: "380g serving",
        instructions: ["Cube and roast sweet potato at 425°F for 25 min", "Cook ground turkey with garlic and paprika", "Steam green beans for 5 minutes", "Combine and serve"]
    },
    {
        id: 8,
        name: "Protein Pancakes",
        emoji: "🥞",
        ingredients: ["protein powder", "oats", "egg whites", "banana", "almond milk"],
        macros: { protein: 30, carbs: 40, fat: 6, calories: 350 },
        portion: "3 pancakes",
        instructions: ["Blend oats into flour", "Mix with protein powder, egg whites, and almond milk", "Cook on griddle until golden", "Top with sliced banana"]
    },
    {
        id: 9,
        name: "Shrimp & Vegetable Skewers",
        emoji: "🦐",
        ingredients: ["shrimp", "zucchini", "cherry tomatoes", "olive oil", "rice"],
        macros: { protein: 35, carbs: 38, fat: 10, calories: 370 },
        portion: "300g serving",
        instructions: ["Marinate shrimp in olive oil and herbs", "Thread shrimp and vegetables onto skewers", "Grill 2-3 minutes per side", "Serve with rice"]
    },
    {
        id: 10,
        name: "Cottage Cheese Power Bowl",
        emoji: "🧀",
        ingredients: ["cottage cheese", "pineapple", "almonds", "flax seeds", "protein powder"],
        macros: { protein: 32, carbs: 28, fat: 14, calories: 360 },
        portion: "250g serving",
        instructions: ["Mix cottage cheese with protein powder", "Top with diced pineapple", "Add almonds and flax seeds", "Chill before serving"]
    },
    {
        id: 11,
        name: "Chicken Fajita Bowl",
        emoji: "🌮",
        ingredients: ["chicken thigh", "bell peppers", "onion", "black beans", "cilantro", "lime"],
        macros: { protein: 38, carbs: 35, fat: 16, calories: 440 },
        portion: "380g serving",
        instructions: ["Slice chicken and vegetables", "Sauté chicken until cooked through", "Add peppers and onions", "Finish with lime and cilantro"]
    },
    {
        id: 12,
        name: "Baked Cod with Vegetables",
        emoji: "🐟",
        ingredients: ["cod", "broccoli", "carrots", "olive oil", "herbs"],
        macros: { protein: 36, carbs: 15, fat: 10, calories: 310 },
        portion: "320g serving",
        instructions: ["Season cod with herbs and olive oil", "Bake at 400°F for 12-15 minutes", "Steam vegetables until tender", "Serve together"]
    }
];

const MOTIVATION_QUOTES = [
    { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { quote: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Andrew Murphy" },
    { quote: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
    { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
    { quote: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { quote: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Unknown" },
    { quote: "Sweat is just fat crying.", author: "Unknown" },
    { quote: "The hardest lift of all is lifting your butt off the couch.", author: "Unknown" },
    { quote: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
    { quote: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
    { quote: "A one-hour workout is 4% of your day. No excuses.", author: "Unknown" },
    { quote: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" }
];

const MEAL_TEMPLATES = {
    weight_loss: {
        breakfast: { calories: 350, protein: 25, carbs: 35, fat: 10 },
        lunch: { calories: 450, protein: 40, carbs: 40, fat: 12 },
        dinner: { calories: 500, protein: 45, carbs: 45, fat: 15 },
        snacks: { calories: 200, protein: 15, carbs: 20, fat: 5 }
    },
    maintenance: {
        breakfast: { calories: 500, protein: 30, carbs: 50, fat: 15 },
        lunch: { calories: 600, protein: 45, carbs: 60, fat: 18 },
        dinner: { calories: 650, protein: 50, carbs: 65, fat: 20 },
        snacks: { calories: 300, protein: 20, carbs: 30, fat: 8 }
    },
    muscle_gain: {
        breakfast: { calories: 650, protein: 40, carbs: 70, fat: 20 },
        lunch: { calories: 750, protein: 55, carbs: 80, fat: 22 },
        dinner: { calories: 800, protein: 60, carbs: 85, fat: 25 },
        snacks: { calories: 400, protein: 25, carbs: 40, fat: 12 }
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// LOCAL STORAGE
// ========================================

const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`vf_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(`vf_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(`vf_${key}`);
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};

// ========================================
// USER STATE
// ========================================

const UserState = {
    getStats() {
        return Storage.get('stats', {
            workoutsCompleted: 0,
            streak: 0,
            lastWorkout: null,
            totalMinutes: 0,
            favoriteSplit: 'push'
        });
    },
    
    updateStats(updates) {
        const stats = this.getStats();
        Storage.set('stats', { ...stats, ...updates });
    },
    
    recordWorkout() {
        const stats = this.getStats();
        const today = new Date().toDateString();
        const lastWorkout = stats.lastWorkout;
        
        let newStreak = stats.streak;
        if (lastWorkout) {
            const lastDate = new Date(lastWorkout);
            const todayDate = new Date();
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                newStreak++;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }
        
        this.updateStats({
            workoutsCompleted: stats.workoutsCompleted + 1,
            streak: newStreak,
            lastWorkout: today
        });
        
        return newStreak;
    },
    
    getMealPlan() {
        return Storage.get('mealPlan', {});
    },
    
    saveMealPlan(plan) {
        Storage.set('mealPlan', plan);
    },
    
    getSavedRecipes() {
        return Storage.get('savedRecipes', []);
    },
    
    saveRecipe(recipe) {
        const saved = this.getSavedRecipes();
        if (!saved.find(r => r.id === recipe.id)) {
            saved.push(recipe);
            Storage.set('savedRecipes', saved);
        }
    }
};

// ========================================
// WORKOUT GENERATOR
// ========================================

function generateWorkout(split, level, goal, duration) {
    const exercises = EXERCISE_DATABASE[split] || EXERCISE_DATABASE.fullbody;
    const numExercises = Math.min(Math.floor(duration / 10), 8);
    
    const selectedCompound = randomItem(exercises.compound);
    const selectedIsolation = [];
    
    const isolationPool = [...exercises.isolation].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numExercises - 1, isolationPool.length); i++) {
        selectedIsolation.push(isolationPool[i]);
    }
    
    return {
        split,
        level,
        goal,
        duration,
        exercises: [
            { ...selectedCompound, type: 'compound' },
            ...selectedIsolation.map(e => ({ ...e, type: 'isolation' }))
        ]
    };
}

function getSetsForLevel(exercise, level) {
    return exercise.sets[level] || exercise.sets.intermediate;
}

// ========================================
// RECIPE MATCHER
// ========================================

function findRecipesByIngredients(ingredients) {
    const normalizedIngredients = ingredients.map(i => i.toLowerCase().trim());
    
    return RECIPE_DATABASE.filter(recipe => {
        const matchCount = recipe.ingredients.filter(ingredient => {
            return normalizedIngredients.some(userIng => 
                ingredient.includes(userIng) || userIng.includes(ingredient)
            );
        }).length;
        return matchCount >= 1;
    }).sort((a, b) => {
        const aMatches = a.ingredients.filter(ing => 
            normalizedIngredients.some(ui => ing.includes(ui) || ui.includes(ing))
        ).length;
        const bMatches = b.ingredients.filter(ing => 
            normalizedIngredients.some(ui => ing.includes(ui) || ui.includes(ing))
        ).length;
        return bMatches - aMatches;
    });
}

function calculateMacrosForPortion(recipe, targetCalories) {
    const ratio = targetCalories / recipe.macros.calories;
    return {
        protein: Math.round(recipe.macros.protein * ratio),
        carbs: Math.round(recipe.macros.carbs * ratio),
        fat: Math.round(recipe.macros.fat * ratio),
        calories: targetCalories
    };
}

// ========================================
// MEAL PLANNER
// ========================================

function generateMealPlan(goal) {
    const template = MEAL_TEMPLATES[goal] || MEAL_TEMPLATES.maintenance;
    const plan = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        plan[day] = {
            breakfast: randomItem(RECIPE_DATABASE.filter(r => r.macros.calories < template.breakfast.calories + 100)),
            lunch: randomItem(RECIPE_DATABASE.filter(r => r.macros.calories < template.lunch.calories + 100)),
            dinner: randomItem(RECIPE_DATABASE.filter(r => r.macros.calories < template.dinner.calories + 100)),
            snacks: randomItem(RECIPE_DATABASE.filter(r => r.macros.calories < template.snacks.calories + 100))
        };
    });
    
    return plan;
}

function calculateDailyTotals(meals) {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    Object.values(meals).forEach(meal => {
        if (meal && meal.macros) {
            totals.calories += meal.macros.calories;
            totals.protein += meal.macros.protein;
            totals.carbs += meal.macros.carbs;
            totals.fat += meal.macros.fat;
        }
    });
    return totals;
}

// ========================================
// MOTIVATION
// ========================================

function getRandomQuote() {
    return randomItem(MOTIVATION_QUOTES);
}

function getDailyMotivation() {
    const today = new Date().toDateString();
    const saved = Storage.get('dailyMotivation', {});
    
    if (saved.date !== today) {
        const newQuote = getRandomQuote();
        Storage.set('dailyMotivation', { date: today, quote: newQuote });
        return newQuote;
    }
    
    return saved.quote;
}

// ========================================
// UI HELPERS
// ========================================

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '16px 24px',
        background: type === 'success' ? '#22c55e' : type === 'error' ? '#e63946' : '#3b82f6',
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function animateNumber(element, target, duration = 1000) {
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.round(current));
        }
    }, 16);
}

function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    return spinner;
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const nav = document.querySelector('.nav-premium');
    if (!nav) return;
    
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, 50));
    
    // Set active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to { opacity: 0; transform: translateX(20px); }
        }
    `;
    document.head.appendChild(style);
});

// ========================================
// QUEST SYSTEM
// ========================================

const QUESTS = {
    daily: [
        { id: 'daily_pushups', name: "Push-Up Power", description: "Complete 20 push-ups with proper form", exercise: "pushup", target: 20, xp: 100, difficulty: 'easy' },
        { id: 'daily_squats', name: "Squat Master", description: "Complete 30 bodyweight squats", exercise: "squat", target: 30, xp: 100, difficulty: 'easy' },
        { id: 'daily_plank', name: "Core Crusher", description: "Hold plank position for 60 seconds", exercise: "plank", target: 60, xp: 150, difficulty: 'medium' },
        { id: 'daily_lunges', name: "Leg Day", description: "Complete 20 lunges per leg", exercise: "lunge", target: 40, xp: 120, difficulty: 'medium' },
        { id: 'daily_chinups', name: "Pull Power", description: "Complete 5 chin-ups with full range", exercise: "chinup", target: 5, xp: 200, difficulty: 'hard' }
    ],
    weekly: [
        { id: 'weekly_workouts', name: "Consistency King", description: "Complete 5 workouts this week", target: 5, xp: 500, type: 'workouts' },
        { id: 'weekly_quests', name: "Quest Master", description: "Complete 10 daily quests", target: 10, xp: 1000, type: 'quests' },
        { id: 'weekly_protein', name: "Protein Goal", description: "Hit protein target 7 days in a row", target: 7, xp: 750, type: 'protein' }
    ],
    special: [
        { id: 'special_first', name: "First Steps", description: "Complete your first verified exercise", xp: 50, oneTime: true },
        { id: 'special_streak_7', name: "Week Warrior", description: "Maintain a 7-day streak", xp: 300, oneTime: false },
        { id: 'special_streak_30', name: "Monthly Master", description: "Maintain a 30-day streak", xp: 1000, oneTime: false },
        { id: 'special_1000xp', name: "XP Milestone", description: "Earn 1000 total XP", xp: 200, oneTime: false },
        { id: 'special_5000xp', name: "XP Legend", description: "Earn 5000 total XP", xp: 500, oneTime: false }
    ]
};

const LEADERBOARD_DATA = [
    { id: 1, name: "FlexBeast99", xp: 12500, level: 25, streak: 45, avatar: "🔥" },
    { id: 2, name: "IronGains", xp: 11200, level: 22, streak: 32, avatar: "💪" },
    { id: 3, name: "SwolePatrol", xp: 9800, level: 20, streak: 28, avatar: "🏆" },
    { id: 4, name: "RepMaster", xp: 8700, level: 18, streak: 21, avatar: "⚡" },
    { id: 5, name: "GymShark", xp: 7600, level: 16, streak: 18, avatar: "🦈" },
    { id: 6, name: "LiftKing", xp: 6500, level: 14, streak: 15, avatar: "👑" },
    { id: 7, name: "FitWarrior", xp: 5400, level: 12, streak: 12, avatar: "⚔️" },
    { id: 8, name: "CardioGod", xp: 4300, level: 10, streak: 9, avatar: "🏃" },
    { id: 9, name: "PowerLift", xp: 3200, level: 8, streak: 7, avatar: "🏋️" },
    { id: 10, name: "HealthHero", xp: 2100, level: 6, streak: 5, avatar: "🌟" }
];

// ========================================
// XP & LEVEL SYSTEM
// ========================================

const XP_SYSTEM = {
    getLevel(xp) {
        let level = 1;
        let xpForNext = 100;
        let totalXpNeeded = 0;
        
        while (totalXpNeeded + xpForNext <= xp) {
            totalXpNeeded += xpForNext;
            level++;
            xpForNext = Math.floor(xpForNext * 1.2);
        }
        
        return {
            level,
            currentXp: xp - totalXpNeeded,
            xpForNextLevel: xpForNext,
            progress: ((xp - totalXpNeeded) / xpForNext) * 100
        };
    },
    
    getRank(level) {
        if (level >= 50) return { name: "Legend", color: "#ffd700" };
        if (level >= 40) return { name: "Elite", color: "#ff6b35" };
        if (level >= 30) return { name: "Pro", color: "#e63946" };
        if (level >= 20) return { name: "Advanced", color: "#3b82f6" };
        if (level >= 10) return { name: "Intermediate", color: "#22c55e" };
        return { name: "Beginner", color: "#a0a0b0" };
    }
};

// ========================================
// QUEST STATE MANAGEMENT
// ========================================

const QuestSystem = {
    getUserQuests() {
        return Storage.get('userQuests', {
            completed: [],
            active: [],
            lastRefresh: null
        });
    },
    
    getDailyQuests() {
        const saved = this.getUserQuests();
        const today = new Date().toDateString();
        
        if (saved.lastRefresh !== today) {
            const shuffled = [...QUESTS.daily].sort(() => Math.random() - 0.5);
            saved.active = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false }));
            saved.lastRefresh = today;
            Storage.set('userQuests', saved);
        }
        
        return saved.active;
    },
    
    completeQuest(questId) {
        const saved = this.getUserQuests();
        const quest = saved.active.find(q => q.id === questId);
        
        if (quest && !quest.completed) {
            quest.completed = true;
            quest.completedAt = new Date().toISOString();
            saved.completed.push(quest);
            Storage.set('userQuests', saved);
            
            const stats = UserState.getStats();
            stats.xp = (stats.xp || 0) + quest.xp;
            UserState.updateStats(stats);
            
            return quest.xp;
        }
        return 0;
    },
    
    updateQuestProgress(questId, progress) {
        const saved = this.getUserQuests();
        const quest = saved.active.find(q => q.id === questId);
        
        if (quest && !quest.completed) {
            quest.progress = Math.min(progress, quest.target);
            Storage.set('userQuests', saved);
            
            if (quest.progress >= quest.target) {
                return this.completeQuest(questId);
            }
        }
        return 0;
    }
};

// ========================================
// LEADERBOARD
// ========================================

const Leaderboard = {
    getGlobalLeaderboard() {
        const userStats = UserState.getStats();
        const userEntry = {
            id: 'user',
            name: userStats.username || 'You',
            xp: userStats.xp || 0,
            level: XP_SYSTEM.getLevel(userStats.xp || 0).level,
            streak: userStats.streak || 0,
            avatar: userStats.avatar || '🫵',
            isUser: true
        };
        
        const allEntries = [...LEADERBOARD_DATA, userEntry];
        return allEntries.sort((a, b) => b.xp - a.xp);
    },
    
    getUserRank() {
        const leaderboard = this.getGlobalLeaderboard();
        const userIndex = leaderboard.findIndex(e => e.isUser);
        return userIndex !== -1 ? userIndex + 1 : leaderboard.length;
    },
    
    updateUsername(name) {
        const stats = UserState.getStats();
        stats.username = name;
        UserState.updateStats(stats);
    }
};

// Export for use in other scripts
window.VantageFlex = {
    generateWorkout,
    getSetsForLevel,
    findRecipesByIngredients,
    calculateMacrosForPortion,
    generateMealPlan,
    calculateDailyTotals,
    getRandomQuote,
    getDailyMotivation,
    UserState,
    Storage,
    showToast,
    animateNumber,
    EXERCISE_DATABASE,
    RECIPE_DATABASE,
    MOTIVATION_QUOTES,
    QUESTS,
    XP_SYSTEM,
    QuestSystem,
    Leaderboard,
    LEADERBOARD_DATA
};
