// quiz-loader.js – Supports BOTH premade JSON files AND AI-generated quizzes from localStorage

function getQuizKey() {
    const params = new URLSearchParams(window.location.search);
    return params.get('quiz');
}

async function loadQuiz() {
    const quizKey = getQuizKey();

    // ────────────────────────────────────────────────
    //  CASE 1: AI / Random generated quiz from localStorage
    // ────────────────────────────────────────────────
    const storedQuiz = localStorage.getItem('aiGeneratedQuiz');
    if (storedQuiz) {
        try {
            const data = JSON.parse(storedQuiz);

            // Normalize format
            window.quizData = data.questions || [];
            window.QUIZ_ID = data.id || 'ai-quiz-' + Date.now();
            window.QUIZ_NAME = data.title || localStorage.getItem('aiQuizTopic') || "Abacus Mental Math Quiz 🧮✨";
            window.TOTAL_QUIZ_TIME = data.time || 300; // longer for abacus

            updateUIAfterLoad();
            console.log("Loaded AI-generated quiz from localStorage:", window.quizData);

            // Optional: clean up storage after successful load
            // localStorage.removeItem('aiGeneratedQuiz');
            // localStorage.removeItem('aiQuizTopic');

            return;
        } catch (e) {
            console.error("Failed to load stored AI quiz:", e);
        }
    }

    // ────────────────────────────────────────────────
    //  CASE 2: Traditional premade quiz from file (fallback)
    // ────────────────────────────────────────────────
    if (!quizKey) {
        showQuizError("No quiz selected 😔");
        return;
    }

    const fileMap = {
        'Geography': 'Geography.json',
        'GK': 'GK.json',
        'History': 'History.json',
        'Math': 'Math.json',
        'Science': 'Science.json',
        'Sports': 'Sports.json',
        'quiz1_intro': 'quiz1_intro.json',
        'quiz2_tools': 'quiz2_tools.json',
        'quiz3_slate': 'quiz3_slate.json',
        'quiz4': 'quiz4.json'
    };

    const jsonFile = fileMap[quizKey] || `${quizKey}.json`;
    const jsonPath = `premade/${jsonFile}`;

    try {
        const res = await fetch(jsonPath);
        if (!res.ok) throw new Error(`Status: ${res.status}`);

        const data = await res.json();

        window.quizData = data.questions || [];
        window.QUIZ_ID = data.id || quizKey;
        window.QUIZ_NAME = data.title || "Magic Quiz ✨";
        window.TOTAL_QUIZ_TIME = data.time || 120;

        updateUIAfterLoad();
        console.log("Loaded premade quiz:", window.quizData);
    } catch (err) {
        console.error("Load failed:", err);
        showQuizError(`Cannot load quiz: <strong>${quizKey}</strong><br>File: ${jsonPath}`);
    }
}

function updateUIAfterLoad() {
    if (!window.quizData?.length) {
        showQuizError("Quiz has no questions!");
        return;
    }

    // Update title
    document.getElementById('quizTitle').textContent = window.QUIZ_NAME;
    document.getElementById('totalQ').textContent = window.quizData.length;

    // Customize start screen
    document.querySelector('#startScreen h2').textContent = "Ready for Magic? ✨";
    document.querySelector('#startScreen p').innerHTML =
        `You have <strong>${Math.floor((window.TOTAL_QUIZ_TIME || 120) / 60)}</strong> minutes to answer <strong>${window.quizData.length}</strong> questions!`;
}

function showQuizError(msg = "No quiz found!") {
    document.getElementById('questionSection').innerHTML = `
        <div class="no-quiz">
            <h2>😔 ${msg}</h2>
            <p>Please select a valid quiz</p>
            <button class="btn" onclick="goToCategory()">🏠 Back to Quiz Category</button>
            <button class="btn" onclick="location.reload()">🔄 Try Again</button>
        </div>
    `;
    document.getElementById('startScreen').style.display = 'none';
}

function goToCategory() {
    window.location.href = "./quiz-category.html";
}

// Start loading when page is ready
document.addEventListener('DOMContentLoaded', loadQuiz);