import View from "./View";
import icons from '../../img/icons.svg';

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');
    _data;

    addHandlerClick(handler){
        this._parentElement.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn--inline');
            if(!btn) return;
            const goToPage = +btn.dataset.goto;
            handler(goToPage);
        })
    }

    _generateMarkup(){
        const curPage = this._data.page;
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        //Page 1, more pages
        if(curPage === 1 && numPages > 1)
        return this._generateMarkupNextButton(curPage);
    
        //Last Page
        if(curPage === numPages && numPages > 1)
        return this._generateMarkupPrevButton(curPage);

        //OTher page
        if(curPage < numPages)
        return this._generateMarkupPrevButton(curPage) + this._generateMarkupNextButton(curPage);

        //Page 1, no other page
        return '';
    }

    _generateMarkupPrevButton(curPage){
        return `
        <button class="btn--inline pagination__btn--prev" data-goto="${curPage - 1}">
            <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
        </button>
        `
    }
    
    _generateMarkupNextButton(curPage){
        return `
        <button class="btn--inline pagination__btn--next" data-goto="${curPage + 1}">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
        `
    }
}

export default new PaginationView();