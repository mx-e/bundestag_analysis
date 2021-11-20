import React from "react";
import { Rectangle } from "./rectangle";
import PropTypes from "prop-types";
import style from "./filter.module.css";

export const Filter = (props) => {
  const {
    filter: { colorFunc, title, value },
    uniqueVals,
    isMirrored,
    onFilterChange,
    inactiveColor,
  } = props;

  const filterVal = Array.isArray(value) ? value : [value];

  return (
    <div
      className={style.filterWrap}
      style={{ flexDirection: isMirrored ? "row-reverse" : "row" }}
    >
      <div
        className={style.filterTitle}
        style={
          isMirrored
            ? { marginLeft: 20, marginRight: 40 }
            : { marginRight: 20, marginLeft: 40 }
        }
      >
        <h6>{title}</h6>
      </div>
      <div
        className={style.filterSwitches}
        style={{ flexDirection: isMirrored ? "row-reverse" : "row" }}
      >
        {uniqueVals.map((val) => (
          <Rectangle
            key={title + val}
            bgColor={filterVal.includes(val) ? colorFunc(val) : inactiveColor}
            borderColor={colorFunc(val)}
            onClick={() => onFilterChange(val)}
            height={35}
            width={35}
            text={val}
          />
        ))}
      </div>
    </div>
  );
};

Filter.propTypes = {
  filter: PropTypes.object.isRequired,
  uniqueVals: PropTypes.array.isRequired,
  isMirrored: PropTypes.bool,
  onFilterChange: PropTypes.func.isRequired,
  inactiveColor: PropTypes.string.isRequired,
};
