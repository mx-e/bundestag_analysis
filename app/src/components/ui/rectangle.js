import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@blueprintjs/core";
import style from "./rectangle.module.css";

const shortenText = (text, chars) =>
  text.substring(0, Math.min(text.length, chars));

export const Rectangle = (props) => {
  const {
    height,
    width,
    bgColor,
    text,
    icon,
    iconColor,
    onClick,
    borderColor,
  } = props;
  const rectWidth = width ? width : 20;
  const rectHeight = height ? height : 20;
  const subTitleMargin = 5;

  const iconElem = icon ? (
    <div className={style.iconWrap}>
      <Icon
        color={iconColor}
        icon={icon}
        iconSize={Math.min(rectWidth, rectHeight) - 14}
      />
    </div>
  ) : (
    <div />
  );

  return (
    <div
      style={{
        border: borderColor ? "4px solid " + borderColor : "none",
        backgroundColor: bgColor,
        width: rectWidth,
        height: rectHeight,
        opacity: 0.8,
        cursor: onClick ? "pointer" : "default",
      }}
      className={style.rectWrap}
      onClick={onClick}
    >
      {iconElem}
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

Rectangle.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  bgColor: PropTypes.string.isRequired,
  text: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  onClick: PropTypes.func,
  borderColor: PropTypes.string,
};
