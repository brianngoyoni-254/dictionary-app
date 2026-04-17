const input = document.querySelector("input");
const searchBtn = document.querySelector(".search-btn");
const dictionary = document.querySelector(".dictionary-app");

const favBox = document.querySelector(".favorites");
const favList = document.querySelector(".fav-list");
const toggleFavBtn = document.querySelector(".toggle-fav");
const clearBtn = document.querySelector(".clear-btn");

const historyBox = document.querySelector(".history");
const historyList = document.querySelector(".history-list");
const historyBtn = document.querySelector(".toggle-history");
const clearHistoryBtn = document.querySelector(".clear-history-btn");

const themeBtn = document.querySelector(".toggle-theme");
const voiceBtn = document.querySelector(".voice-btn");

let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

let currentWord = "";

/* SAVE */
function saveFavs() {
  localStorage.setItem("favourites", JSON.stringify(favourites));
}

function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}

/* RENDER FAVS */
function renderFavs() {
  favList.innerHTML = "";

  favourites.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    li.onclick = () => {
      input.value = word;
      fetchWord();
    };
    favList.appendChild(li);
  });
}

/* RENDER HISTORY */
function renderHistory() {
  historyList.innerHTML = "";

  history.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    li.onclick = () => {
      input.value = word;
      fetchWord();
    };
    historyList.appendChild(li);
  });
}

/* API */
async function fetchAPI(word) {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  const data = await res.json();
  return data[0];
}

/* AUDIO */
function getAudio(data) {
  if (!data.phonetics) return "";
  for (let p of data.phonetics) {
    if (p.audio && p.audio.trim()) return p.audio;
  }
  return "";
}

/* MAIN */
async function fetchWord() {
  if (!input.value.trim()) return;

  dictionary.innerHTML = `<p class="loading">Loading...</p>`;

  try {
    const data = await fetchAPI(input.value);

    currentWord = data.word;

    history.unshift(data.word);
    if (history.length > 10) history.pop();
    saveHistory();
    renderHistory();

    const audio = getAudio(data);

    const synonyms = data.meanings.flatMap(m =>
      m.definitions.flatMap(d => d.synonyms || [])
    );

    const antonyms = data.meanings.flatMap(m =>
      m.definitions.flatMap(d => d.antonyms || [])
    );

    dictionary.innerHTML = `
      <div class="card">

        <div class="fav-icon">❤️ Add Favourite</div>

        <div class="property"><b>Word:</b> ${data.word}</div>

        <div class="property"><b>Phonetic:</b> ${data.phonetic || "N/A"}</div>

        ${audio ? `<audio controls src="${audio}"></audio>` : ""}

        <div class="property"><b>Definition:</b> ${data.meanings[0].definitions[0].definition}</div>

        <div class="property"><b>Synonyms:</b> ${synonyms.join(", ") || "None"}</div>

        <div class="property"><b>Antonyms:</b> ${antonyms.join(", ") || "None"}</div>

      </div>
    `;

  } catch {
    dictionary.innerHTML = `<p class="not-found">Word not found</p>`;
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("fav-icon")) {

    if (!favourites.includes(currentWord)) {
      favourites.push(currentWord);
      saveFavs();
      renderFavs();

      alert("❤️ Added to favourites successfully!");
    }
  }
});

/* EVENTS */
searchBtn.onclick = fetchWord;

input.addEventListener("keypress", e => {
  if (e.key === "Enter") fetchWord();
});

/* TOGGLES */
toggleFavBtn.onclick = () => favBox.classList.toggle("hidden");
historyBtn.onclick = () => historyBox.classList.toggle("hidden");
themeBtn.onclick = () => document.body.classList.toggle("light-mode");

/* CLEAR */
clearBtn.onclick = () => {
  favourites = [];
  saveFavs();
  renderFavs();
};

clearHistoryBtn.onclick = () => {
  history = [];
  saveHistory();
  renderHistory();
};
// voice mic
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    input.value = e.results[0][0].transcript;
    fetchWord();

    setTimeout(() => {
      input.focus(); 
    }, 100);
  };

  recognition.onend = () => {
    setTimeout(() => {
      input.focus();
    }, 100);
  };
}

voiceBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (!recognition) return alert("Not supported");

  try {
    recognition.start();
  } catch (err) {
    console.log("Mic already running");
  }

  setTimeout(() => {
    input.focus(); 
  }, 150);
});


//init
renderFavs();
renderHistory();