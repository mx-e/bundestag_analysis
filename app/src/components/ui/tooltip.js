import React from "react";
import PropTypes from "prop-types";

import style from "./tooltip.module.css";
import { TextBox } from "./text-box";
import {
  inactiveColor,
  textColorDark,
  textColorLight,
} from "../../util/color-util";

export const Tooltip = (props) => {
  const { title, content, callToAction } = props;

  return (
    <div className={style.tooltipWrap}>
      <div className={style.tooltipTitle}>
        <TextBox
          text={title}
          flatBottom={true}
          color={textColorLight}
          maxWidth={400}
          lineBreak
        />
      </div>
      {content.map((property, i, arr) => (
        <div
          key={"prop" + i}
          className={style.propertyWrap}
          style={{
            borderTop: "3px solid " + textColorDark,
          }}
        >
          {property.title && (
            <div className={style.propertyTitle}>
              <TextBox
                text={property.title}
                flatTop={true}
                flatBottom={true}
                maxWidth={400}
              />
            </div>
          )}
          {property.texts.map((text, iVal, arrVal) => (
            <TextBox
              maxWidth={400}
              key={text + iVal + i}
              text={text}
              color={property.colors ? property.colors[iVal] : null}
              flatTop={true}
              flatBottom={
                !(
                  i + 1 === arr.length &&
                  iVal + 1 === arrVal.length &&
                  !callToAction
                )
              }
            />
          ))}
        </div>
      ))}
      {callToAction && (
        <TextBox text={callToAction} color={textColorDark} flatTop />
      )}
    </div>
  );
};

Tooltip.propTypes = {
  title: PropTypes.string,
  content: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array]))
  ).isRequired,
  callToAction: PropTypes.string,
};
