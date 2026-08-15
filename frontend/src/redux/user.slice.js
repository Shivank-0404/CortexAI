import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userData:null,
  authChecked:false
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData:(state,action)=>{
        state.userData=action.payload
        state.authChecked=true
    }
  },
})

// Action creators are generated for each case reducer function
export const {setUserData} = userSlice.actions

export default userSlice.reducer