/**
 * Equipment-Based Workout Generator Page Logic
 */

let currentEquipment = [];
let generatedWorkout = [];
let currentLevel = 'intermediate';
let currentGoal = 'muscle';
let currentDuration = 45;

function initEquipmentPage() {
    initEquipmentInput();
    initPopularEquipment();
    initAllEquipmentDisplay();
    initLevelButtons();
    initGoalButtons();
    initDurationSlider();
    initGenerateButton();
    initClearButton();
    initSaveButton();
    loadSavedEquipment();
}

function initEquipmentInput() {
    const input = document.getElementById('equipment-input');
    const btn = document.getElementById('add-equipment-btn');
    
    btn.addEventListener('click', () => addEquipment(input.value));
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addEquipment(input.value);
        }
    });
    
    // Auto-suggest from EQUIPMENT_LIST
    input.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (value.length < 2) return;
        
        const matches = VantageFlex.EQUIPMENT_LIST.filter(eq => 
            eq.name.toLowerCase().includes(value) ||
            eq.id.toLowerCase().includes(value)
        );
        
        // Could show dropdown here, for now just highlight if exact match
        const exactMatch = matches.find(m => m.name.toLowerCase() === value);
        if (exactMatch) {
            input.style.borderColor = 'var(--primary-orange)';
        } else {
            input.style.borderColor = '';
        }
    });
}

function addEquipment(equipmentName) {
    if (!equipmentName.trim()) return;
    
    const normalized = equipmentName.trim().toLowerCase();
    
    // Check if already added
    if (currentEquipment.some(e => e.toLowerCase() === normalized)) {
        VantageFlex.showToast('Equipment already added', 'info');
        return;
    }
    
    // Try to match with known equipment
    const knownMatch = VantageFlex.EQUIPMENT_LIST.find(eq => 
        eq.name.toLowerCase() === normalized ||
        eq.id.toLowerCase() === normalized.replace(/\s+/g, '_')
    );
    
    if (knownMatch) {
        currentEquipment.push(knownMatch.id);
        VantageFlex.showToast(`Added ${knownMatch.name}`, 'success');
    } else {
        // Add as custom equipment (will try to match in generator)
        currentEquipment.push(normalized);
    }
    
    renderEquipment();
    document.getElementById('equipment-input').value = '';
    document.getElementById('equipment-input').style.borderColor = '';
    
    VantageFlex.Storage.set('userEquipment', currentEquipment);
}

function removeEquipment(equipment) {
    currentEquipment = currentEquipment.filter(e => e !== equipment);
    renderEquipment();
    VantageFlex.Storage.set('userEquipment', currentEquipment);
}

function renderEquipment() {
    const container = document.getElementById('equipment-list');
    const countBadge = document.getElementById('equipment-count');
    container.innerHTML = '';
    
    countBadge.textContent = `${currentEquipment.length} item${currentEquipment.length !== 1 ? 's' : ''}`;
    
    currentEquipment.forEach(equipment => {
        // Find display name
        const known = VantageFlex.EQUIPMENT_LIST.find(eq => eq.id === equipment);
        const displayName = known ? `${known.emoji} ${known.name}` : equipment;
        
        const chip = document.createElement('div');
        chip.className = 'equipment-chip';
        chip.innerHTML = `
            <span>${displayName}</span>
            <button class="remove-btn">×</button>
        `;
        chip.querySelector('.remove-btn').addEventListener('click', () => removeEquipment(equipment));
        container.appendChild(chip);
    });
    
    if (currentEquipment.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-small" style="color: var(--text-muted);">
                No equipment added yet. Start typing above!
            </div>
        `;
    }
}

function initPopularEquipment() {
    const popular = ['barbell', 'dumbbells', 'bench', 'pullup_bar', 'yoga_mat'];
    const container = document.getElementById('popular-equipment');
    
    popular.forEach(id => {
        const eq = VantageFlex.EQUIPMENT_LIST.find(e => e.id === id);
        if (eq) {
            const chip = document.createElement('div');
            chip.className = 'equipment-quick-chip';
            chip.innerHTML = `${eq.emoji} ${eq.name}`;
            chip.addEventListener('click', () => {
                if (!currentEquipment.includes(eq.id)) {
                    currentEquipment.push(eq.id);
                    renderEquipment();
                    VantageFlex.Storage.set('userEquipment', currentEquipment);
                    
                    // Animation feedback
                    chip.style.transform = 'scale(0.95)';
                    setTimeout(() => chip.style.transform = '', 150);
                }
            });
            container.appendChild(chip);
        }
    });
}

function initAllEquipmentDisplay() {
    const container = document.getElementById('all-equipment-tags');
    
    VantageFlex.EQUIPMENT_LIST.forEach(eq => {
        const tag = document.createElement('span');
        tag.className = 'equipment-tag';
        tag.innerHTML = `${eq.emoji} ${eq.name}`;
        container.appendChild(tag);
    });
}

function initLevelButtons() {
    const buttons = document.querySelectorAll('#level-buttons .btn-toggle');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLevel = btn.dataset.value;
        });
    });
}

function initGoalButtons() {
    const buttons = document.querySelectorAll('#goal-buttons .btn-toggle');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGoal = btn.dataset.value;
        });
    });
}

function initDurationSlider() {
    const slider = document.getElementById('duration-slider');
    const tooltip = document.getElementById('duration-tooltip');
    
    slider.addEventListener('input', (e) => {
        currentDuration = parseInt(e.target.value);
        tooltip.textContent = `${currentDuration} min`;
        
        // Update tooltip position
        const percent = ((currentDuration - 15) / (90 - 15)) * 100;
        tooltip.style.left = `${percent}%`;
    });
}

function initGenerateButton() {
    const btn = document.getElementById('generate-btn');
    
    btn.addEventListener('click', () => {
        generateWorkout();
    });
}

function initClearButton() {
    const btn = document.getElementById('clear-equipment-btn');
    
    btn.addEventListener('click', () => {
        currentEquipment = [];
        renderEquipment();
        VantageFlex.Storage.remove('userEquipment');
        document.getElementById('workout-result').classList.add('hidden');
    });
}

function initSaveButton() {
    const btn = document.getElementById('save-workout-btn');
    
    btn.addEventListener('click', () => {
        if (generatedWorkout.length === 0) return;
        
        const saved = VantageFlex.Storage.get('savedWorkouts', []);
        const workoutData = {
            id: Date.now(),
            name: `Equipment Workout - ${new Date().toLocaleDateString()}`,
            exercises: generatedWorkout,
            level: currentLevel,
            goal: currentGoal,
            duration: currentDuration,
            equipment: currentEquipment,
            savedAt: new Date().toISOString()
        };
        
        saved.push(workoutData);
        VantageFlex.Storage.set('savedWorkouts', saved);
        
        VantageFlex.showToast('Workout saved to dashboard!', 'success');
    });
    
    document.getElementById('new-workout-btn').addEventListener('click', () => {
        generateWorkout();
    });
}

function generateWorkout() {
    const btn = document.getElementById('generate-btn');
    
    btnLoading(btn, true);
    
    setTimeout(() => {
        // Always include bodyweight, add user's equipment
        const equipmentList = currentEquipment.length > 0 ? currentEquipment : [];
        
        generatedWorkout = VantageFlex.generateEquipmentWorkout(
            equipmentList,
            currentLevel,
            currentGoal,
            currentDuration
        );
        
        renderWorkout();
        
        document.getElementById('workout-result').classList.remove('hidden');
        document.getElementById('used-equipment').textContent = 
            currentEquipment.length > 0 
                ? `${currentEquipment.length} equipment items + bodyweight`
                : 'bodyweight exercises';
        
        document.getElementById('workout-result').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
        
        btnLoading(btn, false);
        
        if (generatedWorkout.length > 0) {
            VantageFlex.showToast(`Generated ${generatedWorkout.length} exercises!`, 'success');
        }
    }, 600);
}

function renderWorkout() {
    const container = document.getElementById('workout-exercises');
    container.innerHTML = '';
    
    let totalSets = 0;
    
    generatedWorkout.forEach((exercise, index) => {
        totalSets += exercise.sets;
        
        const item = document.createElement('div');
        item.className = 'exercise-item animate-fade-in';
        item.style.animationDelay = `${index * 0.1}s`;
        
        // Get equipment emoji
        const eq = VantageFlex.EQUIPMENT_LIST.find(e => e.id === exercise.equipment);
        const equipmentIcon = eq ? eq.emoji : '💪';
        
        item.innerHTML = `
            <div class="exercise-number">${index + 1}</div>
            <div class="exercise-info">
                <div class="exercise-name">
                    ${exercise.name}
                    <span style="margin-left: 8px; font-size: 14px;">${equipmentIcon}</span>
                </div>
                <div class="exercise-details">
                    ${exercise.sets} sets × ${exercise.reps} • ${exercise.rest} rest
                    ${exercise.muscles ? `• ${exercise.muscles.join(', ')}` : ''}
                </div>
            </div>
            <span class="badge badge-primary">${exercise.type}</span>
        `;
        
        container.appendChild(item);
    });
    
    document.getElementById('total-exercises').textContent = `${generatedWorkout.length} exercises`;
    document.getElementById('total-sets').textContent = `${totalSets} total sets`;
}

function btnLoading(btn, isLoading) {
    if (isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="animate-spin">⚡</span> Generating...';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText;
        btn.disabled = false;
    }
}

function loadSavedEquipment() {
    const saved = VantageFlex.Storage.get('userEquipment', []);
    if (saved.length > 0) {
        currentEquipment = saved;
        renderEquipment();
    }
}

document.addEventListener('DOMContentLoaded', initEquipmentPage);
