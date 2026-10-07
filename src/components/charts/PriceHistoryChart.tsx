"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatPrice } from "@/lib/pricing";
import type { PricePoint } from "@/lib/insights";

const M = { top: 16, right: 16, bottom: 28, left: 52 };

/** 90-day price line with gradient area, average line and a hover crosshair. */
export function PriceHistoryChart({
  data,
  width = 640,
  height = 240,
}: {
  data: PricePoint[];
  width?: number;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ point: PricePoint; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const w = width - M.left - M.right;
    const h = height - M.top - M.bottom;
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, w]);
    const [lo, hi] = d3.extent(data, (d) => d.price) as [number, number];
    const pad = (hi - lo) * 0.2 || hi * 0.1;
    const y = d3
      .scaleLinear()
      .domain([lo - pad, hi + pad])
      .nice()
      .range([h, 0]);

    const defs = svg.append("defs");
    const grad = defs
      .append("linearGradient")
      .attr("id", "ph-grad")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", 1);
    grad
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--mui-palette-secondary-main)")
      .attr("stop-opacity", 0.35);
    grad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--mui-palette-secondary-main)")
      .attr("stop-opacity", 0);

    const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

    g.append("g")
      .attr("class", "text-[11px] opacity-60")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickFormat((v) => `£${d3.format(",.0f")(v as number)}`)
          .tickSize(-w),
      )
      .call((a) => a.select(".domain").remove())
      .call((a) => a.selectAll(".tick line").attr("stroke-opacity", 0.15));
    g.append("g")
      .attr("class", "text-[11px] opacity-60")
      .attr("transform", `translate(0,${h})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => d3.timeFormat("%d %b")(d as Date))
          .tickSizeOuter(0),
      )
      .call((a) => a.select(".domain").attr("stroke-opacity", 0.2))
      .call((a) => a.selectAll(".tick line").remove());

    const area = d3
      .area<PricePoint>()
      .x((d) => x(d.date))
      .y0(h)
      .y1((d) => y(d.price))
      .curve(d3.curveMonotoneX);
    const line = d3
      .line<PricePoint>()
      .x((d) => x(d.date))
      .y((d) => y(d.price))
      .curve(d3.curveMonotoneX);

    g.append("path").datum(data).attr("fill", "url(#ph-grad)").attr("d", area);
    const path = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--mui-palette-secondary-main)")
      .attr("stroke-width", 2.5)
      .attr("d", line);
    const len = path.node()?.getTotalLength?.() ?? 0;
    if (len) {
      path
        .attr("stroke-dasharray", `${len} ${len}`)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    const avg = d3.mean(data, (d) => d.price) ?? 0;
    g.append("line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", y(avg))
      .attr("y2", y(avg))
      .attr("stroke", "currentColor")
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0.35);
    g.append("text")
      .attr("x", w)
      .attr("y", y(avg) - 6)
      .attr("text-anchor", "end")
      .attr("class", "fill-current text-[10px] opacity-60")
      .text(`avg ${formatPrice(avg)}`);

    const last = data[data.length - 1];
    g.append("circle")
      .attr("cx", x(last.date))
      .attr("cy", y(last.price))
      .attr("r", 5)
      .attr("fill", "var(--mui-palette-secondary-main)");

    const cross = g.append("g").style("display", "none");
    cross
      .append("line")
      .attr("y1", 0)
      .attr("y2", h)
      .attr("stroke", "currentColor")
      .attr("opacity", 0.3);
    cross
      .append("circle")
      .attr("r", 5)
      .attr("fill", "var(--mui-palette-background-paper)")
      .attr("stroke", "var(--mui-palette-secondary-main)")
      .attr("stroke-width", 2.5);

    const bisect = d3.bisector<PricePoint, Date>((d) => d.date).center;
    g.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "transparent")
      .on("pointermove", (event: PointerEvent) => {
        const [mx] = d3.pointer(event);
        const point = data[bisect(data, x.invert(mx))];
        const px = x(point.date);
        const py = y(point.price);
        cross.style("display", null);
        cross.select("line").attr("x1", px).attr("x2", px);
        cross.select("circle").attr("cx", px).attr("cy", py);
        setHover({ point, x: ((px + M.left) / width) * 100, y: ((py + M.top) / height) * 100 });
      })
      .on("pointerleave", () => {
        cross.style("display", "none");
        setHover(null);
      });
  }, [data, width, height]);

  return (
    <Box sx={{ position: "relative", color: "text.primary" }}>
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label="Price history over the last 90 days"
        data-testid="price-history"
      />
      {hover && (
        <Box
          sx={{
            position: "absolute",
            left: `${hover.x}%`,
            top: `${hover.y}%`,
            transform: "translate(-50%, calc(-100% - 12px))",
            bgcolor: "text.primary",
            color: "background.paper",
            px: 1.25,
            py: 0.5,
            borderRadius: 2,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
            {formatPrice(hover.point.price)}
          </Typography>
          <Typography sx={{ fontSize: 11, opacity: 0.8 }}>
            {d3.timeFormat("%a %d %b")(hover.point.date)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
