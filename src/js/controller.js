import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function(){
  try {
    const id = window.location.hash.slice(1);
    if(!id) return;
    await model.loadRecipes(id);
    recipeView.render(model.state.recipe);
  }
  catch(err){
    console.error(err)
    recipeView.renderError();
  }
};

const controlSearchRecipes = async function(){
  try{
    // 1) Get Search query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    //4) Render initial pagination
    paginationView.render(model.state.search);
  }
  catch(err){
    console.error(err);
  }
}

const controlPagination = function(goToPage){
  //1) Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2) Render new pagination
  paginationView.render(model.state.search);
}

const controlServings = function(newServings){
  //Update recipe servings (in state)
  model.updateServings(newServings);

  //Update recipe view
  recipeView.render(model.state.recipe);
}

const controlAddBookmark = function(){
  if(model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id);
  else model.addBookmark(model.state.recipe);
  bookmarkView.render(model.state.bookmarks);
  recipeView.render(model.state.recipe);
}

const controlBookmarks = function(){
  bookmarkView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  try{
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();
    bookmarkView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(()=>{
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  }
  catch(err){
    addRecipeView.renderError(err.message);
  }
}

const init = function(){
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchRecipes);
  paginationView.addHandlerClick(controlPagination);
  bookmarkView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();

