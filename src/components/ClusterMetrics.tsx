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

const COLORS = ['#0088FE', '#00C49F'];

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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium">Resource Usage Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={resourceData}
              layout="vertical"
              stackOffset="expand"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="%" tickFormatter={(x: number) => x * 100} />
              <YAxis type="category" dataKey="name" />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Bar dataKey="used" stackId="a" fill="#0088FE" name="Used" />
              <Bar dataKey="available" stackId="a" fill="#00C49F" name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium">CPU Usage</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)} cores`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {cpu.used.toFixed(1)} / {cpu.total} cores used
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium">Memory Usage</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${(value / 1024).toFixed(1)} GB`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {(memory.used / 1024).toFixed(1)} / {(memory.total / 1024).toFixed(1)} GB used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterMetrics;
