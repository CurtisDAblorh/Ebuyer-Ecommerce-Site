"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatPrice } from "@/lib/pricing";

type Props = {
  prices: number[];
  value: [number, number] | null;
  onChange: (range: [number, number] | null) => void;
  width?: number;
  height?: number;
};

const M = { top: 8, right: 14, bottom: 22, left: 10 };

/**
 * Price distribution with a draggable D3 brush. Bars inside the selection are
 * highlighted; dragging sets the shop's price filter, clicking clears it.
 */
export function PriceHistogram({ prices, value, onChange, width = 280, height = 120 }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const domain = useMemo<[number, number]>(() => {
    const max = d3.max(prices) ?? 100;
    return [1, Math.max(10, max * 1.15)];
  }, [prices]);

  // Draw bars + axis + brush whenever the data changes.
  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    const w = width - M.left - M.right;
    const h = height - M.top - M.bottom;
    // Prices span several orders of magnitude, so bin and draw on a log scale.
    const x = d3.scaleLog().domain(domain).range([0, w]).clamp(true);
    const thresholds = d3.range(0, 24).map((i) => x.invert((i / 24) * w));
    const bins = d3.bin().domain(domain).thresholds(thresholds)(
      prices.map((p) => Math.max(domain[0], p)),
    );
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (b) => b.length) || 1])
      .range([h, 0]);

    const g = svg
      .selectAll<SVGGElement, null>("g.plot")
      .data([null])
      .join("g")
      .attr("class", "plot")
      .attr("transform", `translate(${M.left},${M.top})`);

    g.selectAll<SVGRectElement, d3.Bin<number, number>>("rect.bar")
      .data(bins)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (b) => x(b.x0 ?? 0) + 1)
      .attr("width", (b) => Math.max(1, x(b.x1 ?? 0) - x(b.x0 ?? 0) - 2))
      .attr("rx", 2)
      .transition()
      .duration(400)
      .attr("y", (b) => y(b.length))
      .attr("height", (b) => h - y(b.length));

    g.selectAll<SVGGElement, null>("g.axis")
      .data([null])
      .join("g")
      .attr("class", "axis text-[10px]")
      .attr("transform", `translate(0,${h})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(d3.range(0, Math.floor(Math.log10(domain[1])) + 1).map((e) => 10 ** e))
          .tickFormat((v) => `£${d3.format("~s")(v as number)}`)
          .tickSizeOuter(0),
      )
      .call((a) => a.select(".domain").attr("stroke", "currentColor").attr("opacity", 0.2))
      .call((a) => a.selectAll("line").remove());

    const brush = d3
      .brushX<null>()
      .extent([
        [0, 0],
        [w, h],
      ])
      .on("brush", ({ selection }) => {
        const [a, b] = (selection as [number, number] | null) ?? [0, w];
        g.selectAll<SVGRectElement, d3.Bin<number, number>>("rect.bar").attr(
          "data-active",
          (bin) => (x(bin.x1 ?? 0) > a && x(bin.x0 ?? 0) < b ? "true" : "false"),
        );
      })
      .on("end", ({ selection, sourceEvent }) => {
        if (!sourceEvent) return; // programmatic move
        if (!selection) return onChange(null);
        const [a, b] = selection as [number, number];
        onChange([Math.floor(x.invert(a)), Math.ceil(x.invert(b))]);
      });

    const brushG = g
      .selectAll<SVGGElement, null>("g.brush")
      .data([null])
      .join("g")
      .attr("class", "brush");
    brushG.call(brush);
    brushG
      .select(".selection")
      .attr("fill", "currentColor")
      .attr("fill-opacity", 0.08)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.3)
      .attr("rx", 4);
    brushG
      .selectAll(".handle")
      .attr("fill", "currentColor")
      .attr("fill-opacity", 0.6)
      .attr("rx", 3);

    // Sync the brush with external state (e.g. "clear filters").
    if (value)
      brushG.call(brush.move, [x(Math.max(domain[0], value[0])), x(Math.min(domain[1], value[1]))]);
    else brushG.call(brush.move, null);
    g.selectAll<SVGRectElement, d3.Bin<number, number>>("rect.bar").attr("data-active", (bin) =>
      !value || ((bin.x1 ?? 0) > value[0] && (bin.x0 ?? 0) < value[1]) ? "true" : "false",
    );
  }, [prices, domain, value, onChange, width, height]);

  return (
    <Box sx={{ color: "text.primary" }}>
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full [&_.bar]:fill-current [&_.bar]:opacity-25 [&_.bar[data-active=true]]:opacity-90"
        role="img"
        aria-label="Price distribution. Drag to filter by price."
        data-testid="price-histogram"
      />
      <Typography variant="caption" sx={{ color: "text.secondary" }} aria-live="polite">
        {value
          ? `${formatPrice(value[0])} – ${formatPrice(value[1])}`
          : "Drag across the chart to set a price range"}
      </Typography>
    </Box>
  );
}
