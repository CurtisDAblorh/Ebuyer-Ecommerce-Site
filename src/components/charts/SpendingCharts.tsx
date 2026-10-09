"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DEPARTMENTS } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";
import type { MonthSpend, DepartmentSpend } from "@/lib/spending";

const M = { top: 12, right: 8, bottom: 28, left: 48 };
const colorOf = (dept: string) => DEPARTMENTS.find((d) => d.id === dept)?.accent ?? "#888";

/** Monthly spend stacked by department, with a hover tooltip per month. */
export function MonthlySpendChart({
  data,
  width = 640,
  height = 260,
}: {
  data: MonthSpend[];
  width?: number;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ month: MonthSpend; x: number } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const w = width - M.left - M.right;
    const h = height - M.top - M.bottom;
    const keys = DEPARTMENTS.map((d) => d.id);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, w])
      .padding(0.35);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total) || 1])
      .nice()
      .range([h, 0]);
    const stack = d3
      .stack<MonthSpend>()
      .keys(keys)
      .value((d, k) => d.byDepartment[k] ?? 0)(data);

    const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
    g.append("g")
      .attr("class", "text-[11px] opacity-60")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickFormat((v) => `£${d3.format("~s")(v as number)}`)
          .tickSize(-w),
      )
      .call((a) => a.select(".domain").remove())
      .call((a) => a.selectAll(".tick line").attr("stroke-opacity", 0.12));
    g.append("g")
      .attr("class", "text-[11px] opacity-60")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call((a) => a.select(".domain").attr("stroke-opacity", 0.2))
      .call((a) => a.selectAll(".tick line").remove());

    g.selectAll("g.layer")
      .data(stack)
      .join("g")
      .attr("class", "layer")
      .attr("fill", (s) => colorOf(s.key))
      .selectAll("rect")
      .data((s) => s)
      .join("rect")
      .attr("x", (d) => x(d.data.label)!)
      .attr("width", x.bandwidth())
      .attr("y", h)
      .attr("height", 0)
      .attr("rx", 3)
      .transition()
      .duration(800)
      .delay((_d, i) => i * 70)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => Math.max(0, y(d[0]) - y(d[1])));

    g.selectAll("rect.hit")
      .data(data)
      .join("rect")
      .attr("class", "hit")
      .attr("x", (d) => x(d.label)! - (x.step() * x.paddingInner()) / 2)
      .attr("width", x.step())
      .attr("height", h)
      .attr("fill", "transparent")
      .on("pointerenter", (_e, d) =>
        setHover({ month: d, x: ((M.left + x(d.label)! + x.bandwidth() / 2) / width) * 100 }),
      )
      .on("pointerleave", () => setHover(null));
  }, [data, width, height]);

  return (
    <Box sx={{ position: "relative", color: "text.primary" }}>
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Monthly spend by department"
        data-testid="monthly-spend"
      />
      {hover && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: `${hover.x}%`,
            transform: "translateX(-50%)",
            bgcolor: "text.primary",
            color: "background.paper",
            px: 1.5,
            py: 1,
            borderRadius: 2,
            pointerEvents: "none",
            minWidth: 140,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
            {hover.month.label} · {formatPrice(hover.month.total)}
          </Typography>
          {Object.entries(hover.month.byDepartment)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => (
              <Typography
                key={k}
                sx={{ fontSize: 12, display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <span
                  style={{ background: colorOf(k) }}
                  className="inline-block size-2 rounded-full"
                />
                {DEPARTMENTS.find((d) => d.id === k)?.label}: {formatPrice(v)}
              </Typography>
            ))}
        </Box>
      )}
    </Box>
  );
}

/** Spend share by department; hovering an arc updates the centre label. */
export function DepartmentDonut({ data, size = 240 }: { data: DepartmentSpend[]; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<DepartmentSpend | null>(null);
  const total = d3.sum(data, (d) => d.total);

  useEffect(() => {
    if (!ref.current) return;
    const r = size / 2;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${r},${r})`);
    const pie = d3
      .pie<DepartmentSpend>()
      .value((d) => d.total)
      .sort(null)
      .padAngle(0.025);
    const arc = d3
      .arc<d3.PieArcDatum<DepartmentSpend>>()
      .innerRadius(r * 0.64)
      .cornerRadius(6);

    g.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("fill", (d) => colorOf(d.data.department))
      .attr("tabindex", 0)
      .attr("aria-label", (d) => `${d.data.label}: ${formatPrice(d.data.total)}`)
      .on("pointerenter focus", function (_e, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc.outerRadius(r)(d) ?? "");
        setActive(d.data);
      })
      .on("pointerleave blur", function (_e, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc.outerRadius(r - 8)(d) ?? "");
        setActive(null);
      })
      .transition()
      .duration(900)
      .attrTween("d", (d) => {
        const i = d3.interpolate({ ...d, endAngle: d.startAngle }, d);
        return (t) => arc.outerRadius(r - 8)(i(t)) ?? "";
      });
  }, [data, size]);

  return (
    <Box sx={{ position: "relative", width: size, maxWidth: "100%", mx: "auto" }}>
      <svg
        ref={ref}
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full"
        role="group"
        aria-label="Spend by department"
        data-testid="department-donut"
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 22 }}>
            {formatPrice(active?.total ?? total)}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {active ? active.label : "Total spend"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
