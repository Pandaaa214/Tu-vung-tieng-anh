// --- Lấy các phần tử HTML ---
const wordDisplay = document.getElementById('word');
const typeDisplay = document.getElementById('type');
const meaningDisplay = document.getElementById('meaning'); // Sẽ hiển thị nghĩa tiếng Anh
const exampleDisplay = document.getElementById('example'); // Sẽ hiển thị ví dụ tiếng Anh
const vietnameseMeaningDisplay = document.getElementById('vietnameseMeaning'); // Thêm phần tử mới cho nghĩa tiếng Việt (cần có trong HTML)
const newWordButton = document.getElementById('newWordBtn');

// --- Biến để lưu trữ danh sách từ đã tải ---
let loadedWordList = [];

// --- URL của tệp danh sách từ (ví dụ từ GitHub) ---
const wordListUrl = 'https://raw.githubusercontent.com/dwyl/english-words/master/words.txt';

// --- Hàm bất đồng bộ để tải danh sách từ ---
async function loadWordList() {
    meaningDisplay.textContent = "Đang tải danh sách từ..."; // Thông báo cho người dùng
    if (vietnameseMeaningDisplay) vietnameseMeaningDisplay.textContent = ""; // Xóa nội dung cũ
    newWordButton.disabled = true; // Tắt nút trong khi tải

    try {
        const response = await fetch(wordListUrl);
        if (!response.ok) {
            throw new Error(`Không thể tải danh sách từ từ ${wordListUrl}. Status: ${response.status}`);
        }
        const text = await response.text();
        loadedWordList = text.split('\n')
                            .map(word => word.trim())
                            .filter(word => word.length > 0 && /^[a-zA-Z]+$/.test(word));

        console.log(`Đã tải thành công ${loadedWordList.length} từ.`);

        await fetchAndDisplayRandomWord(); // Sau khi tải xong, hiển thị từ đầu tiên

    } catch (error) {
        console.error("Lỗi khi tải danh sách từ:", error);
        meaningDisplay.textContent = `Lỗi: Không thể tải danh sách từ. (${error.message})`;
        if (vietnameseMeaningDisplay) vietnameseMeaningDisplay.textContent = "";
        wordDisplay.textContent = "Lỗi";
        typeDisplay.textContent = "";
        exampleDisplay.textContent = "";
    } finally {
        newWordButton.disabled = false; // Bật lại nút
    }
}


// --- Hàm bất đồng bộ để chọn từ ngẫu nhiên và gọi API ---
async function fetchAndDisplayRandomWord() {
    if (loadedWordList.length === 0) {
        meaningDisplay.textContent = "Danh sách từ chưa được tải xong...";
        if (vietnameseMeaningDisplay) vietnameseMeaningDisplay.textContent = "";
        return;
    }

    const randomIndex = Math.floor(Math.random() * loadedWordList.length);
    const randomWord = loadedWordList[randomIndex];

    wordDisplay.textContent = randomWord;
    typeDisplay.textContent = "";
    meaningDisplay.textContent = "Đang tải thông tin từ điển..."; // Thông báo tải nghĩa tiếng Anh
    exampleDisplay.textContent = "";
    if (vietnameseMeaningDisplay) vietnameseMeaningDisplay.textContent = "Đang xử lý nghĩa tiếng Việt..."; // Thông báo tải nghĩa tiếng Việt (nếu có phần tử)


    try {
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            if (response.status === 404) {
                 meaningDisplay.textContent = `Không tìm thấy định nghĩa tiếng Anh cho từ "${randomWord}". Đang thử từ khác...`;
                 if (vietnameseMeaningDisplay) vietnameseMeaningDisplay.textContent = "";
                 await fetchAndDisplayRandomWord(); // Thử lại với từ khác
                 return;
            } else {
                throw new Error(`Lỗi API khi tra từ "${randomWord}": ${response.status}`);
            }
        }

        const data = await response.json();
        const entry = data[0];

        let wordType = "N/A";
        let wordMeaningEnglish = "Không tìm thấy định nghĩa tiếng Anh.";
        let wordExample = "Không có ví dụ.";
        let wordMeaningVietnamese = "Cần API dịch thuật để hiển thị nghĩa tiếng Việt."; // Mặc định/placeholder

        if (entry && entry.meanings && entry.meanings.length > 0) {
            const firstMeaning = entry.meanings[0];
            wordType = firstMeaning.partOfSpeech || "N/A";

            if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
                const firstDefinition = firstMeaning.definitions[0];
                wordMeaningEnglish = firstDefinition.definition || "Không tìm thấy định nghĩa tiếng Anh.";
                wordExample = firstDefinition.example || "Không có ví dụ.";

                // --- PHẦN NÀY CẦN THÊM LOGIC GỌI API DỊCH THUẬT ---
                // Để có nghĩa tiếng Việt, bạn cần gọi một API dịch thuật khác tại đây
                // với đầu vào là `wordMeaningEnglish` hoặc `entry.word` và ngôn ngữ đích là 'vi'.
                // Kết quả trả về sẽ gán cho biến `wordMeaningVietnamese`.
                // Ví dụ (pseudo code):
                // try {
                //     const translatedText = await translateApi.translate(wordMeaningEnglish, 'vi');
                //     wordMeaningVietnamese = translatedText;
                // } catch (translateError) {
                //     console.error("Lỗi khi dịch nghĩa:", translateError);
                //     wordMeaningVietnamese = "Không thể dịch nghĩa tiếng Việt (lỗi API dịch).";
                // }
                // Vì không có API dịch miễn phí sẵn, chúng ta giữ nguyên placeholder.
                wordMeaningVietnamese = "Cần API dịch thuật để hiển thị nghĩa tiếng Việt."; // Giữ nguyên placeholder
            }
        }

        wordDisplay.textContent = entry.word;
        typeDisplay.textContent = `Từ loại: ${wordType}`;
        meaningDisplay.textContent = `Nghĩa (Tiếng Anh): ${wordMeaningEnglish}`; // Ghi rõ là nghĩa tiếng Anh
        exampleDisplay.textContent = `Ví dụ (Tiếng Anh): ${wordExample}`;     // Ghi rõ là ví dụ tiếng Anh
        if (vietnameseMeaningDisplay) { // Chỉ cập nhật nếu phần tử tồn tại
             vietnameseMeaningDisplay.textContent = `Nghĩa (Tiếng Việt): ${wordMeaningVietnamese}`; // Hiển thị placeholder hoặc kết quả dịch
        }


    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ điển:", error);
        meaningDisplay.textContent = `Lỗi: ${error.message}`;
        if (vietnameseMeaningDisplay) vietnameseMeaningDisplay.textContent = "";
        typeDisplay.textContent = "";
        exampleDisplay.textContent = "";
    }
}

// --- Gắn sự kiện click cho nút ---
newWordButton.addEventListener('click', fetchAndDisplayRandomWord);

// --- Tải danh sách từ khi trang được tải ---
loadWordList();
