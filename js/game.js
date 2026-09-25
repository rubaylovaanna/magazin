const allItems = [
  { id: 0, emoji: 'luk.png', word: 'Лук', lPos: 0 },
  { id: 1, emoji: 'svekla.png', word: 'Свёкла', lPos: 4 },
  { id: 2, emoji: 'lozhka.png', word: 'Ложка', lPos: 0 },
  { id: 3, emoji: 'milo.png', word: 'Мыло', lPos: 2 },
  { id: 4, emoji: 'salat.png', word: 'Салат', lPos: 2 },
  { id: 5, emoji: 'moloko.png', word: 'Молоко', lPos: 0 },
  { id: 6, emoji: 'laim.png', word: 'Лайм', lPos: 0 },
  { id: 7, emoji: 'halva.png', word: 'Халва', lPos: 2 },
  { id: 8, emoji: 'sladosty.png', word: 'Сладости', lPos: 1 }
];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let roundItems = [];
let remainingPool = [];
let roundIndex = 0;
let revealedIds = new Set();
let currentItemId = null;
let isRevealed = false;

let completedQuizzes = 0;
const maxQuizzes = 2;

let quizItems = [];
let correctQuizId = null;
let selectedQuizId = null;
let quizChecked = false;

const startPopup = document.getElementById('startPopup');
const btnStart = document.getElementById('btnStart');
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');
const manul1 = document.getElementById('manul1');
const manul2 = document.getElementById('manul2');
const manul3 = document.getElementById('manul3');
const bagContainer = document.getElementById('bagContainer');
const itemSilhouette = document.getElementById('itemSilhouette');
const itemColor = document.getElementById('itemColor');
const cashRegister = document.getElementById('cashRegister');
const hintArrow = document.getElementById('hintArrow');
const wordDisplay = document.getElementById('wordDisplay');
const btnNext = document.getElementById('btnNext');
const shoppingList = document.getElementById('shoppingList');
const confettiCanvas = document.getElementById('confettiCanvas');
const quizGrid = document.getElementById('quizGrid');
const btnCheck = document.getElementById('btnCheck');
const btnRestartQuiz = document.getElementById('btnRestartQuiz');
const btnRestart = document.getElementById('btnRestart');

// Аудио элементы (только SFX, без озвучки слов)
const audioKassa = document.getElementById('audioKassa');
const audioShurshanie = document.getElementById('audioShurshanie');
const audioCorrect = document.getElementById('audioCorrect');
const audioWrong = document.getElementById('audioWrong');

// Функция воспроизведения аудио с обработкой ошибок
function playAudio(audioElement) {
  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(err => console.log('Audio play error:', err));
  }
}

btnStart.addEventListener('click', () => {
  startPopup.classList.add('hidden');
  startNewRound();
});

function startNewRound() {
  const shuffled = shuffle(allItems);
  roundItems = shuffled.slice(0, 5);
  remainingPool = shuffled.slice(5, 9);
  roundIndex = 0;
  revealedIds.clear();
  isRevealed = false;
  createShoppingList();
  loadRoundItem();
  screen2.classList.remove('active');
  screen2.classList.add('hidden');
  screen3.classList.remove('active');
  screen3.classList.add('hidden');
  screen1.classList.remove('hidden');
  screen1.classList.add('active');
}

function createShoppingList() {
  shoppingList.innerHTML = '';
  roundItems.forEach((item) => {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.dataset.id = item.id;
    listItem.innerHTML = `
      <div class="item-emoji">
        <img src="assets/images/${item.emoji}" alt="${item.word}">
      </div>
      <span class="item-text">${item.word}</span>
    `;
    shoppingList.appendChild(listItem);
  });
}

function updateShoppingList() {
  const listItems = document.querySelectorAll('.list-item');
  listItems.forEach((itemEl) => {
    const id = parseInt(itemEl.dataset.id);
    itemEl.classList.remove('revealed');
    if (revealedIds.has(id)) {
      itemEl.classList.add('revealed');
    }
  });
}

function loadRoundItem() {
  isRevealed = false;
  const currentItem = roundItems[roundIndex];
  currentItemId = currentItem.id;
  manul1.innerHTML = '<img src="assets/images/manul_dumaet.png" alt="Манул задумчивый">';
  manul1.className = 'manul thinking';
  bagContainer.classList.remove('revealed');
  wordDisplay.classList.remove('show');
  btnNext.classList.remove('show');
  hintArrow.classList.add('show');
  itemSilhouette.innerHTML = `<img src="assets/images/ten_${currentItem.emoji}" alt="Силуэт ${currentItem.word}">`;
  itemColor.innerHTML = `<img src="assets/images/${currentItem.emoji}" alt="${currentItem.word}">`;
  let highlightedWord = '';
  for (let i = 0; i < currentItem.word.length; i++) {
    if (i === currentItem.lPos) {
      highlightedWord += `<span class="letter-l">${currentItem.word[i]}</span>`;
    } else {
      highlightedWord += currentItem.word[i];
    }
  }
  wordDisplay.innerHTML = highlightedWord;
  updateShoppingList();
}

cashRegister.addEventListener('click', () => {
  if (isRevealed) return;
  isRevealed = true;
  hintArrow.classList.remove('show');
  bagContainer.classList.add('revealed');
  revealedIds.add(currentItemId);
  manul1.innerHTML = '<img src="assets/images/manul_raduetsya.png" alt="Манул радуется">';
  manul1.className = 'manul happy';
  
  // Звук кассы
  playAudio(audioKassa);

  setTimeout(() => {
    wordDisplay.classList.add('show');
    // Озвучка продукта УБРАНА
    launchConfetti();
    updateShoppingList();
    setTimeout(() => { btnNext.classList.add('show'); }, 1000);
  }, 600);
});

btnNext.addEventListener('click', () => {
  // Шуршание пакета
  playAudio(audioShurshanie);
  
  roundIndex++;
  if (roundIndex >= roundItems.length) {
    setTimeout(() => startQuiz(), 500);
  } else {
    loadRoundItem();
  }
});

function startQuiz() {
  const extraItem = remainingPool[Math.floor(Math.random() * remainingPool.length)];
  correctQuizId = extraItem.id;
  quizItems = [...roundItems, extraItem];
  quizItems = shuffle(quizItems);
  selectedQuizId = null;
  quizChecked = false;
  renderQuizGrid();
  manul2.innerHTML = '<img src="assets/images/manul_dumaet.png" alt="Манул задумчивый">';
  manul2.className = 'quiz-manul thinking';
  screen1.classList.remove('active');
  screen1.classList.add('hidden');
  screen2.classList.remove('hidden');
  screen2.classList.add('active');
  btnCheck.disabled = true;
  btnCheck.style.visibility = 'visible';
  btnCheck.style.opacity = '1';
  btnRestartQuiz.classList.remove('visible');
}

function renderQuizGrid() {
  quizGrid.innerHTML = '';
  quizItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="card-emoji">
        <img src="assets/images/${item.emoji}" alt="${item.word}">
      </div>
      <div class="card-name">${item.word}</div>
    `;
    card.addEventListener('click', () => selectQuizCard(item.id, card));
    quizGrid.appendChild(card);
  });
}

function selectQuizCard(id, cardEl) {
  if (quizChecked) return;
  selectedQuizId = id;
  document.querySelectorAll('.quiz-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  btnCheck.disabled = false;
}

btnCheck.addEventListener('click', () => {
  if (selectedQuizId === null || quizChecked) return;
  quizChecked = true;
  const cards = document.querySelectorAll('.quiz-card');
  let isCorrect = false;
  cards.forEach((card) => {
    const id = parseInt(card.dataset.id);
    card.classList.remove('selected');
    if (id === correctQuizId) card.classList.add('correct');
    if (id === selectedQuizId && id !== correctQuizId) card.classList.add('wrong');
    if (id === selectedQuizId && id === correctQuizId) isCorrect = true;
  });
  
  if (isCorrect) {
    manul2.innerHTML = '<img src="assets/images/manul_raduetsya.png" alt="Манул радуется">';
    manul2.className = 'quiz-manul happy';
    launchConfetti();
    playAudio(audioCorrect);
  } else {
    playAudio(audioWrong);
  }

  btnCheck.style.visibility = 'hidden';
  btnCheck.style.opacity = '0';
  
  setTimeout(() => {
    btnRestartQuiz.classList.add('visible');
  }, 800);
});

btnRestartQuiz.addEventListener('click', () => {
  completedQuizzes++;
  if (completedQuizzes >= maxQuizzes) {
    setTimeout(() => showFinalScreen(), 300);
  } else {
    startNewRound();
  }
});

function showFinalScreen() {
  screen1.classList.remove('active');
  screen1.classList.add('hidden');
  screen2.classList.remove('active');
  screen2.classList.add('hidden');
  screen3.classList.remove('hidden');
  screen3.classList.add('active');
  manul3.innerHTML = '<img src="assets/images/manul_raduetsya.png" alt="Манул радуется">';
  playAudio(audioCorrect);
  for (let i = 0; i < 3; i++) {
    setTimeout(() => launchConfetti(), i * 500);
  }
}

btnRestart.addEventListener('click', () => {
  completedQuizzes = 0;
  startNewRound();
});

function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const particles = [];
  const colors = ['#ff4500', '#ffd700', '#32cd32', '#1e90ff', '#ff69b4'];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: confettiCanvas.width / 2,
      y: confettiCanvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      life: 1
    });
  }
  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.life > 0) {
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5;
        p.life -= 0.02;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  animate();
}

window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});
