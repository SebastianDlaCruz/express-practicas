const express = require('express');
const path = require('node:path');
const movies = require('./movies.json')
const app = express();
const crypto = require('node:crypto');
const { validateMovie, validatePartial } = require('./validate-body');
const cors = require('cors');

app.use(express.json());
app.use(cors());

const ACCEPT_ORIGINS = [
  'http://localhost:3000/',
  'http://localhost:4200/'

];

app.get('/movies', (req, res) => {

  /* const origin = req.header('origin');

  if (origin && ACCEPT_ORIGINS.includes(origin)) {

    res.header('Access-Control-Allow-Origin', 'http://localhost:4200/');
  } */


  const { genre, page, pageSize } = req.query;

  if (genre) {
    const filteredMovies = movies.filter(movie =>
      movie.genre.some(g => g.toLowerCase() === genre.toString().toLowerCase())
    );

    res.status(200);
    res.json({
      statusCode: 200,
      status: true,
      movieS: filteredMovies
    })

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

    res.status(200);
    res.json({
      statusCode: 200,
      status: true,
      movies: moviesPerPages,
      pagination: {
        currentPages: parsePage,
        totalItems: movies.length,
        totalPages: Math.ceil(movies.length / parsePageSize),
        next,
        pre
      }
    });
  }

  if ((!page && !pageSize) || !genre) {
    res.status(200);
    res.json({
      statusCode: 200,
      status: true,
      movies
    })
  }




});


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
