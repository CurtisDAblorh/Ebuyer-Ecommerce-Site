"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Row = { stars: number; count: number };

/** Horizontal rating distribution. Each bar is a button that filters reviews by star rating. */
export function RatingBars({
  data,
  selected,
  onSelect,
  width = 320,
}: {
  data: Row[];
  selected: number | null;
  onSelect: (stars: number | null) => void;
  width?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const rowH = 26;
  const height = data.length * rowH;

  useEffect(() => {
    if (!ref.current) return;
    const total = d3.sum(data, (d) => d.count) || 1;
    const labelW = 36;
    const countW = 34;
    const x = d3
      .scaleLinear()
      .domain([0, total])
      .range([0, width - labelW - countW]);
    const svg = d3.select(ref.current);

    const rows = svg
      .selectAll<SVGGElement, Row>("g.row")
      .data(data, (d) => d.stars)
      .join((enter) => {
        const g = enter
          .append("g")
          .attr("class", "row")
          .attr("role", "button")
          .attr("tabindex", 0)
          .style("cursor", "pointer");
        g.append("text")
          .attr("class", "label fill-current text-[12px] font-semibold")
          .attr("y", rowH / 2)
          .attr("dominant-baseline", "middle");
        g.append("rect")
          .attr("class", "track")
          .attr("x", labelW)
          .attr("y", rowH / 2 - 5)
          .attr("height", 10)
          .attr("rx", 5)
          .attr("fill", "currentColor")
          .attr("opacity", 0.1);
        g.append("rect")
          .attr("class", "bar")
          .attr("x", labelW)
          .attr("y", rowH / 2 - 5)
          .attr("height", 10)
          .attr("rx", 5)
          .attr("width", 0);
        g.append("text")
          .attr("class", "count fill-current text-[12px] opacity-70")
          .attr("y", rowH / 2)
          .attr("dominant-baseline", "middle")
          .attr("text-anchor", "end");
        return g;
      })
      .attr("transform", (_d, i) => `translate(0,${i * rowH})`)
      .attr(
        "aria-label",
        (d) =>
          `${d.stars} star reviews: ${d.count}. ${selected === d.stars ? "Selected" : "Filter"}`,
      )
      .attr("aria-pressed", (d) => String(selected === d.stars))
      .attr("data-testid", (d) => `rating-row-${d.stars}`)
      .on("click", (_e, d) => onSelect(selected === d.stars ? null : d.stars))
      .on("keydown", (e: KeyboardEvent, d) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(selected === d.stars ? null : d.stars);
        }
      });

    rows.select("text.label").text((d) => `${d.stars} ★`);
    rows.select("rect.track").attr("width", x.range()[1]);
    rows
      .select("rect.bar")
      .attr("fill", (d) =>
        selected && selected !== d.stars ? "currentColor" : "var(--mui-palette-secondary-main)",
      )
      .attr("opacity", (d) => (selected && selected !== d.stars ? 0.25 : 1))
      .transition()
      .duration(700)
      .delay((_d, i) => i * 60)
      .attr("width", (d) => x(d.count));
    rows
      .select("text.count")
      .attr("x", width)
      .text((d) => d.count);
  }, [data, selected, onSelect, width]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="group"
      aria-label="Rating breakdown"
    />
  );
}
