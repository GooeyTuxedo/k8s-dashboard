import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ClusterState {
  nodes: any[]
  pods: any[]
  isLoading: boolean
  error: string | null
}

const initialState: ClusterState = {
  nodes: [],
  pods: [],
  isLoading: false,
  error: null,
}

export const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<any[]>) => {
      state.nodes = action.payload
    },
    setPods: (state, action: PayloadAction<any[]>) => {
      state.pods = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})