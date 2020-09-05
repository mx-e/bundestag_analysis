import React from "react";
import style from "./rect.module.css";

const shortenText = (text, chars) =>
  text.substring(0, Math.min(text.length, chars));

export const Rectangle = (props) => {
  const { height, width, tooltip, bgColor, text } = props;
  const rectWidth = width ? width : 20;
  const rectHeight = height ? height : 20;
  const subTitleMargin = 5;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        width: rectWidth,
        height: rectHeight,
        opacity: 0.8,
      }}
      className={style.rectWrap}
    >
      {text && (
        <div
          style={{
            transform: "translate(0," + (rectHeight + subTitleMargin) + "px)",
          }}
          className={style.rectSubtitle}
        >
          {shortenText(text, 6)}
        </div>
      )}
    </div>
  );
};
