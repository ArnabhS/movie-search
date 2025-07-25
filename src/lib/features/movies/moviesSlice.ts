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
  searchFilters: {
    year?: string;
    type?: 'movie' | 'series' | 'episode';
  };
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
  searchFilters: {},
  loading: false,
  detailsLoading: false,
  error: null,
  totalResults: '0',
  currentPage: 1,
};

const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async ({ query, page = 1, year, type }: { 
    query: string; 
    page?: number; 
    year?: string; 
    type?: 'movie' | 'series' | 'episode';
  }) => {
    
    
    if (!query.trim() || query.trim().length < 2) {
      return { Search: [], totalResults: '0', Response: 'True' };
    }
    
    const params = new URLSearchParams({
      apikey: API_KEY,
      s: encodeURIComponent(query.trim()),
      page: page.toString(),
    });

    if (year) params.append('y', year);
    if (type) params.append('type', type);
    
    const url = `https://www.omdbapi.com/?${params}`;
    console.log('Search URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Search response:', data);
    
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
    setSearchFilters: (state, action: PayloadAction<{ year?: string; type?: 'movie' | 'series' | 'episode' }>) => {
      state.searchFilters = action.payload;
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

export const { setSearchQuery, setSearchFilters, clearMovies, clearError } = moviesSlice.actions;
export default moviesSlice.reducer;