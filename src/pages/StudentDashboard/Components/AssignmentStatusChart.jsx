import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight } from "lucide-react";

const AssignmentStatusChart = ({ 
  allAssignmentsCount, 
  pendingAssignmentsCount, 
  setActiveSection 
}) => {
  // Calculate assignment data
  const submittedAssignmentsCount = allAssignmentsCount - pendingAssignmentsCount;

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
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {allAssignmentsCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Assignment Status Legend */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Submitted
            </span>
          </div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {submittedAssignmentsCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Pending
            </span>
          </div>
          <span className="text-sm font-bold text-gray-600 dark:text-blue-400">
            {pendingAssignmentsCount}
          </span>
        </div>
      </div>

      <button
        className="w-full mt-4 py-2 text-sm font-medium text-accent1 dark:text-blue-400 hover:text-accent1 dark:hover:text-blue-300 flex items-center justify-center border border-primary/30 dark:border-blue-400/30 rounded-lg hover:bg-accent2/10 dark:hover:bg-blue-400/10 transition-colors"
        onClick={() => setActiveSection("Assignment")}
      >
        View Assignments <ArrowRight className="ml-2 h-4 w-4" />
      </button>

      {/* CSS Variables for Tooltip Styling */}
      <style jsx>{`
        :global(:root) {
          --tooltip-bg: white;
          --tooltip-border: #e5e7eb;
          --tooltip-text: #374151;
        }
        
        :global(.dark) {
          --tooltip-bg: #374151;
          --tooltip-border: #4b5563;
          --tooltip-text: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default AssignmentStatusChart;