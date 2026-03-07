const langMenu = document.querySelector('.lang-menu');
const selected = document.querySelector('.selected-lang');
const options = document.querySelectorAll('.lang-menu ul li a');

// Translations
const translations = {
  en: {
    // Навігація
    navHome: "Home",
    navAbout: "About",
    navCatalog: "Catalog",
    navReviews: "Reviews",
    navContact: "Contact",
    // Авторизація
    authLogin: "Login",
    authRegister: "Register",
    // Секція Intro
    introTitle: "Whisper of Flower",
    introDesc: "Every bouquet is like a confession of love",
    introBtn: "Go to catalog",
    // Секція About
    aboutTitle: "About us: flowers, emotions and special moments",
    aboutText1: "Whisper of Flower is a place where every bouquet is created with love and care.",
    aboutText2: "We believe that flowers are not just decor, but a true language of feelings. Our florists create unique compositions that convey emotions and inspire. In every petal, we put a piece of our soul, making your gift special.",
    aboutText3: "Our assortment includes flowers for any occasion — from romantic surprises to grand events. We care about the quality of every bouquet and your emotions, because our goal is to make the world brighter, gentler, and warmer.",
    aboutText4: "Whisper of Flower is more than a flower shop. It's a place where flowers speak, and the whisper of petals tells your story.",
    bouquetTitle: "Bouquet assortment",
   
    // Модальне вікно
    modalOrderBtn: "Order",
    // Секція Reviews
    reviewSectionTitle: "Customer Reviews",
    review1Text: "“The flowers were enchanting, thank you for the fast delivery!”",
    review1Author: "— Anna",
    review2Text: "“The order exceeded all expectations”",
    review2Author: "— Olena",
    review3Text: "“Very beautiful design, I recommend to everyone!”",
    review3Author: "— Maria",
    review4Text: "“I received a sea of emotions, thank you Whisper of Flower”",
    review4Author: "— Kateryna",
    review5Text: "“The bouquet was simply amazing, the aroma filled the whole room!”",
    review5Author: "— Iryna",
    review6Text: "“Thanks for the individual approach — helped choose the perfect option for my wife.”",
    review6Author: "— Serhiy",
    review7Text: "“Delivery on time, everything neat and tasteful. I will definitely order again!”",
    review7Author: "— Andriy",
    review8Text: "“The composition was a true masterpiece, all guests were delighted!”",
    review8Author: "— Oksana",
    reviewBtn: "Leave a review",
    // Секція Contact
    contactSectionTitle: "Contact Information",
    // Footer
    footerAboutTitle: "Whisper of Flower",
    footerAboutDesc: "Flower shop where every bouquet is created with love and care. Gift emotions in every petal!",
    footerCopyright: "© 2025 Whisper of Flower",
    footerNavTitle: "Navigation",
    footerContactTitle: "Contacts",
    footerEmail: "Email: whisperofflower@gmail.com",
    footerPhone: "Телефон: ",
    footerPhoneNumber1: "+38 050 345 67 89",
    footerPhoneNumber2: "+38 098 345 67 89",
   footerPhoneNumber3: "+38 099 345 67 89",
   //Login-page
    authLogin: "Login",
    loginEmail: "Email:",
    loginPassword: "Password:",
    loginRemember: "Remember me",
    loginNoAccount: "Don't have an account? <a href=\"Register.html\">Register</a>",
    loginBtn: "Login",
    //Register-page
    authRegister: "Registration", 
    registerEmail: "Email:",
    registerPassword: "Password:",
    registerRepeatPass: "Repeat:",
    registerGenderMale: "Male",
    registerGenderFemale: "Female",
    registerBtn: "Register",
   //Review-page
    reviewBtn: "Leave a review", 
    reviewNameLabel: "Your Name:",
    reviewNamePlaceholder: "Enter your name",
    reviewEmailLabel: "Email:",
    reviewMessageLabel: "Your Review:",
    reviewMessagePlaceholder: "Share your experience...",
   reviewSubmitBtn: "Submit",
   // titles
   indexTitle: "Flower Shop - Whisper of Flower",
   logTitle: "Login", 
   regTitle: "Register", 
   reviewTitle: "Leave a Review"
 },
   
  ua: {
    // Навігація
    navHome: "Головна",
    navAbout: "Про нас",
    navCatalog: "Каталог",
    navReviews: "Відгуки",
    navContact: "Контакти",
    // Авторизація
    authLogin: "Увійти",
    authRegister: "Зареєструватися",
    // Секція Intro
    introTitle: "Whisper of Flower",
    introDesc: "Кожен букет — як зізнання в коханні",
    introBtn: "Перейти в каталог",
    // Секція About
    aboutTitle: "Про нас: квіти, емоції та особливі моменти",
    aboutText1: "Whisper of Flower – це місце, де кожен букет створюється з любов’ю та ніжністю.",
    aboutText2: "Ми віримо, що квіти — це не просто декор, а справжня мова почуттів. Наші флористи створюють унікальні композиції, які передають емоції та дарують натхнення. У кожній пелюстці ми вкладаємо частинку душі, щоб ваш подарунок став особливим.",
    aboutText3: "Наш асортимент включає квіти для будь‑яких подій — від романтичних сюрпризів до урочистих заходів. Ми дбаємо про якість кожного букета та про ваші емоції, адже наша мета — робити світ яскравішим, ніжнішим та теплішим.",
    aboutText4: "Whisper of Flower — це більше ніж магазин квітів. Це місце, де квіти говорять, а шепіт пелюсток розповідає вашу історію.",
    // Секція Bouquet


    // Модальне вікно
    modalOrderBtn: "Замовити",
    // Секція Reviews
    reviewSectionTitle: "Відгуки клієнтів",
    review1Text: "“Квіти були чарівні, дякую за швидку доставку!”",
    review1Author: "— Анна",
    review2Text: "“Замовлення перевершило всі очікування”",
    review2Author: "— Олена",
    review3Text: "“Дуже гарне оформлення, рекомендую всім!”",
    review3Author: "— Марія",
    review4Text: "“Отримала море емоцій, дякую Whisper of Flower”",
    review4Author: "— Катерина",
    review5Text: "“Букет був просто неймовірний, аромат заповнив усю кімнату!”",
    review5Author: "— Ірина",
    review6Text: "“Дякую за індивідуальний підхід — допомогли підібрати ідеальний варіант для дружини.”",
    review6Author: "— Сергій",
    review7Text: "“Доставка вчасно, все акуратно та зі смаком. Обов’язково замовлю ще!”",
    review7Author: "— Андрій",
    review8Text: "“Композиція була справжнім витвором мистецтва, усі гості захоплювались!”",
    review8Author: "— Оксана",
    reviewBtn: "Залишити відгук",
    // Секція Contact
    contactSectionTitle: "Контактна інформація",
    // Footer
    footerAboutTitle: "Whisper of Flower",
    footerAboutDesc: "Магазин квітів, де кожен букет створюється з любов’ю та ніжністю. Подаруйте емоції у кожній пелюстці!",
    footerCopyright: "© 2025 Whisper of Flower",
    footerNavTitle: "Навігація",
    footerContactTitle: "Контакти",
    footerEmail: "Email: whisperofflower@gmail.com",
    footerPhone: "Телефон: ",
    footerPhoneNumber1: "+38 050 345 67 89",
    footerPhoneNumber2: "+38 098 345 67 89",
     footerPhoneNumber3: "+38 099 345 67 89",
     //Login-page
    authLogin: "Увійти",
    loginEmail: "Ел.пошта:",
    loginPassword: "Пароль:",
    loginRemember: "Запам'ятати мене",
    loginNoAccount: "Не маєте аккаунту? <a href=\"Register.html\">Зареєструватися</a>",
    loginBtn: "Увійти",
   //Register-page
    authRegister: "Реєстрація",
    registerEmail: "Ел.пошта:",
    registerPassword: "Пароль:",
    registerRepeatPass: "Повторити:",
    registerGenderMale: "Чоловік",
    registerGenderFemale: "Жінка",
     registerBtn: "Зареєструватися",
   //Review-page
    reviewBtn: "Залишити відгук",
    reviewNameLabel: "Ваше ім’я:",
    reviewNamePlaceholder: "Введіть ваше ім’я",
    reviewEmailLabel: "Електронна пошта:",
    reviewMessageLabel: "Ваш відгук:",
    reviewMessagePlaceholder: "Поділіться вашими враженнями...",
    reviewSubmitBtn: "Надіслати",
   //titles
     indexTitle: "Квіткова лавка - Whisper of Flower",
     logTitle: "Увійти",
     regTitle: "Зареєструватися",
     reviewTitle: "Залишити відгук"
  }
};


/**
 * ОНОВЛЕНА ФУНКЦІЯ ПЕРЕКЛАДУ СТАТИЧНИХ ЕЛЕМЕНТІВ
 */
function applyTranslation(lang) {
    // Переклад елементів з атрибутом data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            // Для кнопок та інпутів
            if (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button')) {
                el.setAttribute('value', translations[lang][key]);
            } 
            // Для звичайних текстових блоків
            else {
                el.innerHTML = translations[lang][key]; 
            }
        }
    });

    // Переклад плейсхолдерів
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });

    // Оновлення заголовка вкладки браузера (якщо є в об'єкті)
    const titleKey = document.body.getAttribute('data-page-title') || 'indexTitle';
    if (translations[lang] && translations[lang][titleKey]) {
        document.title = translations[lang][titleKey];
    }
}

/**
 * ВСТАНОВЛЕННЯ МОВИ ТА ОНОВЛЕННЯ КОНТЕНТУ
 */
function setLanguage(lang) {
    // 1. Оновлюємо вигляд перемикача мов
    const option = document.querySelector(`a[data-lang="${lang}"]`);
    if (!option) return;

    const flagSpan = option.querySelector('span');
    const flagClass = flagSpan ? flagSpan.className : '';
    const languageText = option.textContent.trim();

    selected.innerHTML = `<span class="${flagClass}"></span> ${languageText}`;
    selected.setAttribute("data-lang", lang);

    // 2. Зберігаємо вибір у браузері
    localStorage.setItem("selectedLang", lang);

    // 3. Перекладаємо статичні елементи (меню, футер тощо)
    applyTranslation(lang);

    // 4. ОНОВЛЮЄМО ДИНАМІЧНИЙ КАТАЛОГ (Букети з бази)
    // Якщо у тебе функція рендеру називається інакше, заміни назву тут
    if (typeof renderBouquets === 'function') {
        renderBouquets(); 
    }
}

/**
 * ПОДІЇ ТА СЛУХАЧІ
 */

// Завантаження сторінки
window.addEventListener("DOMContentLoaded", () => {
    const defaultLang = document.documentElement.getAttribute('lang') || 'ua';
    const savedLang = localStorage.getItem("selectedLang") || defaultLang;
    setLanguage(savedLang);
});

// Відкриття меню мов
selected.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('show');
});

// Вибір мови в меню
options.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        setLanguage(lang);
        langMenu.classList.remove('show');
    });
});

// Закриття меню при кліку в будь-якому іншому місці
document.addEventListener('click', (e) => {
    if (langMenu && !langMenu.contains(e.target) && !selected.contains(e.target)) {
        langMenu.classList.remove('show');
    }
});