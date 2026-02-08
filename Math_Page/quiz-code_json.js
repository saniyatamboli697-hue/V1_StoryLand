function loadRandomPremadeQuiz(event) {
    const btn = event?.target || this;  // Works even if event not passed
    btn.textContent = "🎲 Loading Quiz...";
    btn.disabled = true;

    // ABSOLUTE PATHS from server root (works perfectly with Live Server)
    const quizzes = [
        'quiz1_intro',
        'quiz2_tools',
        'quiz3_slate',
        'quiz4'
    ];

    const randomQuizKey = quizzes[Math.floor(Math.random() * quizzes.length)];

    // Unified quiz launch
    window.open(`../Quiz_Folder/ai-quiz.html?quiz=${randomQuizKey}`, '_blank');

    btn.textContent = "🎲 Play Fun Quiz ✨";
    btn.disabled = false;
}
