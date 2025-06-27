import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

export interface MovieDetails extends Movie {
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
}

interface MoviesState {
  movies: Movie[];
  movieDetails: { [key: string]: MovieDetails };
  searchQuery: string;
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;
  totalResults: string;
  currentPage: number;
}

const initialState: MoviesState = {
  movies: [],
  movieDetails: {},
  searchQuery: '',
  loading: false,
  detailsLoading: false,
  error: null,
  totalResults: '0',
  currentPage: 1,
};

const API_KEY = 'e7d7338b'; 

export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async ({ query, page = 1 }: { query: string; page?: number }) => {
    if (!query.trim()) {
      return { Search: [], totalResults: '0', Response: 'True' };
    }
    
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Failed to search movies');
    }
    
    return data;
  }
);

export const fetchMovieDetails = createAsyncThunk(
  'movies/fetchMovieDetails',
  async (imdbID: string) => {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`
    );
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Failed to fetch movie details');
    }
    
    return data;
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearMovies: (state) => {
      state.movies = [];
      state.totalResults = '0';
      state.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search movies
      .addCase(searchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.Search || [];
        state.totalResults = action.payload.totalResults || '0';
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search movies';
        state.movies = [];
        state.totalResults = '0';
      })
      // Fetch movie details
      .addCase(fetchMovieDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.movieDetails[action.payload.imdbID] = action.payload;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.error.message || 'Failed to fetch movie details';
      });
  },
});

export const { setSearchQuery, clearMovies, clearError } = moviesSlice.actions;
export default moviesSlice.reducer;