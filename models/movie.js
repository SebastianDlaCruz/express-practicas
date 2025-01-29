import mysql from 'mysql2/promise';
import { requerid } from "../utils/custom-required.js";
const movies = requerid('../movies.json');

const config = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: 'sebastian654',
  database: 'movieDB'
}

const connection = await mysql.createConnection(config);

export class MovieModel {

  static async getAll({ genre, page, pageSize }) {

    if (genre) {

      const [genres] = await connection.query('SELECT id FROM gerens WHERE name = ?;', [genre]);

      if (!genres) {
        return [];
      }
      const { id } = genres[0];

      const [moviesGenres] = await connection.query('SELECT * FROM movie_genres WHERE  movie_genres.geren_id =?;', [id]);


      if (!Array.isArray(moviesGenres) || moviesGenres.length === 0) {
        return [];
      }


      const ids = moviesGenres.map(movie => movie.movie_id)

      const [moviesDB] = await connection.query('SELECT * FROM movies WHERE id IN (?);', [ids]);


      return {
        statusCode: 200,
        success: true,
        movies: moviesDB,
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

      const pageInt = parseInt(page.toString());
      const pageSizeInt = parseInt(pageSize.toString());
      const offset = (pageInt - 1) * pageSizeInt;

      const [result] = await connection.query('SELECT * FROM movies LIMIT ? OFFSET ? ; ', [pageSizeInt, offset]);

      const [totalItemsResult] = await connection.query('SELECT COUNT(*) as totalItems FROM movies;');

      const totalItems = totalItemsResult[0].totalItems;

      const totalPages = Math.ceil(totalItems / pageSizeInt);

      const next = (pageInt < totalPages) ? `/movies?page=${pageInt + 1}&pageSize=${pageSizeInt}` : null;
      const prev = (pageInt > 1) ? `/movies?page=${pageInt - 1}&pageSize=${pageSizeInt}` : null;

      return {
        statusCode: 200,
        success: true,
        movies: result,
        pagination: {
          currentPages: pageInt,
          itemsPerPages: pageSizeInt,
          totalItems: totalItems,
          totalPages: totalPages,
          next,
          prev

        }
      }

    }

    if (page && pageSize && genre) {

      const [genres] = await connection.query('SELECT id FROM gerens WHERE name = ?;', [genre]);

      if (!genres) {
        return {
          statusCode: 404,
          success: false,
          movies: [],
          pagination: null
        };
      }

      const { id } = genres[0];

      const [moviesGenres] = await connection.query('SELECT * FROM movie_genres WHERE  movie_genres.geren_id =?;', [id]);

      if (!Array.isArray(moviesGenres) || moviesGenres.length === 0) {
        return {
          statusCode: 404,
          success: false,
          movies: [],
          pagination: null
        };
      }

      const ids = moviesGenres.map(movie => movie.movie_id);

      const pageInt = parseInt(page.toString());
      const pageSizeInt = parseInt(pageSize.toString());
      const offset = (pageInt - 1) * pageSizeInt;


      const [moviesDB] = await connection.query('SELECT * FROM movies WHERE id IN (?) LIMIT ? OFFSET ?;', [ids, pageSizeInt, offset]);


      const [totalItemsResult] = await connection.query('SELECT COUNT(*) as totalItems FROM movies WHERE id IN (?);', [ids]);

      const totalItems = totalItemsResult[0].totalItems;
      const totalPages = Math.ceil(totalItems / pageSizeInt);

      const next = pageInt < totalPages ? `/movies?genre=${genre}&page=${pageInt + 1}&pageSize=${pageSizeInt}` : null;

      const prev = pageInt > 1 ? `/movies?genre=${genre}&page=${pageInt - 1}&pageSize=${pageSizeInt}` : null;

      return {
        statusCode: 200,
        success: true,
        movies: moviesDB,
        pagination: {
          currentPages: pageInt,
          itemsPerPages: pageSizeInt,
          totalItems: totalItems,
          totalPages: totalPages,
          next,
          prev

        }
      }

    }


    const [moviesDB] = await connection.query('SELECT BIN_TO_UUID(id), title,year,director,duration,poster, rate  FROM movies');

    return {
      statusCode: 200,
      success: true,
      movies: moviesDB,
      pagination: null
    }


  }


  static async getId(id) {

    const [movie] = await connection.query('SELECT title, year , director,duration,poster,rate,BIN_TO_UUID(id) id FROM movies WHERE id = UUID_TO_BIN(?);', [id]);

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
    const genre = movie.genre;

    // Obtener el ID del género
    const [genreIdResult] = await connection.query('SELECT id FROM gerens WHERE name = ?;', [genre]);

    if (!genreIdResult) {
      throw new Error('Genre not found');
    }

    const genreId = genreIdResult[0].id;
    delete movie.genre;

    console.log('movie', movie)
    // Insertar la película y obtener su ID
    const [result] = await connection.query('INSERT INTO movies SET ?', [movie]);

    const [movieIdResult] = await connection.query('SELECT id FROM movies WHERE title = ?;', [movie.title]);

    if (!movieIdResult) {
      throw new Error('Movie not found');
    }

    const movieId = movieIdResult[0].id;

    // Insertar en la tabla movie_genres
    await connection.query('INSERT INTO movie_genres (movie_id, geren_id) VALUES (?, ?);', [movieId, genreId]);

    return {
      statusCode: 200,
      success: true,
      movieId: { movieId, ...movie }
    };
  }



  static async update(id, data) {
    // Desestructurar datos
    const { title, director, year, duration, poster, rate, genre } = data;

    // Actualizar la tabla movies
    const [updateResult] = await connection.query(
      'UPDATE movies SET title = ?, director = ?, year = ?, duration = ?, poster = ?, rate = ? WHERE id = UUID_TO_BIN(?);',
      [title, director, year, duration, poster, rate, id]
    );

    // Si se proporciona un nuevo género, actualizar la tabla movie_genres
    if (genre) {
      // Obtener el ID del nuevo género
      const [genreIdResult] = await connection.query('SELECT id FROM genres WHERE name = ?;', [genre]);

      if (!genreIdResult) {
        throw new Error('Genre not found');
      }

      const genreId = genreIdResult[0].id;

      // Actualizar la tabla movie_genres
      await connection.query(
        'UPDATE movie_genres SET genre_id = ? WHERE movie_id = UUID_TO_BIN(?);',
        [genreId, id]
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Movie updated successfully'
    }
  }

  static async delete(id) {
    const [movieResult] = await connection.query('SELECT id FROM movies WHERE id = UUID_TO_BIN(?);', [id]);

    if (!movieResult) {
      return {
        statusCode: 400,
        success: false,
        message: 'Elemento no encontrado'
      };
    }

    // Eliminar de la tabla movie_genres primero para mantener la integridad referencial
    await connection.query('DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?);', [id]);

    // Eliminar de la tabla movies
    await connection.query('DELETE FROM movies WHERE id = UUID_TO_BIN(?);', [id]);

    return {
      statusCode: 204,
      success: true,
      message: 'Elemento eliminado'
    };

  }

}