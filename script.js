// --- Danh sách từ để chọn ngẫu nhiên ---
// Bạn nên tìm và thêm nhiều từ hơn vào đây từ các nguồn online
const wordList = [
    "integrate", "resilience", "analyze", "persevere", "ambiguous",
    "collaborate", "abundant", "facilitate", "diligent", "innovate",
    "ephemeral", "ubiquitous", "serendipity", "mellifluous", "juxtapose",
    "apple", "banana", "computer", "internet", "develop", "learn",
    "sustainable", "efficiency", "transparent", "accountability"
    // Thêm nhiều từ khác nữa...
];

// --- Lấy các phần tử HTML ---
const wordDisplay = document.getElementById('word');
const typeDisplay = document.getElementById('type');
const meaningDisplay = document.getElementById('meaning');
const exampleDisplay = document.getElementById('example');
const newWordButton = document.getElementById('newWordBtn');

// --- Hàm bất đồng bộ để gọi API và hiển thị ---
async function fetchAndDisplayRandomWord() {
    // 1. Chọn từ ngẫu nhiên từ danh sách
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const randomWord = wordList[randomIndex];

    // Hiển thị từ được chọn và trạng thái đang tải
    wordDisplay.textContent = randomWord;
    typeDisplay.textContent = ""; // Xóa thông tin cũ
    meaningDisplay.textContent = "Đang tải thông tin...";
    exampleDisplay.textContent = "";

    try {
        // 2. Gọi API DictionaryAPI.dev
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`;
        const response = await fetch(apiUrl);

        // Kiểm tra xem API có trả về lỗi không (ví dụ: 404 Not Found)
        if (!response.ok) {
            // Nếu không tìm thấy từ hoặc có lỗi mạng
            throw new Error(`Không tìm thấy định nghĩa cho từ "${randomWord}" hoặc có lỗi mạng.`);
        }

        // 3. Phân tích dữ liệu JSON trả về
        const data = await response.json();

        // API này trả về một mảng, thường chỉ chứa 1 phần tử chính
        const entry = data[0];

        // 4. Trích xuất thông tin cần thiết (cần kiểm tra vì không phải lúc nào cũng có đủ)
        let wordType = "N/A";
        let wordMeaning = "Không tìm thấy định nghĩa.";
        let wordExample = "Không có ví dụ.";

        if (entry && entry.meanings && entry.meanings.length > 0) {
            // Lấy nhóm nghĩa đầu tiên
            const firstMeaning = entry.meanings[0];
            wordType = firstMeaning.partOfSpeech || "N/A"; // Lấy từ loại

            if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
                // Lấy định nghĩa đầu tiên
                const firstDefinition = firstMeaning.definitions[0];
                wordMeaning = firstDefinition.definition || "Không tìm thấy định nghĩa.";
                wordExample = firstDefinition.example || "Không có ví dụ."; // Lấy ví dụ nếu có
            }
        }

        // 5. Hiển thị thông tin lên trang web
        wordDisplay.textContent = entry.word; // Hiển thị lại từ (có thể có viết hoa khác)
        typeDisplay.textContent = `Từ loại: ${wordType}`;
        meaningDisplay.textContent = `Nghĩa: ${wordMeaning}`;
        exampleDisplay.textContent = `Ví dụ: ${wordExample}`;

    } catch (error) {
        // Xử lý lỗi nếu có (lỗi mạng, lỗi API, từ không tìm thấy...)
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
        meaningDisplay.textContent = `Lỗi: ${error.message}`; // Hiển thị thông báo lỗi
        typeDisplay.textContent = "";
        exampleDisplay.textContent = "";
    }
}

// --- Gắn sự kiện click cho nút ---
newWordButton.addEventListener('click', fetchAndDisplayRandomWord);

// --- Hiển thị từ đầu tiên khi trang được tải ---
fetchAndDisplayRandomWord();
