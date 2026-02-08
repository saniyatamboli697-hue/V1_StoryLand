"use strict";

// ======================== LOCAL STORAGE CONFIG ========================
// Gets email from localStorage (set by login/Welcome_Page_JS.js)
function getUserEmail() {
    return localStorage.getItem('quizUserEmail') || 'guest@example.com';
}

// ======================== LOCAL PROFILE FUNCTIONS ========================
function getLocalProfile() {
    const email = getUserEmail();
    const key = `profile_${email.replace(/[@.]/g, '_')}`;
    const stored = localStorage.getItem(key);

    return stored ? JSON.parse(stored) : {
        email: email,
        totalQuizzes: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        completed: [],
        weakTopics: {},
        sessionResults: [],  // Current session quiz results
        created: new Date().toISOString()
    };
}

function saveLocalProfile(profile) {
    const email = getUserEmail();
    const key = `profile_${email.replace(/[@.]/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(profile));
}

// ======================== SESSION CACHE ========================
// Temporary storage for current browser session
function getSessionResults() {
    const sessionKey = `session_${getUserEmail()}`;
    const sessionData = sessionStorage.getItem(sessionKey);
    return sessionData ? JSON.parse(sessionData) : [];
}

function saveSessionResult(quizResult) {
    const sessionResults = getSessionResults();
    sessionResults.push(quizResult);
    const sessionKey = `session_${getUserEmail()}`;
    sessionStorage.setItem(sessionKey, JSON.stringify(sessionResults));
}

// ======================== QUIZ STATE ========================
let current = 0;
let score = 0;
let answers = [];
let submitted = new Set();
let wrongs = [];
let quizStarted = false;
let overallTimerInterval = null;
let quizTimeLeft = 0;
let warningPlayed = false;

// ======================== TIMER FUNCTIONS ========================
function startOverallTimer() {
    clearInterval(overallTimerInterval);
    quizTimeLeft = window.TOTAL_QUIZ_TIME || 120;
    warningPlayed = false;
    updateOverallTimerDisplay();

    const timerTimeEl = document.getElementById('overallTimerTime');
    if (timerTimeEl) timerTimeEl.classList.remove('timer-warning');

    overallTimerInterval = setInterval(() => {
        quizTimeLeft--;

        if (quizTimeLeft <= 10 && quizTimeLeft > 0) {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAo');
            audio.play().catch(() => { });
        }

        if (quizTimeLeft === 30 && !warningPlayed) {
            warningPlayed = true;
        }

        if (quizTimeLeft <= 0) {
            clearInterval(overallTimerInterval);
            setTimeout(() => {
                showCustomAlert('⏰ Time\'s up! Showing your results!');
                finishQuiz();
            }, 600);
            return;
        }

        updateOverallTimerDisplay();

        const timerTimeEl = document.getElementById('overallTimerTime');
        if (timerTimeEl && quizTimeLeft <= 30) {
            timerTimeEl.classList.add('timer-warning');
        }
    }, 1000);
}

function updateOverallTimerDisplay() {
    const timerEl = document.getElementById('overallTimerTime');
    const progressEl = document.getElementById('overallTimerProgress');
    if (!timerEl || !progressEl) return;

    const minutes = Math.floor(quizTimeLeft / 60);
    const seconds = quizTimeLeft % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const circumference = 565;
    const offset = circumference - (circumference * (window.TOTAL_QUIZ_TIME - quizTimeLeft) / window.TOTAL_QUIZ_TIME);
    progressEl.style.strokeDashoffset = offset;
}

// ======================== UTILITY FUNCTIONS ========================
function showCustomAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%);
        background: #fff; color: #333; padding: 20px 30px; border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 10000; max-width: 90vw;
        font-size: 18px; text-align: center; border: 2px solid #4CAF50;
    `;
    alertDiv.innerHTML = `${message}<br><br><button onclick="this.parentElement.remove()" style="background:#4CAF50;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;font-size:16px;">OK</button>`;
    document.body.appendChild(alertDiv);
    alertDiv.querySelector('button').focus();
}

// ======================== MAIN QUIZ FUNCTIONS ========================
function statquiz() {
    console.log("statquiz() called - starting quiz");
    checkQuizData().then(() => {
        startQuiz();
    }).catch(err => {
        showCustomAlert("❌ Quiz data not loaded! Please check quiz configuration.");
    });
}

async function checkQuizData() {
    if (!window.quizData || !window.quizData.length) {
        throw new Error("No quiz data");
    }
    if (!window.QUIZ_ID || !window.QUIZ_NAME) {
        window.QUIZ_ID = window.QUIZ_ID || 'unknown';
        window.QUIZ_NAME = window.QUIZ_NAME || 'Quiz';
    }
}

async function startQuiz() {
    try {
        await checkQuizData();
        if (quizStarted) return;

        quizStarted = true;
        const startScreen = document.getElementById('startScreen');
        if (startScreen) startScreen.style.display = 'none';

        // Reset state
        current = 0;
        score = 0;
        answers = new Array(window.quizData.length);
        submitted = new Set();
        wrongs = [];

        startOverallTimer();
        loadQuestion();

        // Load profile stats
        const profile = getLocalProfile();
        const totalEl = document.getElementById('totalQuizzes');
        if (totalEl) totalEl.textContent = profile.totalQuizzes;

        console.log("Quiz started successfully");
    } catch (error) {
        console.error("Start quiz error:", error);
        showCustomAlert("Failed to start quiz. Please refresh and try again.");
    }
}

function loadQuestion() {
    if (!quizStarted || current >= window.quizData.length) return;

    const q = window.quizData[current];
    const qNumEl = document.getElementById('qNum');
    const scoreNumEl = document.getElementById('scoreNum');
    const progressFillEl = document.getElementById('progressFill');

    if (qNumEl) qNumEl.textContent = current + 1;
    if (scoreNumEl) scoreNumEl.textContent = `${answers.filter(a => a !== undefined).length}/${window.quizData.length}`;
    if (progressFillEl) progressFillEl.style.width = ((current) / window.quizData.length * 100) + '%';

    let html = `<div class="question" role="question">${q.question}</div>`;

    if (q.image) {
        html += `<img src="${q.image}" class="question-image" alt="Question Image" loading="lazy" onerror="this.style.display='none'">`;
    }

    if (q.type === 'mcq' || q.type === 'truefalse') {
        html += '<div class="options" role="radiogroup" aria-label="Options">';
        const options = q.type === 'truefalse' ? ['True', 'False'] : q.options;
        options.forEach((opt, i) => {
            const idx = q.type === 'truefalse' ? (opt === 'True' ? 0 : 1) : i;
            html += `<div class="option" role="radio" tabindex="0" onclick="selectOption(${idx})" onkeydown="handleKey(${idx}, event)" aria-label="${opt}">${opt}</div>`;
        });
        html += '</div>';
    } else {
        html += `<input type="text" id="textAnswer" placeholder="Type your answer here..." autocomplete="off" aria-label="Text answer" value="${answers[current] || ''}">`;
    }

    html += `<div class="controls">
        <button class="btn prev-btn" onclick="prevQuestion()" ${current === 0 ? 'disabled' : ''} aria-label="Previous question">← Previous</button>
        <button class="btn next-btn" onclick="${current === window.quizData.length - 1 ? 'finishQuiz()' : 'nextQuestion()'}">${current === window.quizData.length - 1 ? 'Finish Quiz ✓' : 'Next →'}</button>
    </div>`;

    const questionSection = document.getElementById('questionSection');
    if (questionSection) questionSection.innerHTML = html;

    // Restore previous answer
    setTimeout(() => {
        if (answers[current] !== undefined) {
            if (q.type === 'mcq' || q.type === 'truefalse') {
                const options = document.querySelectorAll('.option');
                if (options[answers[current]]) options[answers[current]].classList.add('selected');
            }
            if (submitted.has(current)) showFeedback();
        }
        document.querySelector('.option, #textAnswer')?.focus();
    }, 100);
}

// ======================== INTERACTION FUNCTIONS ========================
function selectOption(idx) {
    if (submitted.has(current)) return;
    answers[current] = idx;
    document.querySelectorAll('.option').forEach((o, i) => {
        o.classList.toggle('selected', i === idx);
    });
    loadQuestion(); // Refresh to update answered count
}

function handleKey(idx, event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectOption(idx);
    }
}

function showFeedback() {
    const q = window.quizData[current];
    if (q.type !== 'mcq' && q.type !== 'truefalse') return;

    const options = document.querySelectorAll('.option');
    const correctIdx = q.type === 'truefalse' ? (q.correct ? 0 : 1) : q.correct;

    options.forEach((opt, i) => {
        opt.classList.add('answered');
        if (i === correctIdx) opt.classList.add('correct');
        else if (i === answers[current]) opt.classList.add('incorrect');
    });
}

function nextQuestion() {
    const q = window.quizData[current];

    if (q.type === 'mcq' || q.type === 'truefalse') {
        if (answers[current] === undefined) {
            showCustomAlert('Please choose an answer before continuing! 🔍');
            return;
        }
    } else {
        const userAnswer = document.getElementById('textAnswer')?.value.trim();
        if (!userAnswer) {
            showCustomAlert('Please type your answer! ✍️');
            return;
        }
        answers[current] = userAnswer.toLowerCase();
    }

    if (!submitted.has(current)) {
        submitted.add(current);
        scoreQuestion();
        showFeedback();
    }

    current++;
    if (current < window.quizData.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function scoreQuestion() {
    const q = window.quizData[current];
    const userAnswer = answers[current];
    let isCorrect = false;

    if (q.type === 'mcq') isCorrect = userAnswer === q.correct;
    else if (q.type === 'truefalse') isCorrect = (userAnswer === 0) === q.correct;
    else isCorrect = q.answer.some(ans => ans.toLowerCase() === userAnswer);

    if (isCorrect) score++;
    else {
        wrongs.push({
            question: q.question,
            user: userAnswer,
            correct: q.type === 'mcq' ? q.options[q.correct] :
                (q.type === 'truefalse' ? (q.correct ? 'True' : 'False') : q.answer[0]),
            topic: q.topic || 'general'
        });
    }
}

function prevQuestion() {
    if (current > 0) {
        current--;
        loadQuestion();
    }
}

async function finishQuiz() {
    if (!quizStarted) {
        // showCustomAlert("You haven't started the quiz yet!");
        showCustomAlert("Wait a while for your results...!");
        return;
    }

    clearInterval(overallTimerInterval);
    quizStarted = false;

    const percent = Math.round((score / window.quizData.length) * 100);

    // Prepare data for Azure SQL (matching your schema)
    const quizResult = {
        email: getUserEmail(),
        username: getLocalProfile().username || null,  // Optional
        quizId: window.QUIZ_ID,
        quizName: window.QUIZ_NAME,
        score: score,
        total: window.quizData.length,
        timeTaken: (window.TOTAL_QUIZ_TIME || 120) - quizTimeLeft,
        answers: answers,  // Full answers array (JSON serialized by Flask)
        wrongs: wrongs.length,
        percentage: percent,
        timestamp: Date.now()
    };

    // Send to Flask API
    try {
        const response = await fetch('http://192.168.42.139:5000/api/quiz-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizResult)
        });

        const apiResult = await response.json();

        if (apiResult.success && apiResult.recordId) {
            showCustomAlert(`✅ Saved to Azure SQL!\nID: ${apiResult.recordId}\n📧 ${profile.email}`);
            // Update local profile with cloud ID
            profile.cloudRecordId = apiResult.recordId;
        } else {
            throw new Error(apiResult?.error || 'Unknown API error');
        }
    } catch (error) {
        console.error('Cloud save error:', error);
        showCustomAlert('⚠️ Cloud backup failed. Saved locally only.');
    }


    // Update local profile (hybrid approach)
    const profile = getLocalProfile();
    profile.totalQuizzes++;
    profile.totalCorrect += score;
    profile.totalQuestions += window.quizData.length;
    profile.lastQuizDate = new Date().toISOString();
    saveLocalProfile(profile);

    // Show results UI (same as before)
    showResultsUI(score, window.quizData.length, percent, getLocalProfile());
}

function showResultsUI(score, totalQuestions, percent, profile) {
    const resultsConfig = [
        { threshold: 100, title: "🎖️ Perfect!", message: "100% Master!", emoji: "🥇" },
        { threshold: 90, title: "🌟 Outstanding!", message: "Top Performer!", emoji: "🔥" },
        { threshold: 80, title: "⭐ Excellent!", message: "Great Job!", emoji: "✨" },
        { threshold: 70, title: "👍 Good Work!", message: "Solid Performance!", emoji: "💪" },
        { threshold: 0, title: "🌱 Keep Going!", message: "Every attempt makes you better!", emoji: "📈" }
    ];

    // Find appropriate result message
    let result = resultsConfig[resultsConfig.length - 1];
    for (const config of resultsConfig) {
        if (percent >= config.threshold) {
            result = config;
            break;
        }
    }

    const questionSection = document.getElementById('questionSection');
    if (questionSection) {
        questionSection.innerHTML = `
            <div class="results" style="
                text-align: center; 
                padding: 40px 20px; 
                max-width: 600px; 
                margin: 0 auto;
            ">
                <!-- Main Title -->
                <h2 style="margin-bottom: 20px; color: #333;">${result.title} ${result.emoji}</h2>
                
                <!-- Score Circle -->
                <div class="score-circle" style="
                    background: conic-gradient(
                        #4CAF50 0deg, 
                        #4CAF50 ${percent * 3.6}deg, 
                        #f0f0f0 ${percent * 3.6}deg 360deg
                    );
                    margin: 20px auto; 
                    width: 200px; 
                    height: 200px; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 2.5em; 
                    font-weight: bold; 
                    color: #333;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    position: relative;
                ">
                    <div style="
                        background: white;
                        width: 140px;
                        height: 140px;
                        border-radius: 50%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2em;
                        font-weight: 600;
                    ">
                        <div>${score}</div>
                        <div style="font-size: 0.6em; color: #666;">of ${totalQuestions}</div>
                    </div>
                </div>

                <!-- Percentage & Message -->
                <h3 style="color: #4CAF50; margin: 10px 0;">${result.message}</h3>
                <p style="font-size: 1.8em; margin: 10px 0; font-weight: bold;">
                    ${percent}% Score
                </p>

                <!-- Stats -->
                <div style="
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                ">
                    <div style="text-align: center;">
                        <div style="font-size: 2em; color: #4CAF50; font-weight: bold;">${score}</div>
                        <div style="color: #666; font-size: 0.9em;">Correct</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; color: #f44336; font-weight: bold;">${totalQuestions - score}</div>
                        <div style="color: #666; font-size: 0.9em;">Wrong</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; color: #2196F3; font-weight: bold;">${profile.totalQuizzes}</div>
                        <div style="color: #666; font-size: 0.9em;">Total Quizzes</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; color: #FF9800; font-weight: bold;">${Math.round(profile.totalCorrect / profile.totalQuestions * 100) || 0}%</div>
                        <div style="color: #666; font-size: 0.9em;">Avg Score</div>
                    </div>
                </div>

                <!-- User Info -->
                <p style="color: #2196F3; font-size: 1.1em; margin: 15px 0;">
                    📧 User: <strong>${profile.email}</strong>
                </p>
                <p style="color: #4CAF50; font-weight: 600; background: rgba(76,175,80,0.1); padding: 10px; border-radius: 6px; margin: 15px 0;">
                    ✅ Results saved to Azure SQL & Local Storage
                </p>

                <!-- Action Buttons -->
                <div style="
                    margin: 30px 0; 
                    display: flex; 
                    gap: 15px; 
                    justify-content: center; 
                    flex-wrap: wrap;
                ">
                    <button class="btn retry-btn" onclick="location.reload()" style="
                        background: linear-gradient(45deg, #2196F3, #21CBF3);
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        box-shadow: 0 4px 15px rgba(33,150,243,0.3);
                        transition: all 0.3s ease;
                    ">
                        🔄 Play Again
                    </button>
                    <button class="btn dashboard-btn" onclick="location.href='./dashboard_Index.html'" style="
                        background: linear-gradient(45deg, #FF9800, #FFB74D);
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        box-shadow: 0 4px 15px rgba(255,152,0,0.3);
                        transition: all 0.3s ease;
                    ">
                        📊 View Dashboard
                    </button>
                    <button class="btn print-btn" onclick="window.print()" style="
                        background: linear-gradient(45deg, #9C27B0, #E1BEE7);
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        box-shadow: 0 4px 15px rgba(156,39,176,0.3);
                        transition: all 0.3s ease;
                    ">
                        🖨️ Print Results
                    </button>
                </div>

                <!-- Mobile Responsiveness -->
                <style>
                    @media (max-width: 480px) {
                        .score-circle { width: 160px; height: 160px; }
                        .score-circle > div { width: 110px; height: 110px; font-size: 1em; }
                    }
                </style>
            </div>
        `;
    }

    // Update total quizzes counter
    const totalEl = document.getElementById('totalQuizzes');
    if (totalEl) totalEl.textContent = profile.totalQuizzes;

    console.log(`🎉 Results displayed! ${score}/${totalQuestions} (${percent}%) for ${profile.email}`);
}



// ======================== INITIALIZATION ========================
(async () => {
    const profile = getLocalProfile();
    const totalEl = document.getElementById('totalQuizzes');
    if (totalEl) totalEl.textContent = profile.totalQuizzes;
    console.log(`Quiz engine loaded for ${profile.email}. Total quizzes: ${profile.totalQuizzes}`);
})();
