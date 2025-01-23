import { Router } from "express";
import { MovieController } from "../controllers/movie.js";
import { requerid } from "../utils/custom-required.js";

export const routerMovies = Router();
const movies = requerid('../movies.json');

routerMovies.get('/', MovieController.getAll);


routerMovies.get('/:id', MovieController.getId);

routerMovies.post('/', MovieController.create);

routerMovies.patch('/:id', MovieController.update);


routerMovies.delete('/:id', MovieController.delete)