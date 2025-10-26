"use client";

import React, { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useGetDashboardMetricsQuery } from "@/state/api";

type Timeframe = "daily" | "weekly" | "monthly";

type SalesPoint = {
  date: string;        // ISO date
  totalValue: number;
  changePercentage?: number;
};

/** Same palette as Expense Summary legend */
const PALETTE = ["#22C55E", "#3B82F6", "#F59E0B"]; // green, blue, yellow

/** Monday as start-of-week */
function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 => Monday
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

export default function CardSalesSummary() {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();

  // Normalize incoming data (defensive for first render)
  const raw: SalesPoint[] = useMemo(() => {
    const src =
      (data?.salesSummary as
        | { date: string; totalValue: number; changePercentage?: number }[]
        | undefined) ?? [];
    return src.map(({ date, totalValue, changePercentage }) => ({
      date,
      totalValue,
      changePercentage,
    }));
  }, [data]);

  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");

  /** Aggregate by selected timeframe */
  const derived = useMemo(() => {
    if (!raw.length) return [] as { date: string; totalValue: number }[];

    const normalized = raw.map((r) => ({
      date: new Date(r.date),
      totalValue: Number(r.totalValue) || 0,
    }));

    if (timeframe === "daily") {
      return normalized
        .map((r) => ({ date: r.date.toISOString(), totalValue: r.totalValue }))
        .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    }

    const buckets = new Map<string, number>();
    for (const r of normalized) {
      let key: string;
      if (timeframe === "weekly") {
        const wk = startOfWeek(r.date);
        key = `W:${wk.getFullYear()}-${wk.getMonth() + 1}-${wk.getDate()}`;
      } else {
        // monthly
        key = `M:${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
      }
      buckets.set(key, (buckets.get(key) ?? 0) + r.totalValue);
    }

    const rows = Array.from(buckets.entries()).map(([k, v]) => {
      if (k.startsWith("W:")) {
        const [, y, m, d] = k.split(/[:\-]/);
        const label = new Date(Number(y), Number(m) - 1, Number(d)).toISOString();
        return { date: label, totalValue: v };
      }
      const [, y, m] = k.split(/[:\-]/);
      const label = new Date(Number(y), Number(m) - 1, 1).toISOString();
      return { date: label, totalValue: v };
    });

    return rows.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [raw, timeframe]);

  /** Header metrics */
  const totalValueSum = useMemo(
    () => derived.reduce((acc, r) => acc + r.totalValue, 0),
    [derived]
  );

  const averageChangePercentage = useMemo(() => {
    if (derived.length < 2) return 0;
    let sumPct = 0;
    let cnt = 0;
    for (let i = 1; i < derived.length; i++) {
      const prev = derived[i - 1].totalValue;
      const cur = derived[i].totalValue;
      if (prev > 0) {
        sumPct += ((cur - prev) / prev) * 100;
        cnt++;
      }
    }
    return cnt ? sumPct / cnt : 0;
  }, [derived]);

  const highest = useMemo(() => {
    if (!derived.length) return null;
    return derived.reduce((a, b) => (a.totalValue > b.totalValue ? a : b));
  }, [derived]);

  const highestValueDate = highest
    ? new Date(highest.date).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      })
    : "N/A";

  const unitLabel =
    timeframe === "daily" ? "days" : timeframe === "weekly" ? "weeks" : "months";

  const xTickFormatter = (value: string | number) => {
    const d = new Date(value);
    if (timeframe === "daily") return `${d.getMonth() + 1}/${d.getDate()}`;
    if (timeframe === "weekly") return `Wk of ${d.getMonth() + 1}/${d.getDate()}`;
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  if (isError) return <div className="m-5">Failed to fetch data</div>;

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">Sales Summary</h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="flex justify-between items-center mb-6 px-7 mt-5">
              <div className="text-lg font-medium">
                <p className="text-xs text-gray-400">Value</p>
                <span className="text-2xl font-extrabold">
                  $
                  {(totalValueSum / 1_000_000).toLocaleString("en", {
                    maximumFractionDigits: 2,
                  })}
                  m
                </span>
                <span
                  className={`${
                    averageChangePercentage >= 0 ? "text-green-500" : "text-red-500"
                  } text-sm ml-2`}
                >
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {averageChangePercentage.toFixed(2)}%
                </span>
              </div>

              <select
                className="shadow-sm border border-gray-300 bg-white p-2 rounded"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* CHART */}
            <ResponsiveContainer width="100%" height={350} className="px-7">
              <BarChart data={derived} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="" vertical={false} />
                <XAxis dataKey="date" tickFormatter={xTickFormatter} />
                <YAxis
                  tickFormatter={(v: number) => `$${(Number(v) / 1_000_000).toFixed(0)}m`}
                  tick={{ fontSize: 12, dx: -1 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: number | string) => [`$${Number(v).toLocaleString("en")}`]}
                  labelFormatter={(label: string | number) =>
                    new Date(label).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
                <Bar dataKey="totalValue" barSize={10} radius={[10, 10, 0, 0]}>
                  {derived.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* FOOTER */}
          <div>
            <hr />
            <div className="flex justify-between items-center mt-6 text-sm px-7 mb-4">
              <p>
                {derived.length || 0} {unitLabel}
              </p>
              <p className="text-sm">
                Highest Sales Date: <span className="font-bold">{highestValueDate}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
