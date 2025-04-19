// --- Lấy các phần tử HTML ---
const wordDisplay = document.getElementById('word');
const typeDisplay = document.getElementById('type');
const meaningDisplay = document.getElementById('meaning');
const exampleDisplay = document.getElementById('example');
const newWordButton = document.getElementById('newWordBtn');

// --- Biến để lưu trữ danh sách từ đã tải ---
let loadedWordList = [];

// --- URL của tệp danh sách từ (ví dụ từ GitHub) ---
// Đây là một danh sách khá lớn (~370k từ). Việc tải có thể mất một chút thời gian.
// Bạn có thể tìm các danh sách từ khác nếu cần.
const wordListUrl = 'https://raw.githubusercontent.com/dwyl/english-words/master/words.txt';

// --- Hàm bất đồng bộ để tải danh sách từ ---
async function loadWordList() {
    meaningDisplay.textContent = "Đang tải danh sách từ..."; // Thông báo cho người dùng
    newWordButton.disabled = true; // Tắt nút trong khi tải

    try {
        const response = await fetch(wordListUrl);
        if (!response.ok) {
            throw new Error(`Không thể tải danh sách từ từ ${wordListUrl}. Status: ${response.status}`);
        }
        const text = await response.text();
        // Phân tích văn bản: tách theo dòng, loại bỏ khoảng trắng thừa và dòng trống
        loadedWordList = text.split('\n')
                            .map(word => word.trim())
                            .filter(word => word.length > 0 && /^[a-zA-Z]+$/.test(word)); // Chỉ giữ lại từ chỉ chứa chữ cái

        console.log(`Đã tải thành công ${loadedWordList.length} từ.`);

        // Sau khi tải xong danh sách, mới hiển thị từ đầu tiên
        await fetchAndDisplayRandomWord();

    } catch (error) {
        console.error("Lỗi khi tải danh sách từ:", error);
        meaningDisplay.textContent = `Lỗi: Không thể tải danh sách từ. (${error.message})`;
        wordDisplay.textContent = "Lỗi";
        typeDisplay.textContent = "";
        exampleDisplay.textContent = "";
    } finally {
        newWordButton.disabled = false; // Bật lại nút
    }
}


// --- Hàm bất đồng bộ để chọn từ ngẫu nhiên và gọi API ---
async function fetchAndDisplayRandomWord() {
    // 1. Kiểm tra xem danh sách từ đã được tải chưa
    if (loadedWordList.length === 0) {
        meaningDisplay.textContent = "Danh sách từ chưa được tải xong...";
        // Không làm gì tiếp nếu danh sách rỗng, chờ loadWordList hoàn thành
        return;
    }

    // 2. Chọn từ ngẫu nhiên từ danh sách ĐÃ TẢI
    const randomIndex = Math.floor(Math.random() * loadedWordList.length);
    const randomWord = loadedWordList[randomIndex];

    // Hiển thị từ được chọn và trạng thái đang tải
    wordDisplay.textContent = randomWord;
    typeDisplay.textContent = ""; // Xóa thông tin cũ
    meaningDisplay.textContent = "Đang tải thông tin từ điển..."; // Cập nhật thông báo tải
    exampleDisplay.textContent = "";

    try {
        // 3. Gọi API DictionaryAPI.dev với từ ngẫu nhiên đã chọn
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`;
        const response = await fetch(apiUrl);

        // Kiểm tra xem API có trả về lỗi không (ví dụ: 404 Not Found)
        if (!response.ok) {
            // Xử lý trường hợp API không tìm thấy định nghĩa cho từ này
            if (response.status === 404) {
                 meaningDisplay.textContent = `Không tìm thấy định nghĩa cho từ "${randomWord}". Đang thử từ khác...`;
                 // Thử lại với một từ ngẫu nhiên khác nếu không tìm thấy định nghĩa
                 await fetchAndDisplayRandomWord();
                 return; // Ngăn không chạy tiếp phần hiển thị lỗi phía dưới
            } else {
                 // Các lỗi API khác
                throw new Error(`Lỗi API khi tra từ "${randomWord}": ${response.status}`);
            }
        }

        // 4. Phân tích dữ liệu JSON trả về
        const data = await response.json();

        // API này trả về một mảng, thường chỉ chứa 1 phần tử chính
        const entry = data[0];

        // 5. Trích xuất thông tin cần thiết (cần kiểm tra vì không phải lúc nào cũng có đủ)
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

        // 6. Hiển thị thông tin lên trang web
        wordDisplay.textContent = entry.word; // Hiển thị lại từ (có thể có viết hoa khác)
        typeDisplay.textContent = `Từ loại: ${wordType}`;
        meaningDisplay.textContent = `Nghĩa: ${wordMeaning}`;
        exampleDisplay.textContent = `Ví dụ: ${wordExample}`;

    } catch (error) {
        // Xử lý lỗi nếu có (lỗi mạng, lỗi API không phải 404...)
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
        meaningDisplay.textContent = `Lỗi: ${error.message}`; // Hiển thị thông báo lỗi
        typeDisplay.textContent = "";
        exampleDisplay.textContent = "";
    }
}

// --- Gắn sự kiện click cho nút ---
newWordButton.addEventListener('click', fetchAndDisplayRandomWord);

// --- Tải danh sách từ khi trang được tải ---
// Thay vì hiển thị từ đầu tiên ngay lập tức, chúng ta tải danh sách từ trước.
// Hàm loadWordList sẽ tự gọi fetchAndDisplayRandomWord sau khi tải xong.
loadWordList();
