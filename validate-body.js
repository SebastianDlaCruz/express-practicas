import { movieSchema } from "./schemas/movie.-schema.js";

export const validateMovie = (object) => {
  return movieSchema.safeParse(object);
}


export const validatePartial = (object) => {
  return movieSchema.partial().safeParse(object);
}