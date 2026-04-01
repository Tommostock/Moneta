"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from "recharts";
import type { TimeSeriesPoint } from "@/types";
import { formatRate } from "@/lib/format";
import { findHighLow } from "@/lib/rates";

interface RateChartProps {
  data: TimeSeriesPoint[];
}

export default function RateChart({ data }: RateChartProps) {
  if (data.length < 2) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="h-[2px] w-3/4 bg-bg-raised animate-pulse rounded-full" />
      </div>
    );
  }

  const { high, low } = findHighLow(data);

  const formatXAxis = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A843" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#D4A843" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: "#4A4540", fontFamily: "var(--font-roboto-mono)", fontSize: 10 }}
            axisLine={{ stroke: "#2A2A2A" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            orientation="right"
            tickFormatter={(v) => formatRate(v)}
            tick={{ fill: "#4A4540", fontFamily: "var(--font-roboto-mono)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={65}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C1C",
              border: "1px solid #2A2A2A",
              borderRadius: "4px",
              fontFamily: "var(--font-roboto-mono)",
              fontSize: "12px",
              color: "#F0E6D3",
            }}
            labelFormatter={(label) => formatXAxis(String(label))}
            formatter={(value) => [formatRate(Number(value)), "Rate"]}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#D4A843"
            strokeWidth={2}
            fill="url(#chartFill)"
          />
          {/* High point */}
          <ReferenceDot
            x={high.date}
            y={high.rate}
            r={4}
            fill="#6BBF6B"
            stroke="none"
          />
          {/* Low point */}
          <ReferenceDot
            x={low.date}
            y={low.rate}
            r={4}
            fill="#D45B5B"
            stroke="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
