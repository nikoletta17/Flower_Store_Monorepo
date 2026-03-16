const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem('access_token');

document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    loadBouquets();
});

function checkAdmin() {
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'admin') {
        alert("Доступ заборонено!");
        window.location.href = "index.html";
    }
}

function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');

    if (tabName === 'bouquets') loadBouquets();
}

// --- ЗАГРУЗКА СПИСКА ---
async function loadBouquets() {
    try {
        const res = await fetch(`${API_URL}/bouquet/?limit=100`);
        const data = await res.json();
        const bouquets = Array.isArray(data) ? data : (data.items || []);
        
        const tbody = document.querySelector("#bouquets-table tbody");
        if (!tbody) return;

        tbody.innerHTML = bouquets.map(b => {
            let imgName = b.image_url || 'default.jpg';
            // Логика путей, которую мы вывели раньше
            let finalSrc = imgName.includes('/') ? `${API_URL}/static/${imgName}` : `${API_URL}/static/img/${imgName}`;
            finalSrc = finalSrc.replace(/([^:]\/)\/+/g, "$1");

            return `
            <tr>
                <td><img src="${finalSrc}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" 
                     onerror="this.onerror=null; this.src='${API_URL}/static/img/default.jpg';"></td>
                <td><strong>${b.title_ua}</strong></td>
                <td>${(b.price / 100).toFixed(2)} грн</td>
                <td>
                    <button onclick="deleteItem('bouquet', ${b.id})" class="delete-btn">🗑</button>
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error("Помилка завантаження:", err);
    }
}

// --- ОТПРАВКА НОВОГО БУКЕТА (С ФАЙЛОМ) ---
async function handleBouquetSubmit() {
    const fileInput = document.getElementById('b-image-file');
    
    // Проверка, выбрал ли ты файл
    if (!fileInput.files[0]) {
        alert("Будь ласка, виберіть фото для букета!");
        return;
    }

    // Создаем FormData (это нужно, потому что на бэкенде Form(...) и File(...))
    const formData = new FormData();
    formData.append('title_ua', document.getElementById('b-title-ua').value.trim());
    formData.append('title_en', document.getElementById('b-title-en').value.trim());
    formData.append('description_ua', document.getElementById('b-desc-ua').value.trim());
    formData.append('description_en', document.getElementById('b-desc-en').value.trim());
    formData.append('price', document.getElementById('b-price').value);
    formData.append('anchor_id', "flower_" + Date.now());
    
    // Поле 'file' должно называться так же, как в роутере Python
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch(`${API_URL}/bouquet/`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`
                // Важно: Content-Type для FormData браузер ставит сам!
            },
            body: formData
        });

        if (res.ok) {
            alert("Букет успішно створено!");
            location.reload();
        } else {
            const err = await res.json();
            console.log("Деталі помилки:", err);
            alert("Помилка при створенні букета!");
        }
    } catch (e) {
        console.error(e);
        alert("Помилка з'єднання з сервером");
    }
}

async function deleteItem(type, id) {
    if (!confirm("Ви впевнені?")) return;
    const res = await fetch(`${API_URL}/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) location.reload();
}