import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const AssignmentStatusChart = ({ 
  allAssignmentsCount, 
  pendingAssignmentsCount,
  submittedAssignmentsCount: propSubmittedCount
}) => {
  // Use provided submitted count or calculate from difference
  const submittedAssignmentsCount = propSubmittedCount !== undefined 
    ? propSubmittedCount 
    : (allAssignmentsCount - pendingAssignmentsCount);

  // Data for the chart
  const assignmentData = [
  {
    name: 'Submitted',
    value: submittedAssignmentsCount,
    color: '#10B981' // Emerald green
  },
  {
    name: 'Pending',
    value: pendingAssignmentsCount,
    color: '#3B82F6' // Blue
  }
];
  
  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Assignment Status Chart */}
      <div className="flex justify-center mb-6 relative">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assignmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {assignmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: 'var(--tooltip-text)',
                  zIndex: '10000'
                }}
                labelStyle={{
                  color: 'var(--tooltip-text)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center Total Count */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-900">
              {allAssignmentsCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Assignment Status Legend */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-700">
              Submitted
            </span>
          </div>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {submittedAssignmentsCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-700">
              Pending
            </span>
          </div>
          <span className="text-sm font-bold text-gray-600 dark:text-blue-400">
            {pendingAssignmentsCount}
          </span>
        </div>
      </div>

      {/* CSS Variables for Tooltip Styling */}
      <style>{`
        :root {
          --tooltip-bg: white;
          --tooltip-border: #e5e7eb;
          --tooltip-text: #374151;
        }

        .dark {
          --tooltip-bg: #374151;
          --tooltip-border: #4b5563;
          --tooltip-text: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default AssignmentStatusChart;