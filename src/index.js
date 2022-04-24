import './sass/main.scss';
import Notiflix, { Notify } from 'notiflix';
import pictureCard from './templates/card.hbs';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import API from './js/api-service';
import { refs } from './js/vars';

let gallery;
let pageOfList = 1;                                     // номер пакета
let marker = false;                                     // маркер того, нарисован ли полученный пакет
const apiSerice = new API();

refs.submitBtn.addEventListener('click', onSearch);     // слушатель на кнопку поиска
refs.upBtn.addEventListener('click', onUpClick);        // слушатель на кнопку "назад вверх"

// обработчик клика по кнопке поиска
function onSearch(event) {
    event.preventDefault();         // отмена перезагрузки при нажатии кнопки
    readyToNewSearch();             // очистка старых данных
    apiSerice.goToServer()
        .then(responseHandle)       // если ок, то обрабатываем полученные данные
        .catch(console.log);
}

// очищает устаревшие данные
function readyToNewSearch() {
    refs.list.innerHTML = '';                           // очистка содержимого страницы при новом поиске
    pageOfList = 1;                                     // возврат к начальному значению пакета (=1)
    apiSerice.query = (refs.inputForm.value).trim();    // получили текст, введенный в поле поиска
    document.body.style.backgroundImage = '';           // очищаем фон страницы
}

// обработчик полученной с сервера информации + отрисовка
function responseHandle(data) {
    const totalImg = data.data.total;      // общее количество найденных элементов

 // проверка результата поиска на ноль.
    if (totalImg === 0) {
        Notify.failure('Sorry! There are no images mathing your query. Please try again.');
        return
    }
    else {
        if (pageOfList === 1) {     // рисуем подходящий под запросос фон, при условии, что это первый пакет
            Notify.success(`Hooray! We found ${totalImg} images.`);
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
        pageOfList++;                   // увеличиваем номер пакета на 1
        apiSerice.page = pageOfList;    // передаем номер пакета в функцию запросов
        apiSerice.goToServer()
            .then(responseHandle)       // если ок, то обрабатываем полученные данные
            .catch(console.log);
    }

    if (window.pageYOffset > 70) {                          // вкл/выкл кнопки вверх
        refs.upBtn.classList.add("on-screen")}
        else {refs.upBtn.classList.remove("on-screen")}
});

// обрабатываем клик по кнопке "к началу"
function onUpClick() {
    document.documentElement.scrollTop = 0;
}

// рисуем галерею
function renderGallery(data) {
    let markup = '';                                                // готовим переменную для отрисовки очередной порции 

    data.data.hits.map(item => { markup += pictureCard(item) });    // формируем код сетки карточек
    refs.list.insertAdjacentHTML('beforeend', markup);              // вставляем код
    document.body.style.cursor = 'default';                         // возвращаем нормальное состояние курсора
    marker = true;                                                  // маркер принимает значение, что пакет обработан

    if (pageOfList === 1)  {
        gallery = new SimpleLightbox('.gallery a', {                // подключение SimpleLightbox с параметрами при первой прорисовке
            captionType: 'attr',
            captionsData: 'alt',
            widthRatio: 0.95,
            captionDelay: 500
        });
    }
    gallery.refresh();                                              // обновляем SimpleLightbox при добавлении следующих пакетов 
}


