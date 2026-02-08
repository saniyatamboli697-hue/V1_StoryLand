function togglePlay(id, btn) {
    const audio = document.getElementById(id);
    const allAudios = document.querySelectorAll('audio');
    const allBtns = document.querySelectorAll('.play-btn');
    const allRibbons = document.querySelectorAll('.now-playing');

    if (audio.paused) {
        allAudios.forEach(a => a.pause());
        allBtns.forEach(b => { b.textContent = '▶ Play'; b.classList.remove('playing'); });
        allRibbons.forEach(r => r.style.display = 'none');

        audio.play();
        btn.textContent = '⏸ Pause';
        btn.classList.add('playing');
        btn.closest('.rhyme-card').querySelector('.now-playing').style.display = 'block';
    } else {
        audio.pause();
        btn.textContent = '▶ Play';
        btn.classList.remove('playing');
        btn.closest('.rhyme-card').querySelector('.now-playing').style.display = 'none';
    }
}

function updateProgress(id, progressId) {
    const audio = document.getElementById(id);
    const progress = document.getElementById(progressId);
    if (audio.duration) {
        progress.style.width = (audio.currentTime / audio.duration) * 100 + '%';
    }
}