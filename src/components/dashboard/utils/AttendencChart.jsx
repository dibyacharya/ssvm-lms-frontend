import { PieChart, Pie, Cell, Legend, Tooltip, Label } from "recharts";

const AttendanceDonutChart = ({ presentValue, absentValue }) => {
  // Light color theme
  const data = [
    { name: "Present", value: Number(presentValue), color: "#A7E3A1" }, // Light Green
    { name: "Absent", value: absentValue, color: "#F4A6A6" }, // Light Red
  ];

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        startAngle={180} // Adjusting start position
        endAngle={-180} // Ends at the top-left
        innerRadius={60} // Donut shape
        outerRadius={100}
        paddingAngle={2} // Adds spacing
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
        {/* Center Label */}
        <Label
          value={`${data[0].value}%`}
          position="center"
          fill="green"
          fontSize={20}
          fontWeight="bold"
        />
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default AttendanceDonutChart;
