const apiBase = "http://172.203.138.104:5010";

let currentBook = null;
let currentPage = 0;

const bookList = document.getElementById("bookList");
const storySection = document.getElementById("storySection");
const audioEl = document.getElementById("pageAudio");

// --- INITIALIZATION ---
window.onload = loadLibrary;

// Static Listeners (Assign these ONLY ONCE)
document.getElementById("prevBtn")?.addEventListener("click", prevPage);
document.getElementById("nextBtn")?.addEventListener("click", nextPage);
document.getElementById("backBtn")?.addEventListener("click", backToLibrary);
document.getElementById("pauseBtn")?.addEventListener("click", togglePause);
document.getElementById("generateBtn")?.addEventListener("click", generateStory);

// Logic for the Generate Button (Crucial!)
// Ensure your HTML button has id="generateBtn"
document.getElementById("generateBtn")?.addEventListener("click", generateStory);

audioEl.addEventListener("ended", () => {
  if (currentBook && currentPage < currentBook.pages.length - 1) {
    currentPage++;
    showPage();
  }
});

// --- FUNCTIONS ---

async function generateStory() {
  const input = document.getElementById("topicInput");
  const topic = input ? input.value : "kids story";

  bookList.innerHTML = "<p style='color:#ffd700; font-size:2em;'>⏳ Creating magic... please wait!</p>";

  try {
    const res = await fetch(`${apiBase}/children_story_with_images?topic=${encodeURIComponent(topic)}`);
    if (res.ok) {
      await loadLibrary();
    } else {
      alert("Magic failed! Server error.");
    }
  } catch (err) {
    alert("Connection error: Is the server running?");
    loadLibrary();
  }
}

async function loadLibrary() {
  if (!bookList) return;
  bookList.innerHTML = "<p>Loading Magic... ✨</p>";
  try {
    const res = await fetch(`${apiBase}/library`);
    const data = await res.json();
    bookList.innerHTML = "";

    data.books.forEach(book => {
      const bookDiv = document.createElement("div");
      bookDiv.className = "book";
      bookDiv.textContent = book.topic;
      bookDiv.onclick = () => openBook(book.book_id);

      const coverUrl = `${apiBase}/static/library/book_${book.book_id}/page_1.png`;
      bookDiv.style.backgroundImage = `url(${coverUrl})`;
      bookDiv.style.backgroundSize = "cover";

      bookList.appendChild(bookDiv);
    });
  } catch (err) {
    bookList.innerHTML = "<p>Server is sleeping... 😴</p>";
  }
}

async function openBook(bookId) {
  try {
    const res = await fetch(`${apiBase}/book/${bookId}`);
    if (!res.ok) throw new Error("Not Found");

    currentBook = await res.json();
    currentPage = 0;

    // HIDE EVERYTHING ELSE
    document.querySelector(".bookshelf").style.display = "none";
    document.querySelector(".title").style.display = "none";
    document.getElementById("generate").style.display = "none"; // Hides the input form

    // SHOW STORY
    storySection.style.display = "block";
    showPage();

  } catch (err) {
    console.error(err);
    // Removed the alert here so it opens silently and smoothly!
  }
}

function showPage() {
  const page = currentBook.pages[currentPage];

  // Updates the Title, Image, and Text
  document.getElementById("storyTitle").textContent = `${currentBook.topic} (${currentPage + 1}/${currentBook.pages.length})`;
  document.getElementById("pageImage").src = page.local_image || page.image_url;
  document.getElementById("pageText").textContent = page.text;

  // Audio Handling
  if (audioEl) {
    audioEl.src = page.audio_url;
    audioEl.play().catch(() => console.log("Waiting for user interaction for audio"));
  }
}

function backToLibrary() {
  if (audioEl) audioEl.pause();
  storySection.style.display = "none";
  document.querySelector(".bookshelf").style.display = "block";
  document.querySelector(".title").style.display = "block";
  document.getElementById("generate").style.display = "flex"; // Shows the generator again
}
function togglePause() {
  const btn = document.getElementById("pauseBtn");
  if (audioEl.paused) {
    audioEl.play();
    if (btn) btn.textContent = "⏸ Pause";
  } else {
    audioEl.pause();
    if (btn) btn.textContent = "▶ Resume";
  }
}

function nextPage() {
  if (currentPage < currentBook.pages.length - 1) {
    currentPage++;
    showPage();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    showPage();
  }
}

// function backToLibrary() {
//   audioEl.pause();
//   storySection.style.display = "none";
//   document.querySelector(".bookshelf").style.display = "block";
//   document.querySelector(".title").style.display = "block";
// }
