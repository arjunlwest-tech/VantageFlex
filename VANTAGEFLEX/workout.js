/**
 * Workout Generator Page Logic
 */

let currentWorkout = null;

const state = {
    split: 'push',
    level: 'intermediate',
    goal: 'muscle',
    duration: 45
};

function initWorkoutPage() {
    initToggleButtons();
    initDurationSlider();
    initGenerateButton();
    initSaveButton();
    initNewWorkoutButton();
    updateSummary();
}

function initToggleButtons() {
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.parentElement;
            group.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const value = btn.dataset.value;
            const groupId = group.id;
            
            if (groupId === 'split-buttons') state.split = value;
            if (groupId === 'level-buttons') state.level = value;
            if (groupId === 'goal-buttons') state.goal = value;
            
            updateSummary();
        });
    });
}

function initDurationSlider() {
    const slider = document.getElementById('duration-slider');
    const display = document.getElementById('duration-display');
    const tooltip = document.getElementById('duration-tooltip');
    
    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        state.duration = value;
        display.textContent = `${value} min`;
        tooltip.textContent = `${value} min`;
        
        const percent = ((value - 15) / (120 - 15)) * 100;
        tooltip.style.left = `${percent}%`;
        
        updateSummary();
    });
}

function updateSummary() {
    const goalMap = {
        strength: 'STRENGTH',
        muscle: 'HYPERTROPHY',
        endurance: 'ENDURANCE',
        cut: 'CUTTING'
    };
    
    const splitEl = document.getElementById('summary-split');
    const levelEl = document.getElementById('summary-level');
    const goalEl = document.getElementById('summary-goal');
    const durationEl = document.getElementById('summary-duration');
    
    if (splitEl) splitEl.textContent = state.split.toUpperCase();
    if (levelEl) levelEl.textContent = state.level.toUpperCase();
    if (goalEl) goalEl.textContent = goalMap[state.goal] || state.goal.toUpperCase();
    if (durationEl) durationEl.textContent = `${state.duration}M`;
}

function initGenerateButton() {
    const btn = document.getElementById('generate-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        generateAndDisplayWorkout();
    });
}

function generateAndDisplayWorkout() {
    const resultContainer = document.getElementById('workout-result');
    const exercisesContainer = document.getElementById('workout-exercises');
    
    btnLoading(document.getElementById('generate-btn'), true);
    
    setTimeout(() => {
        currentWorkout = VantageFlex.generateWorkout(
            state.split,
            state.level,
            state.goal,
            state.duration
        );
        
        renderWorkout(currentWorkout, exercisesContainer);
        
        resultContainer.classList.remove('hidden');
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        btnLoading(document.getElementById('generate-btn'), false);
        
        VantageFlex.showToast('Workout generated successfully!', 'success');
    }, 800);
}

function renderWorkout(workout, container) {
    container.innerHTML = '';
    
    let totalSets = 0;
    
    workout.exercises.forEach((exercise, index) => {
        const sets = VantageFlex.getSetsForLevel(exercise, state.level);
        totalSets += sets;
        
        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.innerHTML = `
            <div class="exercise-number">${index + 1}</div>
            <div class="exercise-info">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-details">${exercise.reps} reps • ${exercise.type === 'compound' ? 'Compound' : 'Isolation'}</div>
            </div>
            <div class="exercise-sets">${sets} sets</div>
        `;
        
        container.appendChild(item);
    });
    
    document.getElementById('total-exercises').textContent = 
        `${workout.exercises.length} exercises`;
    document.getElementById('total-sets').textContent = 
        `${totalSets} total sets`;
}

function initSaveButton() {
    const btn = document.getElementById('save-workout-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        if (!currentWorkout) return;
        
        const saved = VantageFlex.Storage.get('savedWorkouts', []);
        saved.push({
            ...currentWorkout,
            id: Date.now(),
            date: new Date().toISOString()
        });
        VantageFlex.Storage.set('savedWorkouts', saved);
        
        VantageFlex.UserState.recordWorkout();
        
        VantageFlex.showToast('Workout saved to dashboard!', 'success');
    });
}

function initNewWorkoutButton() {
    const btn = document.getElementById('new-workout-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        generateAndDisplayWorkout();
    });
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

document.addEventListener('DOMContentLoaded', initWorkoutPage);
