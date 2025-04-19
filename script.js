// --- Dữ liệu từ vựng (Bạn có thể thay đổi hoặc thêm vào đây) ---
const vocabulary = [
    { word: 'Hello', meaning: 'Xin chào' },
    { word: 'Book', meaning: 'Quyển sách' },
    { word: 'Computer', meaning: 'Máy vi tính' },
    { word: 'School', meaning: 'Trường học' },
    { word: 'Developer', meaning: 'Lập trình viên' },
    { word: 'Vocabulary', meaning: 'Từ vựng' },
    { word: 'Learn', meaning: 'Học' },
    { word: 'Website', meaning: 'Trang web' }
    // Thêm nhiều từ khác vào đây...
];

// --- Lấy các phần tử HTML ---
const wordDisplay = document.getElementById('word-display');
const meaningDisplay = document.getElementById('meaning-display');
const flashcard = document.getElementById('flashcard');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const currentIndexSpan = document.getElementById('current-index');
const totalWordsSpan = document.getElementById('total-words');

// --- Biến trạng thái ---
let currentWordIndex = 0;
let isFlipped = false; // Biến kiểm tra thẻ đang lật hay chưa

// --- Hàm ---

// Hàm hiển thị từ hiện tại
function displayWord() {
    if (vocabulary.length === 0) {
        wordDisplay.textContent = "Không có từ nào";
        meaningDisplay.textContent = "";
        totalWordsSpan.textContent = 0;
        currentIndexSpan.textContent = 0;
        return;
    }

    const currentWord = vocabulary[currentWordIndex];
    wordDisplay.textContent = currentWord.word;
    meaningDisplay.textContent = currentWord.meaning;

    // Cập nhật tiến trình
    currentIndexSpan.textContent = currentWordIndex + 1;
    totalWordsSpan.textContent = vocabulary.length;

    // Reset trạng thái lật thẻ khi chuyển từ mới
    if (isFlipped) {
        flashcard.classList.remove('is-flipped');
        isFlipped = false;
    }
}

// Hàm lật thẻ để hiện nghĩa hoặc từ
function flipCard() {
    flashcard.classList.toggle('is-flipped');
    isFlipped = !isFlipped;
}

// Hàm chuyển sang từ tiếp theo
function nextWord() {
    // Tăng chỉ số, quay vòng nếu hết danh sách
    currentWordIndex = (currentWordIndex + 1) % vocabulary.length;
    displayWord(); // Hiển thị từ mới
}

// --- Gắn sự kiện ---

// Nhấn nút "Hiện Nghĩa / Từ" hoặc click vào thẻ để lật
revealBtn.addEventListener('click', flipCard);
flashcard.addEventListener('click', flipCard); // Cho phép click trực tiếp vào thẻ

// Nhấn nút "Từ Tiếp Theo"
nextBtn.addEventListener('click', nextWord);

// --- Khởi chạy ---
// Hiển thị từ đầu tiên khi tải trang
displayWord();
