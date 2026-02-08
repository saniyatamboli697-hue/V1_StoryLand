
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
        const videoSrc = card.dataset.video;
        const videoElement = document.getElementById('storyVideo');
        videoElement.querySelector('source').src = videoSrc;
        videoElement.load();
        document.getElementById('videoModal').classList.add('active');
        videoElement.play(); // Auto-play magic!
    });
});

document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('videoModal').classList.remove('active');
    document.getElementById('storyVideo').pause();
});

// Tap outside to close (kid-friendly!)
document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('videoModal')) {
        document.querySelector('.close-btn').click();
    }
});

// Keyboard escape for accessibility 🦮
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.close-btn').click();
    }
});