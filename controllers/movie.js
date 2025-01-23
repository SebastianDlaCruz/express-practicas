import { MovieModel } from "../models/movie.js";
import { validateMovie, validatePartial } from "../validate-body.js";

export class MovieController {
  static async getAll(req, res) {

    const { genre, page, pageSize } = req.query;

    const movies = await MovieModel.getAll({ genre, page, pageSize });

    res.status(movies.statusCode);
    res.json(movies)
  }

  static async getId(req, res) {

    const { id } = req.params;

    const movie = await MovieModel.getId(id);

    res.status(movie.statusCode);
    res.json(movie);

  }

  static async create(req, res) {
    const result = validateMovie(req.body);

    if (result.error) {
      res.status(400);
      res.json({
        error: JSON.parse(result.error.message)
      })
    }

    if (result.success) {

      const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
      };

      const response = await MovieModel.create(newMovie);

      res.status(response.statusCode).json(response)
    }
  }

  static async update(req, res) {

    const result = validatePartial(req.body);
    const { id } = req.params;


    if (result.error) {
      res.status(400).json({ error: JSON.parse(result.error.message) })
    }


    if (result.success) {
      const response = await MovieModel.update(id, result.data);

      res.status(response?.statusCode).json(response)
    }


  }

  static async delete(req, res) {
    const { id } = req.params;
    const result = await MovieModel.delete(id);
    res.status(result?.statusCode).json(result);
  }
}