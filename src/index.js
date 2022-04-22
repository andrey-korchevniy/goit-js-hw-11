import './sass/main.scss';
import Notiflix, { Notify } from 'notiflix';
import pictureCard from './templates/card.hbs';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    inputForm : document.querySelector('.search-input'),    // форма поиска
    submitBtn: document.querySelector('.submit'),           // кнопка
    list: document.querySelector('.gallery'),               // раздел Галерея
    upBtn: document.querySelector('.go-up'),                // кнопка "назад вверх"
}
const axios = require('axios');
const BASE_URL = 'https://pixabay.com/api/';
let pageOfList = 1;                                         // номер пакета
let query = '';                                             // фраза поиска
let marker = false;                                         // маркер того, нарисован ли полученный пакет

refs.submitBtn.addEventListener('click', onSearch);         // слушатель на кнопку поиска
refs.upBtn.addEventListener('click', onUpClick);            // слушатель на кнопку "назад вверх"

// обработчик клика по кнопке поиска
function onSearch(event) {
    event.preventDefault();                     // отмена перезагрузки при нажатии кнопки
    readyToNewSearch();                         // очистка старых данных
    goToServer(query);
}

// очищает устаревшие данные
function readyToNewSearch() {
    refs.list.innerHTML = '';                   // очистка содержимого при новом поиске
    pageOfList = 1;                             // возврат начального значения пакета (=1)
    query = (refs.inputForm.value).trim();      // получили текст, введенный в поле поиска
    document.body.style.backgroundImage = '';   // очищаем фон страницы
}

// обрабатывает запрос на сервер за пакетом картинок
function goToServer(query) {
    getPicters(query)                       // запрос на сервер через функцию
        .then(responseHandle)               // если ок, то обрабатываем полученную инфу
        .catch(console.log);
}

// оформление запроса на сервер с параметрами по умолчанию
async function getPicters(query) {
    document.body.style.cursor = 'wait';                // курсор в состоянии ожидания пока выполняется запрос
    const results = await axios.get(BASE_URL, {
        params: {
            q: query,
            key: '26774622-02fd403a8846318210c49d0fe',
            image_type: 'photo',
            orientation: 'horisontal',
            safesearch: 'true',
            per_page: 40,
            page: pageOfList
        }
    });
    return results;
}

// обработчик полученной с сервера информации + отрисовка
function responseHandle(data) {
    const totalHits = data.data.total;      // общее количество найденных элементов

// проверка результата поиска на ноль.
    if (totalHits === 0) {
        Notify.failure('Sorry! There are no images mathing your query. Please try again.');
        return
    }
    else {
        if (pageOfList === 1) {     // рисуем подходящий под запросос фон, при условии, что это первый пакет
            Notify.success(`Hooray! We found ${totalHits} images.`);
            document.body.style.backgroundImage = `URL(${data.data.hits[0].largeImageURL})`
        } 
    }

    renderGallery(data)                     // отрисовка полученного пакета 
}

// обработка скрола для добавления бесконечной галереи
window.addEventListener("scroll", () => {
    const docRect = document.documentElement.getBoundingClientRect();               // получили доступ к области экрана

    if (docRect.bottom < document.documentElement.clientHeight + 150 && marker) {   // если скрол дошел 150 снизу и маркер позволяет (для избежания дублирования запровсов), то обрабатываем запрос 
        marker = false;
        pageOfList++;            // увеличиваем номер пакета на 1
        goToServer(query)
    }

    if (window.pageYOffset > 70) {                                                  // вкл/выкл кнопки вверх
        refs.upBtn.classList.add("on-screen")}
        else {refs.upBtn.classList.remove("on-screen")}
});

// обрабатываем клик по кнопке "к началу"
function onUpClick() {
    document.documentElement.scrollTop = 0;
}

function renderGallery(data) {
    let markup = '';                                                // готовим переменную для отрисовки очередной порции 
    data.data.hits.map(item => { markup += pictureCard(item)});     // формируем код сетки карточек
    refs.list.insertAdjacentHTML('beforeend', markup);              // вставляем код в 
    document.body.style.cursor = 'default';                         // возвращаем нормальное состояние курсора
    marker = true;                                                  // маркер принимает значение, что пакет обработан
    let gallery = new SimpleLightbox('.gallery a', {                // подключение SimpleLightbox с параметрами
        captionType: 'attr',
        captionsData: 'alt',
        widthRatio: 0.95,
        captionDelay: 500
    });
    gallery.on('show.simplelightbox');      
}


