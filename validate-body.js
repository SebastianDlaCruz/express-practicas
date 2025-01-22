const z = require('zod');

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'el titulo tiene que ser una cadena de texto',
    required_error: 'el titulo de la película es requerido'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: 'poster es una url'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Crime', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']), {
    required_error: 'Movie genero es requerido',
    invalid_type_error: ' NO es del tipo de pelicula'
  }
  ),
  rate: z.number().min(0).max(10).default(0.5)
})

const validateMovie = (object) => {
  return movieSchema.safeParse(object);
}


const validatePartial = (object) => {
  return movieSchema.partial().safeParse(object);
}

module.exports = {
  validateMovie,
  validatePartial
}