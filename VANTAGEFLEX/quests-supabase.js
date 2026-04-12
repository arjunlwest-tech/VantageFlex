/**
 * Fully Functional Quest System with Supabase Integration
 * AI-Powered Pose Detection for XP Verification
 */

const QuestSystem = {
    detector: null,
    camera: null,
    canvas: null,
    ctx: null,
    isActive: false,
    questInProgress: null,
    repCount: 0,
    lastPose: null,
    confidence: 0,
    
    // Quest Definitions
    quests: [
        {
            id: 'pushups-20',
            title: 'Push-up Warrior',
            description: 'Complete 20 push-ups with proper form',
            target: 20,
            xp: 100,
            difficulty: 'intermediate',
            exercise: 'pushup',
            verificationType: 'camera',
            timeLimit: 300
        },
        {
            id: 'squats-30',
            title: 'Squat Master',
            description: 'Complete 30 squats with proper depth',
            target: 30,
            xp: 150,
            difficulty: 'intermediate',
            exercise: 'squat',
            verificationType: 'camera',
            timeLimit: 400
        },
        {
            id: 'plank-60',
            title: 'Core of Steel',
            description: 'Hold plank position for 60 seconds',
            target: 60,
            xp: 200,
            difficulty: 'advanced',
            exercise: 'plank',
            verificationType: 'camera',
            timeLimit: 120
        },
        {
            id: 'jumpingjacks-50',
            title: 'Cardio Blast',
            description: 'Complete 50 jumping jacks',
            target: 50,
            xp: 80,
            difficulty: 'beginner',
            exercise: 'jumpingjack',
            verificationType: 'camera',
            timeLimit: 300
        },
        {
            id: 'daily-workout',
            title: 'Daily Grinder',
            description: 'Generate and complete any workout today',
            target: 1,
            xp: 50,
            difficulty: 'beginner',
            exercise: 'any',
            verificationType: 'manual',
            timeLimit: null
        },
        {
            id: 'streak-3',
            title: '3-Day Streak',
            description: 'Complete quests 3 days in a row',
            target: 3,
            xp: 300,
            difficulty: 'intermediate',
            exercise: 'any',
            verificationType: 'streak',
            timeLimit: null
        }
    ],

    async init() {
        this.setupQuestUI();
        this.loadQuestProgress();
        
        // Listen for auth ready
        window.addEventListener('auth:ready', () => {
            this.loadUserQuests();
        });
    },

    setupQuestUI() {
        // Setup camera modal
        const startButtons = document.querySelectorAll('[data-start-quest]');
        startButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.target.dataset.questId;
                this.startQuest(questId);
            });
        });
    },

    async loadUserQuests() {
        if (!window.AuthManager?.getCurrentUser()) {
            this.renderGuestQuests();
            return;
        }

        const userId = window.AuthManager.getCurrentUser().id;
        
        // Load active quests from Supabase
        const { data: userQuests, error } = await window.supabaseClient
            .from('user_quests')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (userQuests) {
            this.renderQuests(userQuests);
        } else {
            // Assign new daily quests
            this.assignDailyQuests(userId);
        }
    },

    async assignDailyQuests(userId) {
        const today = new Date().toISOString().split('T')[0];
        
        // Get 3 random quests
        const shuffled = [...this.quests].sort(() => 0.5 - Math.random());
        const dailyQuests = shuffled.slice(0, 3);
        
        // Insert into database
        const questEntries = dailyQuests.map(quest => ({
            user_id: userId,
            quest_id: quest.id,
            status: 'active',
            progress: 0,
            assigned_date: today,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }));

        await window.supabaseClient.from('user_quests').insert(questEntries);
        this.renderQuests(questEntries);
    },

    renderQuests(userQuests) {
        const container = document.getElementById('active-quests');
        if (!container) return;

        container.innerHTML = userQuests.map(uq => {
            const quest = this.quests.find(q => q.id === uq.quest_id);
            const progress = (uq.progress / quest.target) * 100;
            
            return `
                <div class="quest-card ${uq.status === 'completed' ? 'completed' : ''}" data-quest="${quest.id}">
                    <div class="quest-header">
                        <div class="quest-icon">${this.getQuestIcon(quest.exercise)}</div>
                        <div class="quest-info">
                            <h3 class="quest-title">${quest.title}</h3>
                            <p class="quest-desc">${quest.description}</p>
                        </div>
                        <div class="quest-xp">+${quest.xp} XP</div>
                    </div>
                    <div class="quest-progress-container">
                        <div class="quest-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="quest-footer">
                        <span class="progress-text">${uq.progress}/${quest.target}</span>
                        ${uq.status === 'active' ? `
                            <button class="btn btn-primary btn-sm" onclick="QuestSystem.startQuest('${quest.id}')">
                                ${quest.verificationType === 'camera' ? '📷 Start' : '✓ Complete'}
                            </button>
                        ` : '<span class="completed-badge">✓ Done</span>'}
                    </div>
                </div>
            `;
        }).join('');
    },

    getQuestIcon(exercise) {
        const icons = {
            pushup: '💪',
            squat: '🦵',
            plank: '🧘',
            jumpingjack: '⭐',
            any: '🎯'
        };
        return icons[exercise] || '🔥';
    },

    async startQuest(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest) return;
        
        // Check auth
        const user = window.AuthManager?.getCurrentUser();
        if (!user) {
            this.showToast('Please sign in to complete quests', 'error');
            window.AuthManager?.showLoginModal?.();
            return;
        }
        
        this.repCount = 0;
        this.questInProgress = quest;

        if (quest.verificationType === 'camera') {
            // Check camera permission first
            const hasPermission = await window.CameraPermission?.verifyBeforeQuest();
            if (!hasPermission) {
                return; // Permission denied or cancelled
            }
            await this.initCameraVerification(quest);
        } else {
            // Manual verification
            this.showManualCompleteModal(quest);
        }
    },

    async initCameraVerification(quest) {
        // Create modal first
        this.showCameraModal(quest);
        
        // Wait longer for DOM to update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
            // Get video element
            const video = document.getElementById('quest-camera');
            if (!video) {
                throw new Error('Video element not found in DOM');
            }

            console.log('Video element found:', video);

            // Setup camera stream with more lenient constraints
            console.log('Requesting camera access...');
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });
            } catch (err) {
                // Fallback to simpler constraints
                console.log('Trying fallback camera constraints...');
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }
            
            console.log('Camera stream obtained:', stream);
            video.srcObject = stream;
            this.camera = stream;
            
            // Wait for video to be ready with better error handling
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.log('Video load timeout - proceeding anyway');
                    resolve();
                }, 3000);
                
                video.onloadedmetadata = () => {
                    console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
                    clearTimeout(timeout);
                    resolve();
                };
                
                video.onerror = (e) => {
                    console.error('Video error:', e);
                    clearTimeout(timeout);
                    reject(new Error('Video error'));
                };
            });

            // Try to play video
            try {
                await video.play();
                console.log('Video playing successfully');
            } catch (playErr) {
                console.log('Auto-play prevented, trying muted play...');
                video.muted = true;
                await video.play();
            }

            // Setup canvas with video dimensions
            this.canvas = document.getElementById('pose-canvas');
            if (this.canvas) {
                const width = video.videoWidth || 640;
                const height = video.videoHeight || 480;
                this.canvas.width = width;
                this.canvas.height = height;
                this.ctx = this.canvas.getContext('2d');
                console.log('Canvas setup:', width, 'x', height);
            } else {
                console.warn('Canvas element not found');
            }

            // Now initialize pose detector
            console.log('Initializing pose detector...');
            await this.initPoseDetector();
            
            this.isActive = true;
            this.hideCameraLoading();
            console.log('Starting pose detection loop');
            this.detectPose();

        } catch (err) {
            console.error('Camera initialization error:', err);
            this.showToast('Camera error: ' + err.message, 'error');
            // Don't stop quest immediately - let user see the error
            setTimeout(() => this.stopQuest(), 3000);
        }
    },

    async initPoseDetector() {
        // Wait for TensorFlow to be ready
        if (typeof poseDetection === 'undefined') {
            console.log('Waiting for poseDetection...');
            await new Promise(resolve => {
                const check = () => {
                    if (typeof poseDetection !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }

        const detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        };
        
        this.detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
        );
        
        console.log('Pose detector ready');
    },

    async detectPose() {
        if (!this.isActive || !this.detector) {
            console.log('Detection stopped: isActive=' + this.isActive + ', detector=' + !!this.detector);
            return;
        }

        try {
            const video = document.getElementById('quest-camera');
            if (!video || video.paused || video.ended) {
                requestAnimationFrame(() => this.detectPose());
                return;
            }

            const poses = await this.detector.estimatePoses(video);

            if (poses.length > 0) {
                const pose = poses[0];
                this.analyzePose(pose);
                this.drawPose(pose);
                
                // Update confidence bar
                const avgConfidence = pose.keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) / pose.keypoints.length;
                const confidenceBar = document.getElementById('confidence-bar');
                if (confidenceBar) {
                    confidenceBar.style.width = (avgConfidence * 100) + '%';
                }
            }
        } catch (err) {
            console.error('Pose detection error:', err);
        }

        // Use setTimeout to prevent overwhelming the browser
        setTimeout(() => {
            if (this.isActive) {
                requestAnimationFrame(() => this.detectPose());
            }
        }, 50);
    },

    analyzePose(pose) {
        const quest = this.questInProgress;
        if (!quest) return;

        const keypoints = pose.keypoints;
        const now = Date.now();

        switch (quest.exercise) {
            case 'pushup':
                this.analyzePushup(keypoints);
                break;
            case 'squat':
                this.analyzeSquat(keypoints);
                break;
            case 'plank':
                this.analyzePlank(keypoints);
                break;
            case 'jumpingjack':
                this.analyzeJumpingJack(keypoints);
                break;
        }

        // Update UI
        this.updateQuestProgress();
    },

    analyzePushup(keypoints) {
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
        const leftElbow = keypoints.find(k => k.name === 'left_elbow');
        const rightElbow = keypoints.find(k => k.name === 'right_elbow');

        if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) return;

        // Calculate elbow angle
        const leftAngle = this.calculateAngle(leftShoulder, leftElbow, 
            keypoints.find(k => k.name === 'left_wrist'));
        
        // Detect pushup phases
        if (leftAngle < 90 && this.lastPose !== 'down') {
            this.lastPose = 'down';
        } else if (leftAngle > 160 && this.lastPose === 'down') {
            this.lastPose = 'up';
            this.repCount++;
            this.onRepComplete();
        }
    },

    analyzeSquat(keypoints) {
        const leftHip = keypoints.find(k => k.name === 'left_hip');
        const leftKnee = keypoints.find(k => k.name === 'left_knee');
        const leftAnkle = keypoints.find(k => k.name === 'left_ankle');

        if (!leftHip || !leftKnee || !leftAnkle) return;

        const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);

        if (kneeAngle < 100 && this.lastPose !== 'down') {
            this.lastPose = 'down';
        } else if (kneeAngle > 160 && this.lastPose === 'down') {
            this.lastPose = 'up';
            this.repCount++;
            this.onRepComplete();
        }
    },

    analyzePlank(keypoints) {
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const leftHip = keypoints.find(k => k.name === 'left_hip');
        const leftAnkle = keypoints.find(k => k.name === 'left_ankle');

        if (!leftShoulder || !leftHip || !leftAnkle) return;

        // Check if body is straight
        const hipHeight = Math.abs(leftHip.y - (leftShoulder.y + leftAnkle.y) / 2);
        
        if (hipHeight < 30) {
            if (!this.plankStartTime) {
                this.plankStartTime = Date.now();
            } else {
                const holdTime = (Date.now() - this.plankStartTime) / 1000;
                this.repCount = Math.floor(holdTime);
                
                if (holdTime >= this.questInProgress.target) {
                    this.completeQuest();
                }
            }
        } else {
            this.plankStartTime = null;
        }
    },

    analyzeJumpingJack(keypoints) {
        const leftWrist = keypoints.find(k => k.name === 'left_wrist');
        const rightWrist = keypoints.find(k => k.name === 'right_wrist');
        const leftAnkle = keypoints.find(k => k.name === 'left_ankle');
        const rightAnkle = keypoints.find(k => k.name === 'right_ankle');

        if (!leftWrist || !rightWrist || !leftAnkle || !rightAnkle) return;

        const wristsUp = leftWrist.y < 150 && rightWrist.y < 150;
        const legsSpread = Math.abs(leftAnkle.x - rightAnkle.x) > 100;

        if (wristsUp && legsSpread && this.lastPose !== 'open') {
            this.lastPose = 'open';
        } else if (!wristsUp && !legsSpread && this.lastPose === 'open') {
            this.lastPose = 'closed';
            this.repCount++;
            this.onRepComplete();
        }
    },

    calculateAngle(a, b, c) {
        if (!a || !b || !c) return 0;
        
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                       Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180 / Math.PI);
        if (angle > 180) angle = 360 - angle;
        return angle;
    },

    onRepComplete() {
        // Visual feedback
        if (window.fireConfetti) {
            window.fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
        }
        
        // Play sound
        this.playRepSound();
        
        // Update UI
        document.getElementById('rep-counter').textContent = this.repCount;
        
        // Check if quest complete
        if (this.repCount >= this.questInProgress.target) {
            this.completeQuest();
        }
    },

    playRepSound() {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEzxQ3f7//yA7KIHO89mTQAwWVLn1851BCh9T2/7+/x1BJYTM89mQQQ0aVbr1851CDh9U2v7+/x5DKIfN89iRQQ0bVrv1859CDyBT2v7+/yBDKojM89iSQQ0bVrv2859CECBU2v7+/yFEK4nN89iTQQ0cV7z2859DESFU2v7+/yJFLIrN89iTQQ0dV7z2859DEyFV2/7+/yNFK4vN89iTQQ0dV7308Z9DFCFV2/7+/yRGK43N89iTQQ0eV7308p9DFSFV2/7+/yVHLI7N89iTQQ0eV7308p9DFiJW2/7+/yZILY/N89iTQQ0fWLz18p9DFyJX2/7+/ydJLY/N89iTQQ0gWLz18p9DGCJX2/7+/yhKLpDN89iTQQ0gWLz18p9DGSRY2/7+/ylLL5DN89iTQQ0hWb318p9DGihY2/7+/ypML5HN89iTQQ0hWb31859DGylY2/7+/ytNMJHN89iTQQ0iWb718p9DHChY2/7+/yxOMZLN89iTQQ0iWb71859DHClZ2/7+/y1PMpPN89iTQQ0jWb71859DHSpZ2/7+/y9QM5TN89iTQQ0kWr71859DHStZ2/7+/zBRM5XN89iTQQ0kWr71859DHStZ2/7+/zFSNJbN89iTQQ0lWr71859DHStZ2/7+/zJSNZfN89iTQQ0mWr71859DHStZ2/7+/zNTNpjN89iTQQ0nWr71859DHStZ2/7+/zRUNpjN89iTQQ0nW7z18p9DHStZ2/7+/zVUN5nN89iTQQ0oW7z18p9DHStZ2/7+/zdVN5rN89iTQQ0pW7z18p9DHStZ2/7+/zhWN5vN89iTQQ0qW7z18p9DHStZ2/7+/zlXN5zN89iTQQ0rW7z18p9DHStZ2/7+/zpYN53N89iTQQ0rW7z18p9DHStZ2/7+/ztZN57N89iTQQ0sW7z18p9DHStZ2/7+/zxZN5/N89iTQQ0sW7z18p9DHStZ2/7+/z1ZN6DN89iTQQ0tW7z18p9DHStZ2/7+/z5ZN6HN89iTQQ0tW7z18p9DHStZ2/7+/z9ZN6LN89iTQQ0uW7z18p9DHStZ2/7+/0BZN6PN89iTQQ0uW7z18p9DHStZ2/7+/0FZN6TN89iTQQ0uW7z18p9DHStZ2/7+/0JZN6XN89iTQQ0uW7z18p9DHStZ2/7+/0NZN6bN89iTQQ0uW7z18p9DHStZ2/7+/0RZN6fN89iTQQ0uW7z18p9DHStZ2/7+/0VZN6jN89iTQQ0uW7z18p9DHStZ2/7+/0ZZN6nN89iTQQ0uW7z18p9DHStZ2/7+/0dZN6rN89iTQQ0uW7z18p9DHStZ2/7+/0hZN6vN89iTQQ0uW7z18p9DHStZ2/7+/0lZN6zN89iTQQ0uW7z18p9DHStZ2/7+/0pZN63N89iTQQ0uW7z18p9DHStZ2/7+/0tZN67N89iTQQ0uW7z18p9DHStZ2/7+/0xZN6/N89iTQQ0uW7z18p9DHStZ2/7+/01ZN7DN89iTQQ0uW7z18p9DHStZ2/7+/05ZN7HN89iTQQ0uW7z18p9DHStZ2/7+/09ZN7LN89iTQQ0uW7z18p9DHStZ2/7+/1BZN7PN89iTQQ0uW7z18p9DHStZ2/7+/1FZN7TN89iTQQ0uW7z18p9DHStZ2/7+/1JZN7XN89iTQQ0uW7z18p9DHStZ2/7+/1NZN7bN89iTQQ0uW7z18p9DHStZ2/7+/1RZN7fN89iTQQ0uW7z18p9DHStZ2/7+/1VZN7jN89iTQQ0uW7z18p9DHStZ2/7+/1ZZN7nN89iTQQ0uW7z18p9DHStZ2/7+/1dZN7rN89iTQQ0uW7z18p9DHStZ2/7+/1hZN7vN89iTQQ0uW7z18p9DHStZ2/7+/1lZN7zN89iTQQ0uW7z18p9DHStZ2/7+/1pZN73N89iTQQ0uW7z18p9DHStZ2/7+/1tZN77N89iTQQ0uW7z18p9DHStZ2/7+/1xZN7/N89iTQQ0uW7z18p9DHStZ2/7+/11ZN8DN89iTQQ0uW7z18p9DHStZ2/7+/15ZN8HN89iTQQ0uW7z18p9DHStZ2/7+/18ZN8LN89iTQQ0uW7z18p9DHStZ2/7+/2BZN8PN89iTQQ0uW7z18p9DHStZ2/7+/2FZN8TN89iTQQ0uW7z18p9DHStZ2/7+/2JZN8XN89iTQQ0uW7z18p9DHStZ2/7+/2NZN8bN89iTQQ0uW7z18p9DHStZ2/7+/2RZN8fN89iTQQ0uW7z18p9DHStZ2/7+/2VZN8jN89iTQQ0uW7z18p9DHStZ2/7+/2ZZN8nN89iTQQ0uW7z18p9DHStZ2/7+/2dZN8rN89iTQQ0uW7z18p9DHStZ2/7+/2hZN8vN89iTQQ0uW7z18p9DHStZ2/7+/2lZN8zN89iTQQ0uW7z18p9DHStZ2/7+/2pZN83N89iTQQ0uW7z18p9DHStZ2/7+/2tZN87N89iTQQ0uW7z18p9DHStZ2/7+/2xZN8/N89iTQQ0uW7z18p9DHStZ2/7+/21ZN9DN89iTQQ0uW7z18p9DHStZ2/7+/25ZN9HN89iTQQ0uW7z18p9DHStZ2/7+/29ZN9LN89iTQQ0uW7z18p9DHStZ2/7+/3BZN9PN89iTQQ0uW7z18p9DHStZ2/7+/3FZN9TN89iTQQ0uW7z18p9DHStZ2/7+/3JZN9XN89iTQQ0uW7z18p9DHStZ2/7+/3NZN9bN89iTQQ0uW7z18p9DHStZ2/7+/3RZN9fN89iTQQ0uW7z18p9DHStZ2/7+/3VZN9jN89iTQQ0uW7z18p9DHStZ2/7+/3ZZN9nN89iTQQ0uW7z18p9DHStZ2/7+/3dZN9rN89iTQQ0uW7z18p9DHStZ2/7+/3hZN9vN89iTQQ0uW7z18p9DHStZ2/7+/3lZN9zN89iTQQ0uW7z18p9DHStZ2/7+/3pZN93N89iTQQ0uW7z18p9DHStZ2/7+/3tZN97N89iTQQ0uW7z18p9DHStZ2/7+/3xZN9/N89iTQQ0uW7z18p9DHStZ2/7+/31ZN+DN89iTQQ0uW7z18p9DHStZ2/7+/35ZN+HN89iTQQ0uW7z18p9DHStZ2/7+/39ZN+LN89iTQQ0uW7z18p9DHStZ2/7+/4BZN+PN89iTQQ0uW7z18p9DHStZ2/7+/4FZN+TN89iTQQ0uW7z18p9DHStZ2/7+/4JZN+XN89iTQQ0uW7z18p9DHStZ2/7+/4NZN+bN89iTQQ0uW7z18p9DHStZ2/7+/4RZN+fN89iTQQ0uW7z18p9DHStZ2/7+/4VZN+jN89iTQQ0uW7z18p9DHStZ2/7+/4ZZN+nN89iTQQ0uW7z18p9DHStZ2/7+/4dZN+rN89iTQQ0uW7z18p9DHStZ2/7+/4hZN+vN89iTQQ0uW7z18p9DHStZ2/7+/4lZN+zN89iTQQ0uW7z18p9DHStZ2/7+/4pZN+3N89iTQQ0uW7z18p9DHStZ2/7+/4tZN+7N89iTQQ0uW7z18p9DHStZ2/7+/4xZN+/N89iTQQ0uW7z18p9DHStZ2/7+/41ZN/DN89iTQQ0uW7z18p9DHStZ2/7+/45ZN/HN89iTQQ0uW7z18p9DHStZ2/7+/49ZN/LN89iTQQ0uW7z18p9DHStZ2/7+/5BZN/PN89iTQQ0uW7z18p9DHStZ2/7+/5FZN/TN89iTQQ0uW7z18p9DHStZ2/7+/5JZN/XN89iTQQ0uW7z18p9DHStZ2/7+/5NZN/bN89iTQQ0uW7z18p9DHStZ2/7+/5RZN/fN89iTQQ0uW7z18p9DHStZ2/7+/5VZN/jN89iTQQ0uW7z18p9DHStZ2/7+/5ZZN/nN89iTQQ0uW7z18p9DHStZ2/7+/5dZN/rN89iTQQ0uW7z18p9DHStZ2/7+/5hZN/vN89iTQQ0uW7z18p9DHStZ2/7+/5lZN/zN89iTQQ0uW7z18p9DHStZ2/7+/5pZN/3N89iTQQ0uW7z18p9DHStZ2/7+/5tZN/7N89iTQQ0uW7z18p9DHStZ2/7+/5xZN//N89iTQQ0uW7z18p9DHStZ2/7+/51ZOA=';
        audio.play().catch(() => {});
    },

    drawPose(pose) {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw keypoints
        pose.keypoints.forEach(kp => {
            if (kp.score > 0.3) {
                this.ctx.beginPath();
                this.ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#ff6b35';
                this.ctx.fill();
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

        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2;

        connections.forEach(([start, end]) => {
            const startPoint = pose.keypoints.find(k => k.name === start);
            const endPoint = pose.keypoints.find(k => k.name === end);
            
            if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
                this.ctx.beginPath();
                this.ctx.moveTo(startPoint.x, startPoint.y);
                this.ctx.lineTo(endPoint.x, endPoint.y);
                this.ctx.stroke();
            }
        });
    },

    showCameraModal(quest) {
        // Remove any existing modal
        const existing = document.querySelector('.camera-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'camera-modal active';
        modal.id = 'quest-camera-modal';
        modal.innerHTML = `
            <div class="camera-modal-backdrop" onclick="QuestSystem.stopQuest()"></div>
            <div class="camera-modal-content">
                <div class="camera-header">
                    <h3>${quest.title}</h3>
                    <button class="close-btn" onclick="QuestSystem.stopQuest()">×</button>
                </div>
                <div class="camera-viewport">
                    <video id="quest-camera" autoplay playsinline muted></video>
                    <canvas id="pose-canvas"></canvas>
                    <div class="camera-loading" id="camera-loading">
                        <div class="camera-spinner"></div>
                        <p>Starting camera...</p>
                    </div>
                </div>
                <div class="quest-stats">
                    <div class="stat">
                        <span class="label">Reps</span>
                        <span class="value" id="rep-counter">0</span>
                        <span class="target">/${quest.target}</span>
                    </div>
                    <div class="confidence-meter">
                        <div class="confidence-bar" id="confidence-bar"></div>
                    </div>
                </div>
                <div class="camera-controls">
                    <button class="btn btn-secondary" onclick="QuestSystem.stopQuest()">Cancel</button>
                    <button class="btn btn-primary" onclick="QuestSystem.completeQuest()">Finish Early</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show loading state initially
        const loading = modal.querySelector('#camera-loading');
        if (loading) loading.style.display = 'flex';
    },

    hideCameraLoading() {
        const loading = document.getElementById('camera-loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }
        
        // Ensure video is visible with active class
        const video = document.getElementById('quest-camera');
        if (video) {
            video.classList.add('active');
        }
    },

    async completeQuest() {
        const quest = this.questInProgress;
        const user = window.AuthManager?.getCurrentUser();
        
        if (!user || !quest) {
            this.showToast('Sign in required to save progress', 'error');
            return;
        }

        // Update database
        const { error } = await window.supabaseClient
            .from('user_quests')
            .update({
                status: 'completed',
                progress: Math.max(this.repCount, quest.target),
                completed_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('quest_id', quest.id);

        if (error) {
            this.showToast('Error saving progress', 'error');
            return;
        }

        // Award XP
        await this.awardXP(quest.xp);

        // Show success
        this.stopQuest();
        if (window.fireConfetti) {
            window.fireConfetti();
        }
        this.showToast(`Quest Complete! +${quest.xp} XP`, 'success');
        
        // Refresh quest list
        this.loadUserQuests();
    },

    async awardXP(amount) {
        const user = window.AuthManager?.getCurrentUser();
        if (!user) return;

        // Get current XP
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('xp_points, level')
            .eq('id', user.id)
            .single();

        const newXP = (profile?.xp_points || 0) + amount;
        const newLevel = Math.floor(newXP / 1000) + 1;

        // Update profile
        await window.supabaseClient
            .from('profiles')
            .update({
                xp_points: newXP,
                level: newLevel
            })
            .eq('id', user.id);

        // If leveled up
        if (newLevel > (profile?.level || 1)) {
            this.showToast(`Level Up! You are now level ${newLevel}`, 'success');
        }

        // Update leaderboard
        await this.updateLeaderboard(user.id, newXP);
    },

    async updateLeaderboard(userId, xp) {
        const { data: existing } = await window.supabaseClient
            .from('leaderboard')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (existing) {
            await window.supabaseClient
                .from('leaderboard')
                .update({ total_xp: xp, updated_at: new Date().toISOString() })
                .eq('user_id', userId);
        } else {
            const user = window.AuthManager.getCurrentUser();
            await window.supabaseClient
                .from('leaderboard')
                .insert([{
                    user_id: userId,
                    username: user.user_metadata?.preferred_username || user.email?.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url,
                    total_xp: xp
                }]);
        }
    },

    stopQuest() {
        this.isActive = false;
        this.questInProgress = null;
        this.repCount = 0;
        this.lastPose = null;

        if (this.camera) {
            this.camera.getTracks().forEach(track => track.stop());
            this.camera = null;
        }

        const modal = document.querySelector('.camera-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    },

    renderGuestQuests() {
        const container = document.getElementById('active-quests');
        if (!container) return;

        container.innerHTML = `
            <div class="guest-quests-notice">
                <p>🔒 Sign in to track your quests and earn XP!</p>
                <button class="btn btn-primary" onclick="window.AuthManager.showLoginModal()">
                    Sign In to Start
                </button>
            </div>
            <div class="demo-quests">
                ${this.quests.slice(0, 3).map(quest => `
                    <div class="quest-card disabled">
                        <div class="quest-header">
                            <div class="quest-icon">${this.getQuestIcon(quest.exercise)}</div>
                            <div class="quest-info">
                                <h3 class="quest-title">${quest.title}</h3>
                                <p class="quest-desc">${quest.description}</p>
                            </div>
                            <div class="quest-xp">+${quest.xp} XP</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    showManualCompleteModal(quest) {
        const modal = document.createElement('div');
        modal.className = 'manual-complete-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <h3>Complete "${quest.title}"?</h3>
                <p>${quest.description}</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.manual-complete-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" id="confirm-complete">Complete (+${quest.xp} XP)</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#confirm-complete').addEventListener('click', () => {
            this.repCount = quest.target;
            this.completeQuest();
            modal.remove();
        });
    },

    loadQuestProgress() {
        // Load from localStorage for offline persistence
        const saved = localStorage.getItem('quest_progress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {};
    },

    saveQuestProgress() {
        // Save to localStorage
        localStorage.setItem('quest_progress', JSON.stringify({
            lastUpdated: Date.now()
        }));
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('active-quests')) {
        QuestSystem.init();
    }
});

window.QuestSystem = QuestSystem;
