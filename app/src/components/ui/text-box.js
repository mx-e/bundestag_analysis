import React from "react";
import PropTypes from "prop-types";

import style from "./textbox.module.css";
import {
  isDark,
  neutralColor,
  textColorDark,
  textColorLight,
} from "../../util/color-util";

export const TextBox = (props) => {
  const { text, color, flatBottom, flatTop, maxWidth, lineBreak } = props;

  return (
    <div
      className={style.textBox}
      style={{
        backgroundColor: color ? color : neutralColor,
        color: isDark(color) ? textColorLight : textColorDark,
        borderRadius:
          (flatTop ? "0 0" : "2px 2px") + (flatBottom ? " 0 0" : " 2px 2px"),
        maxWidth: maxWidth ? maxWidth : "",
        whiteSpace: lineBreak ? "" : "nowrap",
      }}
    >
      <div className={style.text}>{text}</div>
    </div>
  );
};

TextBox.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  flatTop: PropTypes.bool,
  flatBottom: PropTypes.bool,
  maxWidth: PropTypes.number,
  lineBreak: PropTypes.bool,
};
