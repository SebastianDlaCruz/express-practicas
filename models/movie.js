import { requerid } from "../utils/custom-required.js";
const movies = requerid('../movies.json');

export class MovieModel {

  static async getAll({ genre, page, pageSize }) {

    if (genre) {
      const moviesAll = movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
      return {
        statusCode: 200,
        success: true,
        movies: moviesAll,
        pagination: {
          currentPages: null,
          totalItems: null,
          totalPages: null,
          next: null,
          pre: null

        }
      }
    }

    if (page && pageSize) {


      const parsePage = parseInt(page.toString());
      const parsePageSize = parseInt(pageSize.toString());

      const pageStart = (parsePage - 1) * parsePageSize;
      const pageEnd = pageStart + parsePageSize;

      const copieMovies = [...movies];
      const moviesPerPages = copieMovies.slice(pageStart, pageEnd);

      const next = (pageEnd < movies.length) ? `/movies?page=${parsePage + 1}&pageSize=${parsePageSize}` : null;

      const pre = (pageStart > 0) ? `/movies?page=${parsePage - 1}&pageSize=${parsePageSize}` : null;

      return {
        statusCode: 200,
        success: true,
        movies: moviesPerPages,
        pagination: {
          currentPages: parsePage,
          totalItems: movies.length,
          totalPages: Math.ceil(movies.length / parsePageSize),
          next,
          pre

        }
      }

    }


    if (page && pageSize && genre) {

      const moviesFilteredGenre = movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );

      const parsePage = parseInt(page.toString());
      const parsePageSize = parseInt(pageSize.toString());

      const pageStart = (parsePage - 1) * parsePageSize;
      const pageEnd = pageStart + parsePageSize;

      const copieMovies = [...moviesFilteredGenre];
      const moviesPerPages = copieMovies.slice(pageStart, pageEnd);

      const next = (pageEnd < movies.length) ? `/movies?genre${genre}&page=${parsePage + 1}&pageSize=${parsePageSize}` : null;

      const pre = (pageStart > 0) ? `/movies?genre${genre}&page=${parsePage - 1}&pageSize=${parsePageSize}` : null;

      return {
        statusCode: 200,
        success: true,
        movies: moviesPerPages,
        pagination: {
          currentPages: parsePage,
          totalItems: moviesPerPages.length,
          totalPages: Math.ceil(moviesPerPages.length / parsePageSize),
          next,
          pre

        }
      }

    }

    return {
      statusCode: 200,
      success: true,
      movies: movies,
      pagination: {
        currentPages: null,
        totalItems: null,
        totalPages: null,
        next: null,
        pre: null

      }
    }


  }


  static async getId(id) {

    const movie = movies.find(movie => movie.id === id);

    if (movie) {
      return {
        statusCode: 200,
        success: true,
        message: 'Exito',
        movie
      }
    }


    return {
      statusCode: 404,
      success: false,
      message: 'Recurso no encontrado',
      movie: null
    }


  }

  static async create(movie) {

    movies.push(movie);

    return {
      statusCode: 201,
      success: true,
      message: 'exito',
      movie
    }
  }


  static async update(id, data) {

    const indexMovie = movies.findIndex(movie => movie.id === id);

    if (indexMovie === -1) {

      return {
        statusCode: 400,
        success: false,
        error: 'Movie no encontrada'
      }
    }

    if (indexMovie > -1) {

      const movie = movies[indexMovie];
      const updateMovie = {
        ...movie,
        ...data
      }

      movies[indexMovie] = updateMovie;

      return {
        statusCode: 400,
        success: false,
        movies
      }
    }


  }

  static async delete(id) {
    const index = movies.findIndex(movie => movie.id === id);

    if (index > -1) {

      movies.slice(index, 1);

      return {
        statusCode: 204,
        message: 'Elemento eliminado'
      }

    }

    if (index === -1) {

      movies.slice(index, 1);

      return {
        statusCode: 400,
        message: 'Elemento no encontrado'
      }

    }


  }

}