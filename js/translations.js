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
   bouquetCard1Title: "Pink Romance",
   bouquetCard1Desc: "Modest, tender, charming",
   bouquetCard1Price: "$28.57", // 1200 / 42
   bouquetCard2Title: "Lavender Dreams",
   bouquetCard2Desc: "Aroma and elegance",
   bouquetCard2Price: "$13.10", // 550 / 42
   bouquetCard3Title: "Spring Freshness",
   bouquetCard3Desc: "Bouquet for a good mood",
   bouquetCard3Price: "$16.67", // 700 / 42
   bouquetCard4Title: "Spring Tenderness",
   bouquetCard4Desc: "Delicate combination of pastel flowers",
   bouquetCard4Price: "$15.48", // 650 / 42
   bouquetCard5Title: "Sunny Smile",
   bouquetCard5Desc: "Bouquet that gives warmth and positivity",
   bouquetCard5Price: "$50.00", // 2100 / 42
   bouquetCard6Title: "Evening Magic",
   bouquetCard6Desc: "Elegance in every color note",
   bouquetCard6Price: "$16.67", // 700 / 42
   bouquetCard7Title: "Red Heart",
   bouquetCard7Desc: "Passion and tenderness in every petal",
   bouquetCard7Price: "$71.43", // 3000 / 42
   bouquetCard8Title: "Petals of Tenderness",
   bouquetCard8Desc: "Perfect gift for your loved ones",
   bouquetCard8Price: "$11.90", // 500 / 42
   bouquetCard9Title: "Flower Symphony",
   bouquetCard9Desc: "Luxurious combination of colors and aromas",
   bouquetCard9Price: "$19.05", // 800 / 42
   bouquetCard10Title: "Pearl of Summer",
   bouquetCard10Desc: "Bright accent for any occasion",
   bouquetCard10Price: "$22.62", // 950 / 42
   bouquetCard11Title: "Royal Grace",
   bouquetCard11Desc: "Warm shades of love and care",
   bouquetCard11Price: "$86.90", // 3650 / 42
   bouquetCard12Title: "August Warmth",
   bouquetCard12Desc: "A floral reminder of summer",
   bouquetCard12Price: "$23.81", // 1000 / 42
   bouquetCard13Title: "Tulip Happiness",
   bouquetCard13Desc: "Spring lightness in every stem",
   bouquetCard13Price: "$26.19", // 1100 / 42
   bouquetCard14Title: "Summer Mood",
   bouquetCard14Desc: "Colors that bring a smile",
   bouquetCard14Price: "$10.71", // 450 / 42
   bouquetCard15Title: "Silken Morning",
   bouquetCard15Desc: "Light and refined scent of the morning",
   bouquetCard15Price: "$15.48", // 650 / 42
   bouquetCard16Title: "Dawn Dreams",
   bouquetCard16Desc: "Warm shades of morning sun",
   bouquetCard16Price: "$27.38", // 1150 / 42
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
    bouquetTitle: "Асортимент букетів",
    bouquetCard1Title: "Рожевий роман",
    bouquetCard1Desc: "Скромний, ніжний, чарівний",
    bouquetCard1Price: "₴1200",
    bouquetCard2Title: "Лавандові сни",
    bouquetCard2Desc: "Аромат та елегантність",
    bouquetCard2Price: "₴550",
    bouquetCard3Title: "Весняна свіжість",
    bouquetCard3Desc: "Букет для гарного настрою",
    bouquetCard3Price: "₴700",
    bouquetCard4Title: "Ніжність весни",
    bouquetCard4Desc: "Делікатне поєднання пастельних квітів",
    bouquetCard4Price: "₴650",
    bouquetCard5Title: "Сонячна усмішка",
    bouquetCard5Desc: "Букет, що дарує тепло та позитив",
    bouquetCard5Price: "₴2100",
    bouquetCard6Title: "Магія вечора",
    bouquetCard6Desc: "Вишуканість у кожній ноті кольору",
    bouquetCard6Price: "₴700",
    bouquetCard7Title: "Червоне серце",
    bouquetCard7Desc: "Пристрасть і ніжність у кожній пелюстці",
    bouquetCard7Price: "₴3000",
    bouquetCard8Title: "Пелюстки ніжності",
    bouquetCard8Desc: "Ідеальний подарунок для найдорожчих",
    bouquetCard8Price: "₴500",
    bouquetCard9Title: "Квіткова симфонія",
    bouquetCard9Desc: "Розкішне поєднання кольорів та ароматів",
    bouquetCard9Price: "₴800",
    bouquetCard10Title: "Перлина літа",
    bouquetCard10Desc: "Яскравий акцент для будь-якої події",
    bouquetCard10Price: "₴950",
    bouquetCard11Title: "Королівська грація",
    bouquetCard11Desc: "Теплі відтінки любові та турботи",
    bouquetCard11Price: "₴3650",
    bouquetCard12Title: "Тепло серпня",
    bouquetCard12Desc: "Квіткове нагадування про літо",
    bouquetCard12Price: "₴1000",
    bouquetCard13Title: "Тюльпанове щастя",
    bouquetCard13Desc: "Весняна легкість у кожному стеблі",
    bouquetCard13Price: "₴1100",
    bouquetCard14Title: "Літній настрій",
    bouquetCard14Desc: "Барви, що приносять усмішку",
    bouquetCard14Price: "₴450",
    bouquetCard15Title: "Шовковий ранок",
    bouquetCard15Desc: "Легкий та витончений аромат початку дня",
    bouquetCard15Price: "₴650",
    bouquetCard16Title: "Світанкові мрії",
    bouquetCard16Desc: "Теплі відтінки ранкового сонця",
    bouquetCard16Price: "₴1150",
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

function applyTranslation(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            // ДЛЯ КНОПОК SUBMIT ТА INPUT TYPE=BUTTON
            if (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button')) {
                el.setAttribute('value', translations[lang][key]);
            } 
            // ДЛЯ span, h, p, a, div 
            else {
                el.innerHTML = translations[lang][key]; 
            }
        }
    });

    //ДЛЯ PLACEHOLDE
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });
}
// ЗАВАНТАЖЕННЯ МОВИ З LOCALSTORAGE
window.addEventListener("DOMContentLoaded", () => {
   // Беремо мову з атрибута lang="ua" у HTML, якщо в сховищі нічого немає
   const defaultLang = document.documentElement.getAttribute('lang') || 'ua';
   const savedLang = localStorage.getItem("selectedLang") || defaultLang;
   setLanguage(savedLang);
});


// ВСТАНОВИТИ МОВУ
function setLanguage(lang) {
   // знайти відповідний елемент у меню
   const option = document.querySelector(`a[data-lang="${lang}"]`);
   if (!option) return;

   const flagClass = option.querySelector('span').className;
   const languageText = option.textContent.trim();

   selected.innerHTML = `<span class="${flagClass}"></span> ${languageText}`;
   selected.setAttribute("data-lang", lang);

   applyTranslation(lang);

   localStorage.setItem("selectedLang", lang);
}


// КЛІК ПО МЕНЮ ВИБОРУ МОВИ
selected.addEventListener('click', (e) => {
   e.stopPropagation();
   langMenu.classList.toggle('show');
});


// ВИБІР МОВИ
options.forEach(option => {
   option.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const lang = option.getAttribute('data-lang');

      setLanguage(lang);

      langMenu.classList.remove('show');
   });
});


// ЗАКРИТТЯ МЕНЮ ПРИ КЛІКУ 
document.addEventListener('click', (e) => {
   if (!langMenu.contains(e.target) && !selected.contains(e.target)) {
      langMenu.classList.remove('show');
   }
});