import cors from 'cors';

const ACCEPT_ORIGINS = [
  'http://localhost:3000/',
  'http://localhost:4200/'

];

export const corsMiddleware = ({
  acceptOrigins = ACCEPT_ORIGINS
} = {}) => cors(
  {
    origin: (origin, callback) => {

      if (origin) {

        if (acceptOrigins.includes(origin)) {
          return callback(null, true);
        }
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error('Host allowed CORS'));
    }
  }
)