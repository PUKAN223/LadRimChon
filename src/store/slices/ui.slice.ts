import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  selectedCategory: string | null
  mobileMenuOpen: boolean
  searchQuery: string
}

const initialState: UIState = {
  selectedCategory: null,
  mobileMenuOpen: false,
  searchQuery: '',
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const { setSelectedCategory, setMobileMenuOpen, setSearchQuery } = uiSlice.actions

export default uiSlice.reducer
