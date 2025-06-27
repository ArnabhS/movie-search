import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RatingsState {
  ratings: { [movieId: string]: number };
}

const initialState: RatingsState = {
  ratings: {},
};

// Load ratings from localStorage on initialization
if (typeof window !== 'undefined') {
  try {
    const savedRatings = localStorage.getItem('movieRatings');
    if (savedRatings) {
      initialState.ratings = JSON.parse(savedRatings);
    }
  } catch (error) {
    console.error('Failed to load ratings from localStorage:', error);
  }
}

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    setRating: (state, action: PayloadAction<{ movieId: string; rating: number }>) => {
      const { movieId, rating } = action.payload;
      state.ratings[movieId] = rating;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('movieRatings', JSON.stringify(state.ratings));
        } catch (error) {
          console.error('Failed to save ratings to localStorage:', error);
        }
      }
    },
    removeRating: (state, action: PayloadAction<string>) => {
      delete state.ratings[action.payload];
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('movieRatings', JSON.stringify(state.ratings));
        } catch (error) {
          console.error('Failed to save ratings to localStorage:', error);
        }
      }
    },
  },
});

export const { setRating, removeRating } = ratingsSlice.actions;
export default ratingsSlice.reducer;