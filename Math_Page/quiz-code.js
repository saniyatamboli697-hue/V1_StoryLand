async function generateLessonQuiz(lessonTopic) {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = "🧠 AI is thinking...";

    const prompt = `Create a fun, engaging quiz for kids aged 6-10 about "${lessonTopic}".
Include exactly 10 questions with a mix of:
- 4 multiple choice (4 options, 1 correct)
- 2 true/false
- 2 fill-in-the-blank (short answer)
- 2 image identification (describe a relevant image URL and expected answer)

Make questions educational, simple, and exciting.
Use emojis where appropriate.

Return ONLY valid JSON in this exact format:
{
  "title": "Quiz: ${lessonTopic} 🌟",
  "questions": [
    {
      "type": "mcq",
      "question": "Your question?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": 2,
      "topic": "${lessonTopic}"
    },
    {
      "type": "truefalse",
      "question": "Is this true?",
      "correct": true
    },
    {
      "type": "fillblank",
      "question": "The process is called ____.",
      "answer": ["evaporation", "condensation"]
    },
    {
      "type": "imageid",
      "question": "What stage of the water cycle is this?",
      "image": "https://example.com/water-cycle-evaporation.jpg",
      "answer": ["evaporation"]
    }
  ]
}`;

    try {
        // const response = await fetch('https://api.openai.com/v1/chat/completions', {
        const response = await fetch('https://api.together.ai/settings/api-keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-your-real-openai-key-here'
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 1500
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");

        const quizData = JSON.parse(jsonMatch[0]);

        // Save data
        localStorage.setItem('aiGeneratedQuiz', JSON.stringify(quizData));
        localStorage.setItem('aiQuizTopic', lessonTopic);
        localStorage.setItem('aiQuizReturnUrl', window.location.href);  // Fixed key!

        // Correct path to quiz file
        window.open('../Quiz_Folder/ai-quiz.html', '_blank');

    } catch (error) {
        console.error(error);
        alert('Oops! The magic didn\'t work this time. Try again! 🌟');
        btn.disabled = false;
        btn.textContent = "🤖 Generate AI Quiz";  // Matches button text
    }
}