import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './features/movies/moviesSlice';
import ratingsReducer from './features/ratings/ratingSlice';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    ratings: ratingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;