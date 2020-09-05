import React from "react";
import { Popover } from "@blueprintjs/core";
import style from "./rect.module.css";

export const Rect = (props) => {
  const {
    tooltip,
    color,
    dims: [width, height],
    text,
    onClick,
  } = props;
  const bgColor = color ? color : "#cfcfc2";
  const rectWidth = width ? width : 20;
  const rectHeight = height ? height : 20;

  const rect = (
    <div
      style={{ backgroundColor: bgColor, width: rectWidth, height: rectHeight }}
      className={style.rectWrap}
    />
  );

  if (tooltip) {
    return <Popover minimal={true}>{rect}</Popover>;
  } else {
    return rect;
  }
};
