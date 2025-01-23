import express from 'express';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { corsMiddleware } from './middlewares/cors.js';
import { routerMovies } from './routes/movies.js';
import { validateMovie, validatePartial } from './validate-body.js';


const app = express();
const movies = JSON.parse(readFileSync('./movies.json', 'utf-8'))

app.use(express.json());
app.use(corsMiddleware());
app.use('/movies', routerMovies)


app.get('/movies/:id', (req, res) => {

  const { id } = req.params
  const movie = movies.find(movie => movie.id === id);

  if (movie) {
    res.status(200);
    res.json({
      statusCode: 200,
      status: true,
      message: 'exito',
      movie
    })
  }

  if (!movie) {

    res.status(404);
    res.json({
      statusCode: 404,
      status: false,
      message: 'recurso no encontrado',
      movie
    })
  }
});


app.post('/movies', (req, res) => {

  const result = validateMovie(req.body);

  if (result.error) {
    res.status(400);
    res.json({
      error: JSON.parse(result.error.message)
    })
    return;
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  };

  movies.push(newMovie);

  res.status(201);
  res.json({
    statusCode: 201,
    status: false,
    message: 'exito',
    movie: newMovie
  })

})


app.patch('/movies/:id', (req, res) => {

  const result = validatePartial(req.body);
  const { id } = req.params;

  const indexMovie = movies.findIndex(movie => movie.id === id);

  if (!result.success) {
    res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  if (indexMovie === -1) {
    res.status(400).json({
      error: 'Movie no encontrada'
    });

  }

  const movie = movies[indexMovie];

  const updateMovie = {
    ...movie,
    ...result.data
  }

  movies[indexMovie] = updateMovie;

  res.json({ updateMovie });

});

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;

  const indexMovie = movies.findIndex(movie => movie.id === id);

  movies.slice(indexMovie, 1);

  res.json({
    message: 'elemento borrado'
  })
})

/* app.options('/movies/:id', (req, res) => {

  const origin = req.header('origin');

  if (origin && ACCEPT_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200/');
    res.header('Access-Control-Allow-Methods', 'GET,DELETE ,UPDATE,PATCH,POST');
  }

  res.send(200);

}) */


const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
