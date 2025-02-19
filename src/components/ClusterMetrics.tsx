import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface MetricsProps {
  cpu: {
    used: number;
    total: number;
  };
  memory: {
    used: number;
    total: number;
  };
}

// Dark theme color palette
const CHART_COLORS = ['#3b82f6', '#10b981']; // Blue, Green
const DARK_THEME = {
  backgroundColor: '#1f2937', // dark-bg-secondary
  textColor: '#e5e7eb',      // dark-text-secondary
  axisColor: '#6b7280',      // dark-text-muted
  gridColor: '#374151',      // dark-border
};

const ClusterMetrics: React.FC<MetricsProps> = ({ cpu, memory }) => {
  // Calculate percentages
  const cpuPercentage = (cpu.used / cpu.total) * 100;
  const memoryPercentage = (memory.used / memory.total) * 100;

  // Prepare data for the pie charts
  const cpuData = [
    { name: 'Used', value: cpu.used },
    { name: 'Available', value: cpu.total - cpu.used }
  ];

  const memoryData = [
    { name: 'Used', value: memory.used },
    { name: 'Available', value: memory.total - memory.used }
  ];

  // Prepare data for the bar chart
  const resourceData = [
    {
      name: 'CPU',
      used: cpuPercentage,
      available: 100 - cpuPercentage
    },
    {
      name: 'Memory',
      used: memoryPercentage,
      available: 100 - memoryPercentage
    }
  ];

  // Custom tooltip styles
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-bg-tertiary p-2 border border-dark-border rounded shadow">
          <p className="text-dark-text-primary text-sm">{`${payload[0].name}: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts components with dark theme
  const darkThemeProps = {
    contentStyle: { backgroundColor: DARK_THEME.backgroundColor },
    itemStyle: { color: DARK_THEME.textColor },
    labelStyle: { color: DARK_THEME.textColor },

  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-medium text-dark-text-primary">Resource Usage Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={resourceData}
              layout="vertical"
              stackOffset="expand"
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.gridColor} />
              <XAxis 
                type="number" 
                unit="%" 
                stroke={DARK_THEME.axisColor}
                tick={{ fill: DARK_THEME.textColor }}
                tickFormatter={(x:string) => `${parseFloat(x) * 100}`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke={DARK_THEME.axisColor}
                tick={{ fill: DARK_THEME.textColor }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: number) => `${value.toFixed(1)}%`}
                {...darkThemeProps}
              />
              <Legend 
                wrapperStyle={{ color: DARK_THEME.textColor }}
                {...darkThemeProps}
              />
              <Bar dataKey="used" stackId="a" fill={CHART_COLORS[0]} name="Used" />
              <Bar dataKey="available" stackId="a" fill={CHART_COLORS[1]} name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-medium text-dark-text-primary">CPU Usage</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cpuData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cpuData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)} cores`}
                  itemStyle={{ color: DARK_THEME.textColor }}
                  contentStyle={{ backgroundColor: DARK_THEME.backgroundColor, borderColor: DARK_THEME.gridColor }}
                  labelStyle={{ color: DARK_THEME.textColor }}
                />
                <Legend 
                  wrapperStyle={{ color: DARK_THEME.textColor }}
                  formatter={(value, entry) => (
                    <span style={{ color: DARK_THEME.textColor }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-dark-text-tertiary">
              {cpu.used.toFixed(1)} / {cpu.total} cores used
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-lg font-medium text-dark-text-primary">Memory Usage</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {memoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${(value / 1024).toFixed(1)} GB`}
                  itemStyle={{ color: DARK_THEME.textColor }}
                  contentStyle={{ backgroundColor: DARK_THEME.backgroundColor, borderColor: DARK_THEME.gridColor }}
                  labelStyle={{ color: DARK_THEME.textColor }}
                />
                <Legend 
                  wrapperStyle={{ color: DARK_THEME.textColor }}
                  formatter={(value, entry) => (
                    <span style={{ color: DARK_THEME.textColor }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-dark-text-tertiary">
              {(memory.used / 1024).toFixed(1)} / {(memory.total / 1024).toFixed(1)} GB used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterMetrics;
