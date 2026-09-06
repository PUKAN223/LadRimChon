import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/domain/user/user.model'

interface SessionState {
  user: User | null
  isHydrated: boolean
}

const initialState: SessionState = {
  user: null,
  isHydrated: false,
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    setSessionHydrated: (state) => {
      state.isHydrated = true
    },
  },
})

export const { setUser, setSessionHydrated } = sessionSlice.actions

export default sessionSlice.reducer
