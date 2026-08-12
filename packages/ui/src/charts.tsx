"use client";
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND = "#7c3aed";
const PIE_COLORS = [
  "#7c3aed",
  "#64748b",
  "#a78bfa",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

function compact(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
function full(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export interface BarDatum {
  label: string;
  value: number;
}

export function BarChart({
  data,
  height = 260,
}: {
  data: BarDatum[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RBarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />
          <YAxis
            tickFormatter={compact}
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />
          <Tooltip
            formatter={(value: number) => full(value)}
            cursor={{ fill: "rgba(124,58,237,0.06)" }}
          />
          {/* Animation off: StrictMode's double mount can interrupt it and
              leave the bars stuck at zero height. */}
          <Bar
            dataKey="value"
            fill={BRAND}
            radius={[6, 6, 0, 0]}
            maxBarSize={64}
            isAnimationActive={false}
          />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface PieDatum {
  label: string;
  value: number;
}

export function DonutChart({
  data,
  height = 260,
}: {
  data: PieDatum[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => full(value)} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
