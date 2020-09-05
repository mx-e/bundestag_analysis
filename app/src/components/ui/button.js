import React from "react";
import { Icon } from "@blueprintjs/core";
import style from "./button.module.css";

export const Button = (props) => {
  const { color, icon, text, onClick } = props;
  return (
    <div className={style.buttonWrap} onClick={onClick}>
      {text && <h5>{text}</h5>}
      {icon && <Icon icon={icon} color={"#cfcfc2"} iconSize={"20"} />}{" "}
    </div>
  );
};

export default Button;
