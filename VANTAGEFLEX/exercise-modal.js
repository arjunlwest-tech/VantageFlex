/**
 * Exercise Detail Modal System for Vantage Flex
 * Shows exercise instructions, tips, and form guidance
 */

const ExerciseModal = {
    currentExercise: null,
    
    // Exercise database with detailed instructions
    exerciseDetails: {
        // Push exercises
        'Bench Press': {
            muscles: ['Chest', 'Front Delts', 'Triceps'],
            difficulty: 'Intermediate',
            instructions: [
                'Lie flat on bench with eyes under the bar',
                'Grip bar slightly wider than shoulder-width',
                'Plant feet firmly on floor, slight arch in back',
                'Lower bar to mid-chest with control',
                'Press bar up in a slight arc to starting position',
                'Keep wrists straight and elbows tucked at 45°'
            ],
            tips: ['Don\'t bounce bar off chest', 'Keep shoulders retracted', 'Breathe in on descent, out on press'],
            commonMistakes: ['Flaring elbows too wide', 'Lifting hips off bench', 'Partial range of motion'],
            videoUrl: null
        },
        'Incline Bench Press': {
            muscles: ['Upper Chest', 'Front Delts', 'Triceps'],
            difficulty: 'Intermediate',
            instructions: [
                'Set bench to 30-45° incline',
                'Grip bar slightly wider than shoulder-width',
                'Unrack bar and hold above upper chest',
                'Lower to upper chest/clavicle area',
                'Press up and slightly back toward rack',
                'Keep core tight throughout movement'
            ],
            tips: ['Lower angle emphasizes chest more', 'Don\'t let bar drift too far forward', 'Maintain tight upper back'],
            commonMistakes: ['Setting bench too steep (shoulder press)', 'Bouncing off chest', 'Losing shoulder position'],
            videoUrl: null
        },
        'Overhead Press': {
            muscles: ['Shoulders', 'Triceps', 'Core'],
            difficulty: 'Intermediate',
            instructions: [
                'Start with bar at upper chest, hands just outside shoulders',
                'Brace core and squeeze glutes',
                'Press bar straight up, moving head back slightly',
                'Once bar clears head, push head through',
                'Lock out elbows at top',
                'Lower with control back to chest'
            ],
            tips: ['Keep core tight to avoid back arch', 'Don\'t use leg drive (strict press)', 'Full range of motion is key'],
            commonMistakes: ['Excessive back arch', 'Using legs for momentum', 'Incomplete lockout'],
            videoUrl: null
        },
        'Dumbbell Shoulder Press': {
            muscles: ['Shoulders', 'Triceps', 'Core'],
            difficulty: 'Beginner',
            instructions: [
                'Hold dumbbells at shoulder height, palms facing forward',
                'Brace core and maintain upright posture',
                'Press dumbbells up and slightly inward',
                'Touch dumbbells lightly at top (optional)',
                'Lower with control to starting position',
                'Keep wrists neutral throughout'
            ],
            tips: ['Dumbbells allow more natural wrist rotation', 'Don\'t let elbows flare too wide', 'Control the negative'],
            commonMistakes: ['Arching back excessively', 'Uneven pressing (one side higher)', 'Rushing the movement'],
            videoUrl: null
        },
        'Push-Ups': {
            muscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
            difficulty: 'Beginner',
            instructions: [
                'Start in plank position, hands shoulder-width apart',
                'Body should form straight line from head to heels',
                'Lower body until chest nearly touches floor',
                'Keep elbows at 45° angle to body',
                'Push back up to starting position',
                'Maintain tight core throughout'
            ],
            tips: ['Modify on knees if needed', 'Full range of motion for max benefit', 'Keep head neutral, gaze slightly forward'],
            commonMistakes: ['Sagging hips', 'Flaring elbows too wide', 'Partial reps (not going low enough)'],
            videoUrl: null
        },
        'Dips': {
            muscles: ['Chest', 'Front Delts', 'Triceps'],
            difficulty: 'Intermediate',
            instructions: [
                'Grip parallel bars and lift yourself up',
                'Lean slightly forward for chest focus (vertical for triceps)',
                'Lower body until shoulders are below elbows',
                'Keep elbows tucked, don\'t let them flare',
                'Push back up to starting position',
                'Lock out at top (optional)'
            ],
            tips: ['Leaning forward hits chest more', 'Upright targets triceps', 'Add weight with belt when strong enough'],
            commonMistakes: ['Not going low enough', 'Flaring elbows excessively', 'Shrugging shoulders'],
            videoUrl: null
        },
        // Pull exercises
        'Pull-Ups': {
            muscles: ['Lats', 'Biceps', 'Rear Delts', 'Core'],
            difficulty: 'Intermediate',
            instructions: [
                'Hang from bar with arms fully extended',
                'Engage lats and pull shoulder blades down',
                'Pull body up until chin clears bar',
                'Focus on driving elbows down and back',
                'Lower with control to full extension',
                'Maintain tight core, avoid swinging'
            ],
            tips: ['Use band or machine for assistance if needed', 'Full extension at bottom for complete reps', 'Chin-ups (palms facing) emphasize biceps'],
            commonMistakes: ['Half reps (not full extension)', 'Kipping/swinging excessively', 'Not engaging lats'],
            videoUrl: null
        },
        'Barbell Rows': {
            muscles: ['Lats', 'Rhomboids', 'Middle Traps', 'Biceps'],
            difficulty: 'Intermediate',
            instructions: [
                'Bend at hips until torso is nearly parallel to floor',
                'Grip bar with hands just outside legs',
                'Brace core and maintain flat back',
                'Pull bar to lower chest/upper abs',
                'Squeeze shoulder blades together at top',
                'Lower with control, maintaining posture'
            ],
            tips: ['Keep elbows tucked, don\'t let them flare wide', 'Pull to lower chest (not stomach)', 'Maintain hip hinge position'],
            commonMistakes: ['Standing too upright (becoming a shrug)', 'Rounding lower back', 'Bouncing/using momentum'],
            videoUrl: null
        },
        'Deadlift': {
            muscles: ['Posterior Chain', 'Back', 'Glutes', 'Hamstrings', 'Core'],
            difficulty: 'Advanced',
            instructions: [
                'Stand with feet hip-width apart, bar over mid-foot',
                'Bend at hips and knees to grip bar',
                'Set back flat, chest up, hips slightly higher than knees',
                'Brace core, take breath and hold',
                'Push floor away, drag bar up legs',
                'Lock out hips and knees at top',
                'Hinge at hips to lower, maintaining flat back'
            ],
            tips: ['Bar should stay close to shins and thighs', 'Don\'t hyperextend at top', 'Reset each rep for practice'],
            commonMistakes: ['Rounding lower back', 'Bar drifting away from legs', 'Squatting the weight up'],
            videoUrl: null
        },
        // Leg exercises
        'Squats': {
            muscles: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
            difficulty: 'Intermediate',
            instructions: [
                'Stand with feet shoulder-width apart, toes slightly out',
                'Bar rests on upper traps (high bar) or rear delts (low bar)',
                'Brace core, break at hips and knees simultaneously',
                'Descend until hips break parallel with knees',
                'Keep chest up and knees tracking over toes',
                'Drive through feet to stand up',
                'Lock out hips and knees at top'
            ],
            tips: ['Depth depends on mobility - aim for parallel or below', 'Control descent, explosive ascent', 'Don\'t let knees cave inward'],
            commonMistakes: ['Not reaching adequate depth', 'Knees caving inward (valgus)', 'Rounding lower back'],
            videoUrl: null
        },
        'Lunges': {
            muscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
            difficulty: 'Beginner',
            instructions: [
                'Stand upright, step forward with one leg',
                'Lower hips until both knees are at 90°',
                'Back knee should hover just above ground',
                'Drive through front heel to return to start',
                'Alternate legs or do all reps on one side',
                'Keep torso upright throughout'
            ],
            tips: ['Don\'t let front knee cave inward', 'Step far enough that knee stays over ankle', 'Can be done walking or in place'],
            commonMistakes: ['Front knee going too far forward over toes', 'Torso leaning too far forward', 'Knee hitting ground hard'],
            videoUrl: null
        },
        'Romanian Deadlift': {
            muscles: ['Hamstrings', 'Glutes', 'Lower Back'],
            difficulty: 'Intermediate',
            instructions: [
                'Hold bar at hip level with slight knee bend',
                'Push hips back while keeping legs relatively straight',
                'Lower bar along thighs, feeling hamstring stretch',
                'Go as low as flexibility allows (usually mid-shin)',
                'Drive hips forward to return to standing',
                'Squeeze glutes at top'
            ],
            tips: ['Keep bar close to body throughout', 'Maintain neutral spine', 'Feel stretch in hamstrings, not lower back'],
            commonMistakes: ['Squatting instead of hinging', 'Rounding lower back', 'Bending knees too much'],
            videoUrl: null
        },
        'Leg Press': {
            muscles: ['Quads', 'Glutes', 'Hamstrings'],
            difficulty: 'Beginner',
            instructions: [
                'Sit in machine with back flat against pad',
                'Place feet on platform shoulder-width apart',
                'Unrack weight by extending legs',
                'Lower weight by bending knees toward chest',
                'Go as deep as flexibility allows',
                'Press through heels to extend legs'
            ],
            tips: ['Don\'t lock out knees completely at top', 'Higher foot position emphasizes glutes/hamstrings', 'Lower back should stay flat on pad'],
            commonMistakes: ['Lifting hips off pad at bottom', 'Locking knees forcefully', 'Placing feet too low (knee strain)'],
            videoUrl: null
        }
    },
    
    // Initialize modal system
    init() {
        this.createModalElement();
        this.attachExerciseListeners();
        console.log('📋 Exercise modal system initialized');
    },
    
    // Create modal DOM element
    createModalElement() {
        if (document.getElementById('exercise-modal')) return;
        
        const modalHTML = `
            <div id="exercise-modal" class="exercise-modal">
                <div class="exercise-modal-overlay"></div>
                <div class="exercise-modal-content">
                    <button class="exercise-modal-close">&times;</button>
                    <div class="exercise-modal-header">
                        <h2 class="exercise-modal-title" id="modal-exercise-name">Exercise Name</h2>
                        <div class="exercise-modal-meta">
                            <span class="exercise-difficulty" id="modal-difficulty">Intermediate</span>
                            <span class="exercise-muscles" id="modal-muscles">Chest, Shoulders, Triceps</span>
                        </div>
                    </div>
                    <div class="exercise-modal-body">
                        <div class="exercise-section">
                            <h3 class="exercise-section-title">Instructions</h3>
                            <ol class="exercise-instructions" id="modal-instructions">
                                <!-- Populated dynamically -->
                            </ol>
                        </div>
                        <div class="exercise-section">
                            <h3 class="exercise-section-title">Pro Tips</h3>
                            <ul class="exercise-tips" id="modal-tips">
                                <!-- Populated dynamically -->
                            </ul>
                        </div>
                        <div class="exercise-section">
                            <h3 class="exercise-section-title">Common Mistakes to Avoid</h3>
                            <ul class="exercise-mistakes" id="modal-mistakes">
                                <!-- Populated dynamically -->
                            </ul>
                        </div>
                    </div>
                    <div class="exercise-modal-footer">
                        <button class="btn btn-primary" id="modal-close-btn">Got It</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        document.querySelector('.exercise-modal-close').addEventListener('click', () => this.close());
        document.querySelector('.exercise-modal-overlay').addEventListener('click', () => this.close());
        document.getElementById('modal-close-btn').addEventListener('click', () => this.close());
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },
    
    // Attach click listeners to exercise elements
    attachExerciseListeners() {
        // Use event delegation for dynamically added exercises
        document.addEventListener('click', (e) => {
            const exerciseElement = e.target.closest('.workout-exercise-name, .exercise-info-btn');
            if (exerciseElement) {
                const exerciseName = exerciseElement.textContent.trim();
                this.open(exerciseName);
            }
        });
    },
    
    // Open modal with exercise details
    open(exerciseName) {
        const details = this.findExerciseDetails(exerciseName);
        
        if (!details) {
            console.log('Exercise details not found for:', exerciseName);
            return;
        }
        
        this.currentExercise = exerciseName;
        
        // Populate modal content
        document.getElementById('modal-exercise-name').textContent = exerciseName;
        document.getElementById('modal-difficulty').textContent = details.difficulty;
        document.getElementById('modal-muscles').textContent = details.muscles.join(', ');
        
        // Instructions
        const instructionsList = document.getElementById('modal-instructions');
        instructionsList.innerHTML = details.instructions.map(step => `<li>${step}</li>`).join('');
        
        // Tips
        const tipsList = document.getElementById('modal-tips');
        tipsList.innerHTML = details.tips.map(tip => `<li>${tip}</li>`).join('');
        
        // Mistakes
        const mistakesList = document.getElementById('modal-mistakes');
        mistakesList.innerHTML = details.commonMistakes.map(mistake => `<li>${mistake}</li>`).join('');
        
        // Show modal
        const modal = document.getElementById('exercise-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (window.SoundSystem) SoundSystem.playClick();
    },
    
    // Close modal
    close() {
        const modal = document.getElementById('exercise-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentExercise = null;
    },
    
    // Find exercise details (with fuzzy matching)
    findExerciseDetails(exerciseName) {
        // Direct match
        if (this.exerciseDetails[exerciseName]) {
            return this.exerciseDetails[exerciseName];
        }
        
        // Try to find partial match
        const exerciseNames = Object.keys(this.exerciseDetails);
        const match = exerciseNames.find(name => 
            exerciseName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(exerciseName.toLowerCase())
        );
        
        return match ? this.exerciseDetails[match] : null;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    ExerciseModal.init();
});

// Export
window.ExerciseModal = ExerciseModal;
