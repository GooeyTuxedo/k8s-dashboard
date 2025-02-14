import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Node, Pod } from '@/app/types/kubernetes'

interface ClusterState {
  nodes: Node[];
  pods: Pod[];
  isLoading: boolean;
  error: string | null;
  clusterHealth: {
    status: 'Healthy' | 'Degraded' | 'Critical' | 'Unknown';
    lastUpdated: string | null;
  };
}

const initialState: ClusterState = {
  nodes: [],
  pods: [],
  isLoading: false,
  error: null,
  clusterHealth: {
    status: 'Unknown',
    lastUpdated: null,
  },
}

export const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    setPods: (state, action: PayloadAction<Pod[]>) => {
      state.pods = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setClusterHealth: (state, action: PayloadAction<{ status: ClusterState['clusterHealth']['status']; lastUpdated: string }>) => {
      state.clusterHealth = action.payload;
    },
  },
})

export const { setNodes, setPods, setLoading, setError, setClusterHealth } = clusterSlice.actions;
export const clusterReducer = clusterSlice.reducer;
