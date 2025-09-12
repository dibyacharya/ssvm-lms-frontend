import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const WeeklyPlanTable = ({ course }) => {
  const columns = [
    {
      accessorKey: "weekNumber",
      header: "Week Number",
    },
    {
      accessorKey: "topics",
      header: "Topics",
      cell: ({ row }) => (
        <ul className="list-disc pl-5 space-y-1">
          {row.original.topics.map((topic, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {topic}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  const table = useReactTable({
    data: course.weeklyPlan,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-600">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Plan</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Course schedule and topics by week
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-200 dark:bg-gray-700">
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className="border border-gray-300 dark:border-gray-600 p-3 text-left font-semibold text-gray-800 dark:text-gray-200"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td 
                    key={cell.id} 
                    className="border border-gray-300 dark:border-gray-600 p-3 text-gray-900 dark:text-gray-100 align-top"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {course.weeklyPlan?.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center space-y-3">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No Weekly Plan Available</p>
            <p className="text-sm">The weekly plan for this course has not been set up yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanTable;