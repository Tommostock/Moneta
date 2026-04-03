"use client";

import { useId, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import type { TimeSeriesPoint } from "@/types";
import { formatRate } from "@/lib/format";
import { findHighLow } from "@/lib/rates";

interface RateChartProps {
  data: TimeSeriesPoint[];
}

// Custom label for high/low dots
function DotLabel({
  viewBox,
  value,
  color,
  position,
}: {
  viewBox?: { x: number; y: number };
  value: string;
  color: string;
  position: "above" | "below";
}) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  const yOffset = position === "above" ? -12 : 16;
  return (
    <text
      x={x}
      y={y + yOffset}
      textAnchor="middle"
      fill={color}
      fontFamily="var(--font-roboto-mono)"
      fontSize={9}
      fontWeight={500}
    >
      {value}
    </text>
  );
}

// Custom crosshair tooltip
function CrosshairTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const rate = payload[0].value;
  const d = new Date(label);
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  return (
    <div
      style={{
        backgroundColor: "var(--theme-bg-raised)",
        border: "1px solid var(--theme-border-subtle)",
        borderRadius: "4px",
        padding: "6px 10px",
        fontFamily: "var(--font-roboto-mono)",
        fontSize: "11px",
        color: "var(--theme-text-primary)",
        lineHeight: 1.4,
      }}
    >
      <div style={{ color: "#D4A843", fontWeight: 500 }}>
        {formatRate(rate)}
      </div>
      <div style={{ color: "var(--theme-text-secondary)", fontSize: "10px" }}>{dateStr}</div>
    </div>
  );
}

export default function RateChart({ data }: RateChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = useCallback((state: any) => {
    if (state?.activeTooltipIndex != null && typeof state.activeTooltipIndex === "number") {
      setActiveIndex(state.activeTooltipIndex);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  if (data.length < 2) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-[2px] w-3/4 bg-bg-raised animate-pulse rounded-full" />
      </div>
    );
  }

  const { high, low } = findHighLow(data);
  // Determine if high dot is in the top or bottom half of the chart to position label
  const rates = data.map((d) => d.rate);
  const mid = (Math.min(...rates) + Math.max(...rates)) / 2;

  const formatXAxis = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // Get active point date for the crosshair reference line
  const activeDate =
    activeIndex !== null && data[activeIndex]
      ? data[activeIndex].date
      : null;

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A843" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#D4A843" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{
              fill: "var(--theme-text-muted)",
              fontFamily: "var(--font-roboto-mono)",
              fontSize: 10,
            }}
            axisLine={{ stroke: "var(--theme-border-subtle)" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            orientation="right"
            tickFormatter={(v) => formatRate(v)}
            tick={{
              fill: "var(--theme-text-muted)",
              fontFamily: "var(--font-roboto-mono)",
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            width={65}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={<CrosshairTooltip />}
            cursor={{ stroke: "var(--theme-text-muted)", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          {/* Crosshair vertical line */}
          {activeDate && (
            <ReferenceLine
              x={activeDate}
              stroke="var(--theme-text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#D4A843"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{
              r: 4,
              fill: "#D4A843",
              stroke: "var(--theme-bg-primary)",
              strokeWidth: 2,
            }}
          />
          {/* High dot with label */}
          <ReferenceDot
            x={high.date}
            y={high.rate}
            r={4}
            fill="#6BBF6B"
            stroke="var(--theme-bg-primary)"
            strokeWidth={2}
          >
            <DotLabel
              value={formatRate(high.rate)}
              color="#6BBF6B"
              position={high.rate >= mid ? "above" : "below"}
            />
          </ReferenceDot>
          {/* Low dot with label */}
          <ReferenceDot
            x={low.date}
            y={low.rate}
            r={4}
            fill="#D45B5B"
            stroke="var(--theme-bg-primary)"
            strokeWidth={2}
          >
            <DotLabel
              value={formatRate(low.rate)}
              color="#D45B5B"
              position={low.rate <= mid ? "below" : "above"}
            />
          </ReferenceDot>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
