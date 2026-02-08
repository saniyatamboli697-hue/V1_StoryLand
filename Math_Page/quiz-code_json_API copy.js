function loadRandomPremadeQuiz(event) {
    const btn = event?.target || this;
    btn.textContent = "Loading Abacus Quiz... 🧮";
    btn.disabled = true;

    const quizzes = [
        'http://172.203.138.104:5009/abacus?level=4&topic=addition&operands=6&count=8',
        // Add more later if needed
    ];

    const apiUrl = quizzes[Math.floor(Math.random() * quizzes.length)];

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // === EXTRACT AND CLEAN THE QUIZ JSON ===
            let rawString = data.abacus_exercise || data.quiz || "";

            if (typeof rawString !== 'string') {
                throw new Error("No quiz data found in response");
            }

            // Remove markdown code blocks: ```json ... ```
            rawString = rawString
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            let quizData;
            try {
                console.log("Parsing quiz JSON:", rawString);
                quizData = JSON.parse(rawString);
            } catch (e) {
                console.log('parsing error', e);
                console.error("Failed to parse quiz JSON:", rawString);
                throw new Error("Invalid quiz format from server");
            }

            // === CONVERT TO FORMAT ai-quiz.html EXPECTS ===
            // Convert "correct": "47" → "correct": 0 (index)
            quizData.question = quizData.question.map(q => {
                if (q.type === "mcq") {
                    const correctIndex = q.options.indexOf(q.correct);
                    if (correctIndex === -1) {
                        console.warn("Correct answer not in options!", q);
                        return { ...q, correct: 0 }; // fallback
                    }
                    return {
                        ...q,
                        correct: correctIndex  // ← Critical fix!
                    };
                }
                return q;
            });

            // Optional: Clean up title
            if (!quizData.title) {
                quizData.title = "Abacus Mental Math Quiz 🧮✨";
            }
            console.log("Final quiz data:", quizData);

            // === SAVE TO localStorage (same as AI quiz) ===
            localStorage.setItem('aiGeneratedQuiz', JSON.stringify(quizData));
            localStorage.setItem('aiQuizTopic', quizData.title);
            localStorage.setItem('aiQuizReturnUrl', window.location.href);

            // Open quiz page
            window.open('../Quiz_Folder/ai-quiz.html', '_blank');

            // Reset button
            btn.textContent = "Play Fun Quiz ✨";
            btn.disabled = false;
        })
        .catch(error => {
            console.error('Failed to load quiz:', error);
            alert('Oops! Could not load the Abacus quiz 😔\n\nMake sure your server is running and accessible.');
            btn.textContent = "Play Fun Quiz ✨";
            btn.disabled = false;
        });
}