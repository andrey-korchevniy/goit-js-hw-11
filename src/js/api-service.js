export default class ApiService {
    constructor() {
        this.searchQuery = '';
        this.pageOf = 1;
    }

        goToServer() {
            const axios = require('axios');
            const API_KEY = '26774622-02fd403a8846318210c49d0fe';
            const BASE_URL = 'https://pixabay.com/api/';
            const params = {
                q: this.searchQuery,
                key: API_KEY,
                image_type: 'photo',
                orientation: 'horisontal',
                safesearch: 'true',
                per_page: 40,
                page: this.pageOf,
            }
        
            async function getPicters() {
                document.body.style.cursor = 'wait';                    // курсор в состоянии ожидания пока выполняется запрос
                const results = await axios.get(BASE_URL, { params });
                return results;
            }

            return getPicters()                        // запрос на сервер через функцию
                .then(data => { return data })         // если ок, то возвращаем данные
        }
    
    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }

    get page() {
        return this.pageOf;
    }

    set page(newPage) {
        this.pageOf = newPage;
    }
}

