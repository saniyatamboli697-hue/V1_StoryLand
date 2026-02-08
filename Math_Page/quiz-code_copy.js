async function generateLessonQuiz(lessonTopic) {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = "🧠 AI is thinking...";

  const prompt = `Create a fun, engaging quiz for kids aged 6-10 about "${lessonTopic}".
Include exactly 10 questions with a mix of:
- 4 multiple choice (4 options, 1 correct)
- 2 true/false
- 2 fill-in-the-blank (short answer)
- 2 image identification (provide a free public image URL and expected answer)

Make questions educational, simple, and exciting. Use emojis.

Return ONLY valid JSON in this exact format:
{
  "title": "Quiz: ${lessonTopic} 🌟",
  "questions": [ ... same structure as before ... ]
}`;

  try {
    // Use Puter.js – no key needed!
    const completion = await puter.ai.chat(prompt, {
      model: "x-ai/grok-4-fast:free" // Fast & great for kids quizzes; or try "claude-sonnet-4.5", "grok-4.1-fast", etc.
    });

    const aiText = completion.message || completion.content;

    // Extract JSON
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const quizData = JSON.parse(jsonMatch[0]);

    // Save and open quiz (same as before)
    localStorage.setItem('aiGeneratedQuiz', JSON.stringify(quizData));
    localStorage.setItem('aiQuizTopic', lessonTopic);
    localStorage.setItem('aiQuizReturnUrl', window.location.href);

    window.open('../Quiz_Folder/ai-quiz.html', '_blank');

    btn.disabled = false;
    btn.textContent = "🤖 Generate AI Quiz";

  } catch (error) {
    console.error(error);
    alert('Oops! The magic didn\'t work this time. Try again! 🌟');
    btn.disabled = false;
    btn.textContent = "🤖 Generate AI Quiz";
  }
}