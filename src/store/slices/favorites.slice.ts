import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const FAVORITES_STORAGE_KEY = "ladrimchon_favorites_v1";

interface FavoritesState {
  shopIds: string[];
  productIds: string[];
}

const loadInitialFavorites = (): FavoritesState => {
  if (typeof window === "undefined") return { shopIds: [], productIds: [] };
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        shopIds: Array.isArray(parsed.shopIds) ? parsed.shopIds : [],
        productIds: Array.isArray(parsed.productIds) ? parsed.productIds : [],
      };
    }
  } catch {
    // Ignore storage parse errors
  }
  return { shopIds: [], productIds: [] };
};

const initialState: FavoritesState = loadInitialFavorites();

const saveToStorage = (state: FavoritesState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage write errors
  }
};

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavoriteShop: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.shopIds.includes(id)) {
        state.shopIds = state.shopIds.filter((item) => item !== id);
      } else {
        state.shopIds.push(id);
      }
      saveToStorage(state);
    },
    toggleFavoriteProduct: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.productIds.includes(id)) {
        state.productIds = state.productIds.filter((item) => item !== id);
      } else {
        state.productIds.push(id);
      }
      saveToStorage(state);
    },
    syncFavoritesFromStorage: (state) => {
      const loaded = loadInitialFavorites();
      state.shopIds = loaded.shopIds;
      state.productIds = loaded.productIds;
    },
  },
});

export const {
  toggleFavoriteShop,
  toggleFavoriteProduct,
  syncFavoritesFromStorage,
} = favoritesSlice.actions;

export const selectFavoriteShopIds = (state: { favorites: FavoritesState }) =>
  state.favorites.shopIds;
export const selectFavoriteProductIds = (
  state: { favorites: FavoritesState },
) => state.favorites.productIds;
export const selectIsShopFavorite =
  (shopId: string) => (state: { favorites: FavoritesState }) =>
    state.favorites.shopIds.includes(shopId);
export const selectIsProductFavorite =
  (productId: string) => (state: { favorites: FavoritesState }) =>
    state.favorites.productIds.includes(productId);

export default favoritesSlice.reducer;
