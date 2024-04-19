import { API_URL, RES_PER_PAGE, API_KEY } from './config.js';
// import { getJSON, sendJSON } from "./helper";
import { AJAX } from "./helper";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE
    },
    bookmarks: [],
}

const getRecipeObject = function(data){
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        cookingTime: recipe.cooking_time,
        image: recipe.image_url,
        ingredients: recipe.ingredients,
        publisher: recipe.publisher,
        servings: recipe.servings,
        sourceURL: recipe.source_url,
        ...(recipe.key && {key: recipe.key})
    }
}

export const loadRecipes = async function(id){
    try{
        const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);
        state.recipe = getRecipeObject(data);
        if(state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else 
            state.recipe.bookmarked = false;
    }
    catch(err){
        throw err;
    }
}

export const loadSearchResults = async function(query){
    try{
        state.search.query = query;
        state.search.page = 1;
        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
        state.search.results = data.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                image: recipe.image_url,
                publisher: recipe.publisher,
                ...(recipe.key && {key: recipe.key})
            }
        })
    }
    catch(err){
        throw err; 
    }
}

export const getSearchResultsPage = function(page = state.search.page){
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end);
}

export const updateServings = function(newServings){
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = ing.quantity * newServings / state.recipe.servings;
    });

    state.recipe.servings = newServings;
}

const persistBookmarks = function(){
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function(recipe){
    state.bookmarks.push(recipe);
    
    if(state.recipe.id === recipe.id){
        state.recipe.bookmarked = true;
    }
    persistBookmarks();
}

export const deleteBookmark = function(id){
    const index = state.bookmarks.findIndex((bookmark) => bookmark.id === id);
    state.bookmarks.splice(index, 1);
    
    if(state.recipe.id === id){
        state.recipe.bookmarked = false;
    }
    persistBookmarks();
}

export const uploadRecipe = async function(newRecipe){
    try{
        const newRecipeArr = Object.entries(newRecipe);
        console.log(newRecipeArr);
        // {quantity, unit, description}

        const ingredients = newRecipeArr.filter(entry => entry[0].startsWith('ingredient') && entry[1] != '')
        .map(ing => {
            const ingArr = ing[1].replaceAll(' ', '').split(',');
            if(ingArr.length < 3) throw new Error('Incorrect ingredient format');
            const [quantity, unit, description] = ingArr;
            return {quantity : quantity ? +quantity : null, unit, description};
        })
        const recipe = {
            title: newRecipe.title,
            cooking_time: newRecipe.cookingTime,
            image_url: newRecipe.image,
            ingredients,
            publisher: newRecipe.publisher,
            servings: newRecipe.servings,
            source_url: newRecipe.sourceUrl
        }
        console.log(newRecipe)

        const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
        state.recipe = getRecipeObject(data);
        addBookmark(state.recipe);
    }
    catch(err){
        throw err;
    }
}

const init = function(){
    const storage = JSON.parse(localStorage.getItem('bookmarks'));
    if(!storage) return;
    state.bookmarks = storage;
}

init();