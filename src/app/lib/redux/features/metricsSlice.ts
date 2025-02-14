import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MetricsState {
  cpu: {
    used: number;
    total: number;
  };
  memory: {
    used: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: MetricsState = {
  cpu: {
    used: 0,
    total: 0
  },
  memory: {
    used: 0,
    total: 0
  },
  isLoading: false,
  error: null
}

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    setMetrics: (state, action: PayloadAction<{ cpu: MetricsState['cpu']; memory: MetricsState['memory'] }>) => {
      state.cpu = action.payload.cpu;
      state.memory = action.payload.memory;
    },
    setMetricsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setMetricsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
})

export const { setMetrics, setMetricsLoading, setMetricsError } = metricsSlice.actions
export const metricsReducer = metricsSlice.reducer
