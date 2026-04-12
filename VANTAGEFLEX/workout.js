/**
 * Workout Generator Page Logic
 */

let currentWorkout = null;
let selectedEquipment = [];

const state = {
    split: 'push',
    level: 'intermediate',
    goal: 'muscle',
    duration: 45
};

function initWorkoutPage() {
    initToggleButtons();
    initDurationSlider();
    initEquipmentSystem();
    initGenerateButton();
    initSaveButton();
    initNewWorkoutButton();
    updateSummary();
    loadSavedEquipment();
}

function initToggleButtons() {
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.parentElement;
            group.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (window.SoundSystem) SoundSystem.playClick();
            
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

function initEquipmentSystem() {
    const input = document.getElementById('equipment-input');
    const addBtn = document.getElementById('add-equipment-btn');
    const chips = document.querySelectorAll('.equipment-chip');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => addEquipment(input.value));
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addEquipment(input.value);
            }
        });
    }
    
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const equipment = chip.dataset.equipment;
            if (selectedEquipment.includes(equipment)) {
                removeEquipment(equipment);
            } else {
                addEquipment(equipment);
            }
        });
    });
}

function addEquipment(equipment) {
    if (!equipment || typeof equipment !== 'string') return;
    
    equipment = equipment.toLowerCase().trim();
    if (!equipment) return;
    
    if (!selectedEquipment.includes(equipment)) {
        selectedEquipment.push(equipment);
        updateEquipmentDisplay();
        saveEquipment();
        
        if (window.SoundSystem) SoundSystem.playClick();
        
        // Update chip state if it exists
        const chip = document.querySelector(`.equipment-chip[data-equipment="${equipment}"]`);
        if (chip) chip.classList.add('active');
    }
    
    const input = document.getElementById('equipment-input');
    if (input) input.value = '';
}

function removeEquipment(equipment) {
    selectedEquipment = selectedEquipment.filter(e => e !== equipment);
    updateEquipmentDisplay();
    saveEquipment();
    
    if (window.SoundSystem) SoundSystem.playClick();
    
    const chip = document.querySelector(`.equipment-chip[data-equipment="${equipment}"]`);
    if (chip) chip.classList.remove('active');
}

function updateEquipmentDisplay() {
    const container = document.getElementById('selected-equipment');
    const countBadge = document.getElementById('equipment-count');
    
    if (container) {
        container.innerHTML = selectedEquipment.map(item => `
            <span class="selected-item">
                ${item}
                <button class="remove-btn" onclick="removeEquipment('${item}')">×</button>
            </span>
        `).join('');
    }
    
    if (countBadge) {
        countBadge.textContent = selectedEquipment.length > 0 
            ? `${selectedEquipment.length} item${selectedEquipment.length > 1 ? 's' : ''}`
            : 'Bodyweight';
    }
}

function saveEquipment() {
    localStorage.setItem('selectedEquipment', JSON.stringify(selectedEquipment));
}

function loadSavedEquipment() {
    const saved = localStorage.getItem('selectedEquipment');
    if (saved) {
        selectedEquipment = JSON.parse(saved);
        updateEquipmentDisplay();
        
        // Restore chip states
        selectedEquipment.forEach(item => {
            const chip = document.querySelector(`.equipment-chip[data-equipment="${item}"]`);
            if (chip) chip.classList.add('active');
        });
    }
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
        // Use equipment-based generation if equipment selected
        if (selectedEquipment.length > 0 && window.VantageFlex?.generateEquipmentWorkout) {
            currentWorkout = VantageFlex.generateEquipmentWorkout(
                selectedEquipment,
                state.level,
                state.goal,
                state.duration
            );
        } else {
            currentWorkout = VantageFlex.generateWorkout(
                state.split,
                state.level,
                state.goal,
                state.duration
            );
        }
        
        renderWorkout(currentWorkout, exercisesContainer);
        
        resultContainer.classList.remove('hidden');
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        btnLoading(document.getElementById('generate-btn'), false);
        
        if (window.SoundSystem) SoundSystem.playSuccess();
        
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
                <div class="exercise-name workout-exercise-name" style="cursor: pointer;" title="Click for exercise details">${exercise.name}</div>
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
        
        if (window.SoundSystem) SoundSystem.playSuccess();
        if (window.ConfettiSystem) ConfettiSystem.celebrate('workout');
        
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
