/**
 * REFILL-O Core State
 */
const AppState = {
  user: {
    name: "Retta",
    tier: "Green Advocate",
    greenPoints: 250,
    totalRefill: 15,
    plasticAvoidedBottles: 30, // botol 500mL
    plasticAvoidedLiters: 15.0, // total liter
    co2ReducedKg: 2.5,
    savingsIdr: 45000,
    sdgProgress: 90
  },
  products: [
    { id: "soap", name: "Sabun Cair", icon: "🧴", pricePer100ml: 1500 },
    { id: "detergent", name: "Deterjen", icon: "🧼", pricePer100ml: 1200 },
    { id: "softener", name: "Softener", icon: "🧴", pricePer100ml: 1400 },
    { id: "handsoap", name: "Hand Soap", icon: "🫧", pricePer100ml: 1600 }
  ],
  quiz: {
    question: "Manakah perilaku yang mencerminkan konsumsi bijak?",
    options: [
      { text: "Membeli air kemasan setiap hari", correct: false },
      { text: "Membawa botol / wadah sendiri", correct: true },
      { text: "Menggunakan sedotan plastik sekali pakai", correct: false }
    ]
  },
  selectedProduct: null,
  selectedQuizOption: null,
  quizSource: "learn" // 'learn' (kembali ke beranda) atau 'qr' (lanjut ke refill now)
};

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
  renderUserData();
  renderProducts();
  renderQuiz();
  calculateRefillPrice();
});

// Pergantian Halaman Tampilan
function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');

  // Update status tombol navigasi bawah
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  if (viewId === 'view-dashboard') {
    document.getElementById('nav-btn-home').classList.add('active');
  }
}

// 1. ALUR LOGIN & DAFTAR
let currentAuthMode = 'login';

function setAuthMode(mode) {
  currentAuthMode = mode;
  document.getElementById('btn-tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('btn-tab-register').classList.toggle('active', mode === 'register');
  document.getElementById('field-name').classList.toggle('hidden', mode === 'login');
  document.getElementById('btn-auth-submit').textContent = mode === 'login' ? 'MASUK' : 'DAFTAR SEKARANG';
  document.getElementById('google-label').textContent = mode === 'login' ? 'Lanjutkan dengan Akun Google' : 'Daftar dengan Akun Google';
}

function authGoogle() {
  alert(`🌐 Menghubungkan ke Google Account (${currentAuthMode.toUpperCase()})...`);
  loginSuccess();
}

function submitAuth(e) {
  e.preventDefault();
  loginSuccess();
}

function loginSuccess() {
  document.getElementById('global-bottom-nav').classList.remove('hidden');
  navigateTo('view-dashboard');
}

// 2. RENDER DATA BERANDA & DAMPAK
function renderUserData() {
  document.getElementById('display-username').textContent = AppState.user.name;
  document.getElementById('display-tier').textContent = `🌱 ${AppState.user.tier}`;
  document.getElementById('val-green-point').textContent = AppState.user.greenPoints;
  document.getElementById('reward-point-display').textContent = AppState.user.greenPoints;
  document.getElementById('val-total-refill').textContent = AppState.user.totalRefill;
  document.getElementById('val-plastic-avoided').textContent = AppState.user.plasticAvoidedBottles;
  document.getElementById('val-plastic-liters').textContent = `Setara ${AppState.user.plasticAvoidedLiters.toFixed(1)} Liter`;
  document.getElementById('val-summary-co2').textContent = `${AppState.user.co2ReducedKg.toFixed(1)} kg CO₂`;
  document.getElementById('val-summary-saving').textContent = `Rp${AppState.user.savingsIdr.toLocaleString('id-ID')}`;

  // Impact Dashboard
  document.getElementById('impact-plastic-count').textContent = AppState.user.plasticAvoidedBottles;
  document.getElementById('impact-plastic-liters-desc').textContent = `Volume: ${AppState.user.plasticAvoidedLiters.toFixed(1)} Liter`;
  document.getElementById('impact-co2-count').textContent = AppState.user.co2ReducedKg.toFixed(1);
  document.getElementById('impact-saving-val').textContent = `Rp${AppState.user.savingsIdr.toLocaleString('id-ID')}`;
  document.getElementById('impact-refill-count').textContent = AppState.user.totalRefill;
  document.getElementById('sdg-fill-bar').style.width = `${AppState.user.sdgProgress}%`;
  document.getElementById('sdg-percent-text').textContent = `Pencapaian: ${AppState.user.sdgProgress}% Target Mandiri`;
}

// 3. ALUR MATERI & KUIS (LEARN VS SCAN QR)
function startLearnFlow() {
  AppState.quizSource = 'learn';
  document.getElementById('quiz-flow-indicator').textContent = 'Mode: Belajar Mandiri (Kembali ke Beranda)';
  navigateTo('view-quiz');
}

function triggerScanFlow() {
  alert('📷 Membuka kamera: Memindai QR Code pada mesin stasiun dispenser REFILL-O...');
  AppState.quizSource = 'qr';
  document.getElementById('quiz-flow-indicator').textContent = 'Mode: Refill Dispenser (Lanjut ke Pengisian)';
  navigateTo('view-quiz');
}

function abortQuizFlow() {
  if (AppState.quizSource === 'qr') {
    navigateTo('view-dashboard');
  } else {
    navigateTo('view-dashboard');
  }
}

function renderQuiz() {
  document.getElementById('quiz-question-text').textContent = AppState.quiz.question;
  const container = document.getElementById('quiz-options-wrapper');
  container.innerHTML = '';

  AppState.quiz.options.forEach((opt, idx) => {
    const div = document.createElement('div');
    div.className = 'choice-option';
    div.innerHTML = `<span>⚪</span> <span>${opt.text}</span>`;
    div.onclick = () => selectQuizOption(div, idx);
    container.appendChild(div);
  });
}

function selectQuizOption(element, index) {
  document.querySelectorAll('.choice-option').forEach(el => {
    el.classList.remove('selected');
    el.querySelector('span').textContent = '⚪';
  });
  element.classList.add('selected');
  element.querySelector('span').textContent = '🟢';
  AppState.selectedQuizOption = index;
}

function evaluateQuizAnswer() {
  if (AppState.selectedQuizOption === null) {
    alert('Silakan tentukan jawaban kuis Anda!');
    return;
  }

  const isCorrect = AppState.quiz.options[AppState.selectedQuizOption].correct;
  if (isCorrect) {
    AppState.user.greenPoints += 10;
    renderUserData();
    alert('🎉 Jawaban Benar! Anda mendapatkan reward +10 Green Point.');
  } else {
    alert('💡 Jawaban kurang tepat, mari terus belajar konsumsi bijak!');
  }

  // Percabangan Alur Sesuai Intruksi
  if (AppState.quizSource === 'qr') {
    navigateTo('view-refill'); // Lanjut ke pengisian botol
  } else {
    navigateTo('view-dashboard'); // Selesai materi dari menu learn
  }
}

// 4. ALUR REFILL NOW & PERHITUNGAN OTOMATIS
function renderProducts() {
  const container = document.getElementById('product-list-container');
  container.innerHTML = '';
  AppState.products.forEach((prod, idx) => {
    const row = document.createElement('div');
    row.className = `prod-item-row ${idx === 0 ? 'selected' : ''}`;
    row.innerHTML = `
      <span>${prod.icon} ${prod.name}</span>
      <span class="prod-radio-circle"></span>
    `;
    row.onclick = () => selectProduct(row, prod);
    container.appendChild(row);
  });
  AppState.selectedProduct = AppState.products[0];
}

function selectProduct(row, product) {
  document.querySelectorAll('.prod-item-row').forEach(r => r.classList.remove('selected'));
  row.classList.add('selected');
  AppState.selectedProduct = product;
  calculateRefillPrice();
}

function calculateRefillPrice() {
  if (!AppState.selectedProduct) return;
  const volumeMl = parseInt(document.getElementById('refill-volume').value, 10);
  const total = (volumeMl / 100) * AppState.selectedProduct.pricePer100ml;
  document.getElementById('refill-total-price').textContent = `Rp${total.toLocaleString('id-ID')}`;
}

function runDispenserRefill() {
  const volumeMl = parseInt(document.getElementById('refill-volume').value, 10);
  const volumeLiter = volumeMl / 1000;

  alert(`💧 Dispenser REFILL-O sedang mengalirkan ${AppState.selectedProduct.name} (${volumeMl} mL)...`);

  setTimeout(() => {
    // Perhitungan Otomatis Sistem
    AppState.user.totalRefill += 1;
    AppState.user.plasticAvoidedLiters += volumeLiter;
    AppState.user.plasticAvoidedBottles += Math.round(volumeLiter / 0.5); // Asumsi 1 botol = 500mL
    AppState.user.co2ReducedKg += volumeLiter * 0.16; // Reduksi emisi
    AppState.user.savingsIdr += Math.round(volumeLiter * 3000); // Penghematan dibanding beli kemasan baru
    AppState.user.greenPoints += Math.round(volumeLiter * 10); // Reward transaksi
    AppState.user.sdgProgress = Math.min(100, AppState.user.sdgProgress + 2);

    renderUserData();
    alert('✅ Pengisian tuntas! Menampilkan kalkulasi dampak lingkungan Anda.');
    navigateTo('view-impact'); // Menuju Impact Dashboard
  }, 1200);
}

// 5. REWARD REDEEM
function redeemPoints(cost) {
  if (AppState.user.greenPoints >= cost) {
    AppState.user.greenPoints -= cost;
    renderUserData();
    alert(`🎁 Berhasil menukarkan ${cost} poin! Saldo tersisa: ${AppState.user.greenPoints} poin.`);
  } else {
    alert('Poin Anda belum mencukupi!');
  }
}

// 6. BOTTOM NAVIGATION ROUTER
function handleBottomNav(destination) {
  if (destination === 'home') {
    navigateTo('view-dashboard');
  } else if (destination === 'activity') {
    alert('📋 Riwayat Aktivitas: Menampilkan daftar transaksi pengisian ulang REFILL-O terdahulu.');
  } else if (destination === 'account') {
    alert(`👤 Profil Akun: ${AppState.user.name} (${AppState.user.tier}).`);
  }
}