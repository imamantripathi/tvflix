"use strict";

import { api_key, fetchDataFromServer } from "./api.js";
import { createMovieCard } from "./movie-card.js";

export function search() {
  const searchWrapper = document.querySelector("[search-wrapper]");
  const searchField = document.querySelector("[search-field]");
  let numberOfRecommendationsValue = 5; // Default value, you can set it to whatever you need

  document.addEventListener('DOMContentLoaded', function () {
    const numberOfRecommendationsInput = document.querySelector('input[name="numberOfRecommendation"]');

    numberOfRecommendationsInput.addEventListener('input', function () {
      numberOfRecommendationsValue = numberOfRecommendationsInput.value;
      console.log('Number of Recommendations:', numberOfRecommendationsValue);
    });
  });

  const searchResultModal = document.createElement("div");
  searchResultModal.classList.add("search-modal");
  document.querySelector("main").appendChild(searchResultModal);

  let searchTimeout;

  searchField.addEventListener("input", function () {
    if (!searchField.value.trim()) {
      searchResultModal.classList.remove("active");
      searchWrapper.classList.remove("searching");
      clearTimeout(searchTimeout);
      return;
    }
    searchWrapper.classList.add("searching");
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(function () {
      fetchDataFromServer(
        `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${searchField.value}&page=1&include_adult=false`,
        function ({ results: movieList }) {
          searchWrapper.classList.remove("searching");
          searchResultModal.classList.add("active");
          searchResultModal.innerHTML = ""; // removing old search results

          searchResultModal.innerHTML = `
            <p class="label">Results for</p>

            <h1 class="heading">${searchField.value}</h1>

            <div class="movie-list">
                <div class="grid-list"></div>
            </div>
          `;

          // Displaying details of the searched movie
          if (movieList.length > 0) {
            const searchedMovie = movieList[0];
            const movieCard = createMovieCard(searchedMovie);
            searchResultModal
              .querySelector(".grid-list")
              .appendChild(movieCard);

            // Fetching and displaying user-specified number of similar movies
            fetchDataFromServer(
              `https://api.themoviedb.org/3/movie/${searchedMovie.id}/similar?api_key=${api_key}&page=1`,
              function ({ results: similarMovies }) {
                for (let i = 1; i < Math.min(numberOfRecommendationsValue, similarMovies.length); i++) {
                  const similarMovieCard = createMovieCard(similarMovies[i]);
                  searchResultModal
                    .querySelector(".grid-list")
                    .appendChild(similarMovieCard);
                }
              }
            );
          }
        }
      );
    }, 500);
  });
}
