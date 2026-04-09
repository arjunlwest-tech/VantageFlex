/**
 * Quests Page - AI Exercise Verification
 * Uses TensorFlow.js for real-time pose detection
 */

let detector = null;
let video = null;
let canvas = null;
let ctx = null;
let isDetecting = false;
let currentQuest = null;
let repCount = 0;
let exerciseState = 'idle'; // idle, down, up
let lastRepTime = 0;

// Exercise detection configurations
const EXERCISE_CONFIG = {
    pushup: {
        angles: { elbow: { min: 80, max: 160 } },
        threshold: { down: 90, up: 150 },
        keypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist']
    },
    squat: {
        angles: { knee: { min: 70, max: 170 } },
        threshold: { down: 100, up: 160 },
        keypoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle']
    },
    chinup: {
        angles: { elbow: { min: 30, max: 180 } },
        threshold: { down: 160, up: 60 },
        keypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist']
    },
    plank: {
        duration: true,
        keypoints: ['left_shoulder', 'left_hip', 'left_ankle', 'right_shoulder', 'right_hip', 'right_ankle']
    },
    lunge: {
        angles: { knee: { min: 80, max: 170 } },
        threshold: { down: 100, up: 160 },
        keypoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle']
    }
};

function initQuestsPage() {
    loadXPBar();
    loadDailyQuests();
    loadSpecialQuests();
    initCameraControls();
    initInstructionModal();
}

function loadXPBar() {
    const stats = VantageFlex.UserState.getStats();
    const xp = stats.xp || 0;
    const levelData = VantageFlex.XP_SYSTEM.getLevel(xp);
    const rank = VantageFlex.XP_SYSTEM.getRank(levelData.level);
    
    document.getElementById('user-level-badge').textContent = `Level ${levelData.level}`;
    document.getElementById('user-rank').textContent = rank.name;
    document.getElementById('user-rank').style.color = rank.color;
    document.getElementById('current-xp').textContent = levelData.currentXp;
    document.getElementById('next-level-xp').textContent = levelData.xpForNextLevel;
    document.getElementById('total-xp-display').textContent = xp.toLocaleString();
    document.getElementById('xp-progress').style.width = `${levelData.progress}%`;
}

function loadDailyQuests() {
    const quests = VantageFlex.QuestSystem.getDailyQuests();
    const container = document.getElementById('daily-quests-list');
    container.innerHTML = '';
    
    quests.forEach(quest => {
        const isCompleted = quest.completed;
        const progress = quest.progress || 0;
        const percent = Math.min((progress / quest.target) * 100, 100);
        
        const card = document.createElement('div');
        card.className = `card ${isCompleted ? 'opacity-50' : ''}`;
        card.style.borderColor = isCompleted ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255,255,255,0.08)';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-bold flex items-center gap-2">
                        ${getExerciseIcon(quest.exercise)} ${quest.name}
                        ${isCompleted ? '<span class="badge badge-success">✓ Done</span>' : ''}
                    </h3>
                    <p class="text-small" style="color: var(--text-muted);">${quest.description}</p>
                </div>
                <div class="badge badge-gold">+${quest.xp} XP</div>
            </div>
            
            <div class="flex items-center gap-4 mb-3">
                <span class="badge ${quest.difficulty === 'easy' ? 'badge-success' : quest.difficulty === 'medium' ? 'badge-primary' : 'badge-info'}">
                    ${quest.difficulty}
                </span>
                <span class="text-small">${progress} / ${quest.target} completed</span>
            </div>
            
            <div class="progress-container mb-3">
                <div class="progress-bar ${isCompleted ? '' : 'progress-bar-gold'}" style="width: ${percent}%"></div>
            </div>
            
            <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} w-full start-quest-btn" 
                data-quest-id="${quest.id}" ${isCompleted ? 'disabled' : ''}>
                ${isCompleted ? '<span>✓</span> Completed' : '<span>🔥</span> Start Quest'}
            </button>
        `;
        
        if (!isCompleted) {
            card.querySelector('.start-quest-btn').addEventListener('click', () => {
                showExerciseInstructions(quest);
            });
        }
        
        container.appendChild(card);
    });
}

function loadSpecialQuests() {
    const specialQuests = VantageFlex.QUESTS.special;
    const container = document.getElementById('special-quests-list');
    container.innerHTML = '';
    
    specialQuests.forEach(quest => {
        const card = document.createElement('div');
        card.className = 'exercise-item';
        card.style.cursor = 'default';
        
        card.innerHTML = `
            <div class="exercise-number" style="background: var(--gradient-gold); color: #000;">★</div>
            <div class="exercise-info">
                <div class="exercise-name">${quest.name}</div>
                <div class="exercise-details">${quest.description}</div>
            </div>
            <div class="badge badge-gold">+${quest.xp} XP</div>
        `;
        
        container.appendChild(card);
    });
}

function getExerciseIcon(exercise) {
    const icons = {
        pushup: '💪',
        squat: '🦵',
        chinup: '🏋️',
        plank: '📊',
        lunge: '🏃'
    };
    return icons[exercise] || '🔥';
}

function showExerciseInstructions(quest) {
    currentQuest = quest;
    const modal = document.getElementById('exercise-instructions');
    const title = document.getElementById('instruction-title');
    const content = document.getElementById('instruction-content');
    
    title.textContent = quest.name;
    
    const instructions = getExerciseInstructions(quest.exercise);
    
    content.innerHTML = `
        <div class="text-center mb-4">
            <div style="font-size: 64px;">${getExerciseIcon(quest.exercise)}</div>
        </div>
        <p class="text-body mb-4">${quest.description}</p>
        <div class="space-y-2">
            ${instructions.map((inst, i) => `
                <div class="flex gap-3 p-3 rounded-lg" style="background: rgba(255,255,255,0.03);">
                    <span style="width: 24px; height: 24px; background: var(--gradient-fire); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">${i + 1}</span>
                    <span>${inst}</span>
                </div>
            `).join('')}
        </div>
        <div class="mt-4 p-4 rounded-lg" style="background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.2);">
            <div class="flex items-center gap-2 mb-2">
                <span>🎯</span>
                <span class="font-bold">Target: ${quest.target} reps</span>
            </div>
            <div class="text-small">Complete the target to earn ${quest.xp} XP!</div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function getExerciseInstructions(exercise) {
    const instructions = {
        pushup: [
            'Start in plank position with hands shoulder-width apart',
            'Lower your body until chest nearly touches the floor',
            'Push back up to starting position with arms fully extended',
            'Keep your body in a straight line throughout the movement',
            'The AI will count reps when your chest reaches proper depth'
        ],
        squat: [
            'Stand with feet shoulder-width apart',
            'Lower your hips back and down as if sitting in a chair',
            'Go until thighs are parallel to the ground or lower',
            'Drive through heels to stand back up',
            'Keep chest up and knees tracking over toes'
        ],
        chinup: [
            'Hang from bar with palms facing you (chin-up grip)',
            'Pull yourself up until chin clears the bar',
            'Lower yourself down with control until arms are fully extended',
            'Avoid swinging or using momentum',
            'Full range of motion required for each rep'
        ],
        plank: [
            'Start in push-up position on forearms',
            'Keep body in straight line from head to heels',
            'Engage core and hold position',
            'Don\'t let hips sag or pike up',
            'Timer starts automatically when proper form is detected'
        ],
        lunge: [
            'Step forward with one leg',
            'Lower hips until both knees are at 90 degrees',
            'Push back to starting position',
            'Alternate legs for walking lunges, or repeat on same leg',
            'Keep front knee over ankle, not past toes'
        ]
    };
    return instructions[exercise] || ['Follow proper form', 'Complete the target reps'];
}

function initInstructionModal() {
    document.getElementById('close-instructions').addEventListener('click', () => {
        document.getElementById('exercise-instructions').classList.add('hidden');
    });
    
    document.getElementById('start-quest-btn').addEventListener('click', () => {
        document.getElementById('exercise-instructions').classList.add('hidden');
        startCameraAndDetection();
    });
}

function initCameraControls() {
    document.getElementById('start-camera-btn').addEventListener('click', startCameraAndDetection);
    document.getElementById('stop-camera-btn').addEventListener('click', stopCamera);
    document.getElementById('complete-quest-btn').addEventListener('click', completeCurrentQuest);
}

async function startCameraAndDetection() {
    video = document.getElementById('webcam');
    canvas = document.getElementById('output-canvas');
    ctx = canvas.getContext('2d');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });
        
        video.srcObject = stream;
        await video.play();
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        document.getElementById('camera-placeholder').classList.add('hidden');
        document.getElementById('webcam').style.display = 'block';
        document.getElementById('output-canvas').style.display = 'block';
        document.getElementById('camera-controls').style.display = 'flex';
        document.getElementById('exercise-overlay').classList.remove('hidden');
        document.getElementById('camera-status').textContent = 'AI Active';
        document.getElementById('camera-status').className = 'badge badge-success';
        
        await initPoseDetector();
        
        repCount = 0;
        exerciseState = 'idle';
        updateRepCounter();
        
        isDetecting = true;
        detectPose();
        
    } catch (err) {
        console.error('Camera error:', err);
        VantageFlex.showToast('Could not access camera. Please allow camera permissions.', 'error');
    }
}

async function initPoseDetector() {
    try {
        const model = poseDetection.SupportedModels.MoveNet;
        detector = await poseDetection.createDetector(model, {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        });
    } catch (err) {
        console.error('Detector init error:', err);
        VantageFlex.showToast('AI model failed to load. Please refresh.', 'error');
    }
}

async function detectPose() {
    if (!isDetecting || !detector) return;
    
    try {
        const poses = await detector.estimatePoses(video);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (poses.length > 0) {
            const pose = poses[0];
            drawPose(pose);
            analyzeExercise(pose);
        }
        
        requestAnimationFrame(detectPose);
    } catch (err) {
        console.error('Detection error:', err);
        requestAnimationFrame(detectPose);
    }
}

function drawPose(pose) {
    const keypoints = pose.keypoints;
    
    // Draw keypoints
    keypoints.forEach(kp => {
        if (kp.score > 0.3) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff6b35';
            ctx.fill();
        }
    });
    
    // Draw skeleton
    const connections = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'],
        ['right_knee', 'right_ankle']
    ];
    
    connections.forEach(([p1, p2]) => {
        const kp1 = keypoints.find(kp => kp.name === p1);
        const kp2 = keypoints.find(kp => kp.name === p2);
        
        if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function analyzeExercise(pose) {
    if (!currentQuest || !currentQuest.exercise) return;
    
    const exercise = currentQuest.exercise;
    const config = EXERCISE_CONFIG[exercise];
    
    if (!config) return;
    
    const keypoints = pose.keypoints;
    const now = Date.now();
    
    // Calculate angles based on exercise type
    let angle = null;
    let isFormGood = true;
    
    if (exercise === 'pushup' || exercise === 'chinup') {
        // Calculate elbow angle
        const shoulder = keypoints.find(kp => kp.name === 'left_shoulder');
        const elbow = keypoints.find(kp => kp.name === 'left_elbow');
        const wrist = keypoints.find(kp => kp.name === 'left_wrist');
        
        if (shoulder && elbow && wrist && shoulder.score > 0.3 && elbow.score > 0.3 && wrist.score > 0.3) {
            angle = calculateAngle(shoulder, elbow, wrist);
        }
    } else if (exercise === 'squat' || exercise === 'lunge') {
        // Calculate knee angle
        const hip = keypoints.find(kp => kp.name === 'left_hip');
        const knee = keypoints.find(kp => kp.name === 'left_knee');
        const ankle = keypoints.find(kp => kp.name === 'left_ankle');
        
        if (hip && knee && ankle && hip.score > 0.3 && knee.score > 0.3 && ankle.score > 0.3) {
            angle = calculateAngle(hip, knee, ankle);
        }
    } else if (exercise === 'plank') {
        // Check plank form
        const shoulder = keypoints.find(kp => kp.name === 'left_shoulder');
        const hip = keypoints.find(kp => kp.name === 'left_hip');
        const ankle = keypoints.find(kp => kp.name === 'left_ankle');
        
        if (shoulder && hip && ankle) {
            const angle = calculateAngle(shoulder, hip, ankle);
            isFormGood = angle > 160 && angle < 200; // Roughly straight line
            
            if (isFormGood && exerciseState === 'idle') {
                exerciseState = 'active';
                lastRepTime = now;
            } else if (isFormGood && exerciseState === 'active') {
                const duration = Math.floor((now - lastRepTime) / 1000);
                repCount = duration;
                updateRepCounter();
                
                if (repCount >= currentQuest.target) {
                    document.getElementById('complete-quest-btn').classList.remove('hidden');
                }
            }
        }
    }
    
    // Rep counting for non-duration exercises
    if (angle !== null && exercise !== 'plank') {
        const { threshold } = config;
        
        if (angle < threshold.down && exerciseState !== 'down') {
            exerciseState = 'down';
            document.getElementById('form-feedback').textContent = 'Good depth!';
            document.getElementById('form-feedback').className = 'badge badge-success';
        } else if (angle > threshold.up && exerciseState === 'down') {
            if (now - lastRepTime > 500) { // Min 500ms between reps
                exerciseState = 'up';
                repCount++;
                lastRepTime = now;
                updateRepCounter();
                
                document.getElementById('form-feedback').textContent = 'Rep counted!';
                document.getElementById('form-feedback').className = 'badge badge-primary';
                
                // Play sound or show animation
                pulseRepCounter();
                
                if (repCount >= currentQuest.target) {
                    document.getElementById('complete-quest-btn').classList.remove('hidden');
                }
            }
        }
    }
    
    // Update form feedback
    if (exercise !== 'plank' && exerciseState === 'idle') {
        document.getElementById('form-feedback').textContent = 'Ready - start moving';
        document.getElementById('form-feedback').className = 'badge badge-info';
    }
}

function calculateAngle(p1, p2, p3) {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
}

function updateRepCounter() {
    const target = currentQuest ? currentQuest.target : 0;
    document.getElementById('rep-counter').textContent = `${repCount} / ${target} ${currentQuest && currentQuest.exercise === 'plank' ? 'sec' : 'reps'}`;
}

function pulseRepCounter() {
    const counter = document.getElementById('rep-counter');
    counter.style.transform = 'scale(1.2)';
    counter.style.transition = 'transform 0.2s';
    setTimeout(() => {
        counter.style.transform = 'scale(1)';
    }, 200);
}

function completeCurrentQuest() {
    if (!currentQuest) return;
    
    const xpEarned = VantageFlex.QuestSystem.completeQuest(currentQuest.id);
    
    if (xpEarned > 0) {
        VantageFlex.showToast(`🎉 Quest completed! +${xpEarned} XP`, 'success');
        
        // Check for special quest "First Steps"
        const stats = VantageFlex.UserState.getStats();
        if ((stats.questsCompleted || 0) === 0) {
            VantageFlex.UserState.updateStats({ questsCompleted: 1 });
            // First steps quest would be handled separately
        }
        
        loadXPBar();
        loadDailyQuests();
        stopCamera();
    }
}

function stopCamera() {
    isDetecting = false;
    
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    document.getElementById('webcam').style.display = 'none';
    document.getElementById('output-canvas').style.display = 'none';
    document.getElementById('camera-placeholder').classList.remove('hidden');
    document.getElementById('camera-controls').style.display = 'none';
    document.getElementById('exercise-overlay').classList.add('hidden');
    document.getElementById('complete-quest-btn').classList.add('hidden');
    document.getElementById('camera-status').textContent = 'Camera Off';
    document.getElementById('camera-status').className = 'badge badge-primary';
    
    currentQuest = null;
    repCount = 0;
    exerciseState = 'idle';
}

document.addEventListener('DOMContentLoaded', initQuestsPage);
