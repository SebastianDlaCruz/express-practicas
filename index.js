const express = require('express');
const path = require('node:path');
const movies = require('./movies.json')
const app = express();
const crypto = require('node:crypto');
const port = 3000;

app.use(express.json());

app.get('/movies', (req, res) => {

  const { genre } = req.query;

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

  res.status(200);
  res.json({
    statusCode: 200,
    status: true,
    movies
  })

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

  const {

    title,
    year,
    director,
    duration,
    poster,
    genre,
    rate
  } = req.body;

  const newMovie = {
    id: crypto.randomUUID(),
    title,
    year,
    director,
    duration,
    poster,
    genre,
    rate
  }

  movies.push(newMovie);

  res.status(201);
  res.json({
    statusCode: 201,
    status: false,
    message: 'exito',
    movie: newMovie

  })

})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
