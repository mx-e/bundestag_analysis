import React, { useEffect, useMemo, useRef } from "react";
import { scaleLinear, select } from "d3";
import { Fisheye } from "./fisheye";
import style from "./normalized-scatterplot.module.css";

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

const onMouseOverWhenDisabled = (ref) => {
  console.log("mouseover");
  select(ref.current).style("opacity", "1");
  setTimeout(() => select(ref.current).style("opacity", "0"), 5000);
};

const DEFAULT_RADIUS = 4;
const DEFAULT_STROKE = 2;
const FISHEYE_RADIUS = 140;
const FISHEYE_DISTORTION = 8;

const onMouseMoveWhenEnabled = (event, ref, dotPos, x, y) => {
  const [mouseX, mouseY] = [event.clientX, event.clientY];
  const { left, top } = ref.current.getBoundingClientRect();
  const mousePos = [mouseX - left, mouseY - top];
  const [mX, mY] = mousePos;
  const circles = select(ref.current).selectAll("circle").data(dotPos);
  const fisheye = Fisheye.circular()
    .radius(FISHEYE_RADIUS)
    .distortion(FISHEYE_DISTORTION);
  fisheye.focus([mX, mY]);
  circles
    .each((d) => {
      d.x = x(d[0]);
      d.y = y(d[1]);
      d.fisheye = fisheye(d);
    })
    .attr("cx", (d) => d.fisheye.x)
    .attr("cy", (d) => d.fisheye.y)
    .attr("r", (d) => DEFAULT_RADIUS * Math.sqrt(d.fisheye.z))
    .style("stroke-width", (d) => DEFAULT_STROKE * Math.sqrt(d.fisheye.z));
};

export const NormalizedScatterplot = (props) => {
  const {
    showPoints,
    data,
    overlayData,
    dims: [width, height],
    mouseOverEnabled,
    mouseOverDisabledMessage,
    magnificationEnabled,
  } = props;
  const normalizedData = normalize(data, 5);
  const x = useMemo(() => scaleLinear().domain([0, 1]).range([0, width]), [
    width,
  ]);
  const y = useMemo(() => scaleLinear().domain([0, 1]).range([0, height]), [
    height,
  ]);
  const circlesRef = useRef(null);
  const textRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const circles = select(circlesRef.current)
      .selectAll("circle")
      .data(normalizedData);

    let fillColor, borderColor;
    if (!showPoints) {
      fillColor = () => "rgba(0,0,0,0)";
      borderColor = () => "rgba(0,0,0,0)";
    } else if (Array.isArray(overlayData[0])) {
      fillColor = (d, i) => overlayData[i][0];
      borderColor = (d, i) =>
        overlayData[i][1] ? overlayData[i][1] : overlayData[i][0];
    } else {
      fillColor = (d, i) => overlayData[i];
      borderColor = (d, i) => overlayData[i];
    }

    circles
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]))
      .attr("r", DEFAULT_RADIUS)
      .attr("opacity", 0.85)
      .style("fill", fillColor)
      .style("stroke", borderColor)
      .style("stroke-width", DEFAULT_STROKE);

    circles
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]))
      .style("fill", fillColor)
      .style("stroke", borderColor);

    circles.exit().remove();
  }, [normalizedData, overlayData]);

  return (
    <div
      onMouseEnter={
        mouseOverEnabled ? null : () => onMouseOverWhenDisabled(textRef)
      }
      onMouseMove={
        mouseOverEnabled && magnificationEnabled
          ? (event) =>
              onMouseMoveWhenEnabled(event, svgRef, normalizedData, x, y)
          : null
      }
    >
      <svg width={width} height={height} ref={svgRef}>
        <g ref={circlesRef} />
      </svg>
      <h6 className={style.svgText} ref={textRef}>
        {mouseOverDisabledMessage}
      </h6>
    </div>
  );
};

export default NormalizedScatterplot;
