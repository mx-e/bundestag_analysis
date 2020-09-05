import React, { useEffect, useMemo, useRef } from "react";
import { scaleLinear, select } from "d3";

const normalize = (X, margin) => {
  const x = X.map((i) => i[0]);
  const y = X.map((i) => i[1]);
  const maxX = Math.max(...x);
  const minX = Math.min(...x);
  const maxY = Math.max(...y);
  const minY = Math.min(...y);
  const xRange = maxX - minX + 2 * margin;
  const yRange = maxY - minY + 2 * margin;
  return X.map((i) => {
    const [x, y] = i;
    return [(x - minX + margin) / xRange, (y - minY + margin) / yRange];
  });
};

export const NormalizedScatterplot = (props) => {
  const {
    data,
    overlayData,
    dims: [width, height],
  } = props;
  const normalizedData = normalize(data, 5);
  const x = useMemo(() => scaleLinear().domain([0, 1]).range([0, width]), [
    width,
  ]);
  const y = useMemo(() => scaleLinear().domain([0, 1]).range([0, height]), [
    height,
  ]);
  const circlesRef = useRef(null);

  useEffect(() => {
    const circles = select(circlesRef.current)
      .selectAll("circle")
      .data(normalizedData);
    circles
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]))
      .attr("r", 3.5)
      .attr("opacity", 0.7)

      .style("fill", (d, i) => overlayData[i]);

    circles.attr("cx", (d) => x(d[0])).attr("cy", (d) => y(d[1]));
  }, [normalizedData]);

  return (
    <svg width={width} height={height}>
      <g ref={circlesRef}></g>
    </svg>
  );
};

export default NormalizedScatterplot;
