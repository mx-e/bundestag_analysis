import React, { useEffect, useState } from "react";
import { ComputationStates, DisplayModes, OptsActions } from "./data";
import { Rectangle } from "../components/ui/rectangle";
import { Overlays } from "./data";
import style from "./data-controls.module.css";
import {
  activeColor,
  backgroundColor,
  errorColor,
  inactiveColor,
  selectedColor,
  textColorDark,
  textColorLight,
} from "../util/color-util";
import { Slider } from "@blueprintjs/core";
import { Filter } from "../components/ui/filter";
import { elecPeriodMap } from "../util/util";

export const Legend = (props) => {
  const { colorOverlay, uniqueVals } = props;
  const tooManyValues = uniqueVals.length > 7;
  const width = Math.min(uniqueVals.length * 60, 410);
  const [selectedVal, setSelectedVal] = useState(uniqueVals[0]);

  useEffect(() => {
    if (!uniqueVals.includes(selectedVal)) {
      setSelectedVal(uniqueVals[0]);
    }
  }, [uniqueVals]);

  return (
    <div className={style.legendWrap}>
      <h5>legend</h5>
      {uniqueVals && (
        <div className={style.legendRow} style={{ width: width }}>
          {uniqueVals.map((val) => (
            <Rectangle
              width={35}
              height={35}
              key={val}
              bgColor={colorOverlay.colorFuncSingle(val)}
              text={tooManyValues ? null : val}
              borderColor={
                tooManyValues && selectedVal === val ? selectedColor : null
              }
              onClick={tooManyValues ? () => setSelectedVal(val) : null}
            />
          ))}
        </div>
      )}
      {tooManyValues && <h6>{selectedVal.toLowerCase()}</h6>}
    </div>
  );
};

export const VisControls = (props) => {
  const {
    displayMode,
    computationState,
    optsDispatch,
    magnificationEnabled,
  } = props;
  const isRunning = computationState === ComputationStates.RUNNING;
  return (
    <div className={style.visControlsWrap}>
      <div className={style.magnifierSwitch}>
        <Rectangle
          bgColor={magnificationEnabled ? activeColor : errorColor}
          icon={"zoom-in"}
          iconColor={textColorDark}
          width={40}
          height={40}
          onClick={() => optsDispatch([OptsActions.MAGNIFIER_SWITCHED])}
        />
      </div>
      <div className={style.pausePlayWrap}>
        <Rectangle
          onClick={
            isRunning
              ? () => optsDispatch([OptsActions.PAUSE_PRESSED])
              : () => optsDispatch([OptsActions.PLAY_PRESSED])
          }
          icon={isRunning ? "pause" : "play"}
          iconColor={textColorLight}
          width={40}
          height={40}
          bgColor={textColorDark}
        />
        <Rectangle
          bgColor={textColorDark}
          onClick={() => optsDispatch([OptsActions.RESET_PRESSED])}
          icon={"stop"}
          iconColor={textColorLight}
          width={40}
          height={40}
        />
      </div>
      <div className={style.pivotWrap}>
        <Rectangle
          bgColor={textColorDark}
          iconColor={textColorLight}
          width={40}
          height={40}
          icon={"pivot-table"}
          onClick={() => optsDispatch([OptsActions.DISPLAY_MODE_SWITCHED])}
        />
      </div>
      <div className={style.pivotStatus}>
        <h6 className={style.pivotStatusText}>1 dot</h6> <h6>=</h6>
        <h6 className={style.pivotStatusText}>
          1 {displayMode === DisplayModes.MPS ? "mp" : "vote"}
        </h6>
      </div>
    </div>
  );
};

export const OverlayControls = (props) => {
  const { displayMode, colorOverlay, optsDispatch } = props;
  const width = Math.min(Object.keys(Overlays[displayMode]).length * 60, 410);
  return (
    <div className={style.overlayControlsWrap}>
      <h5>overlay</h5>
      <div className={style.legendRow} style={{ width: width }}>
        {Object.values(Overlays[displayMode]).map((overlay) => (
          <div className={style.overlayElem} key={overlay.title}>
            <Rectangle
              width={35}
              height={35}
              bgColor={
                overlay.title === colorOverlay.title
                  ? selectedColor
                  : textColorDark
              }
              text={overlay.title}
              icon={overlay.icon}
              iconColor={
                overlay.title === colorOverlay.title
                  ? textColorDark
                  : textColorLight
              }
              onClick={() =>
                optsDispatch([OptsActions.OVERLAY_SELECTED, overlay.property])
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const PerplexitySlider = (props) => {
  const { perplexity, optsDispatch } = props;
  const [currentValue, setCurrentVal] = useState(perplexity);

  return (
    <div className={style.sliderWrap}>
      <h5>t-sne perplexity</h5>
      <Slider
        min={5}
        max={40}
        value={currentValue}
        labelRenderer={false}
        onChange={(newValue) => setCurrentVal(newValue)}
        onRelease={() =>
          perplexity !== currentValue
            ? optsDispatch([OptsActions.PERPLEXITY_CHANGED, currentValue])
            : null
        }
      />
      <h6>{currentValue}</h6>
    </div>
  );
};

export const ElecPeriodSlider = (props) => {
  const { elecPeriod, optsDispatch } = props;
  const [currentValue, setCurrentVal] = useState(elecPeriod);
  const labelGenerator = (value) => {
    const [from, to] = elecPeriodMap[value];
    return "of " + from + " to " + to;
  };
  return (
    <div className={style.sliderWrap}>
      <h5>bundestag</h5>
      <Slider
        min={1}
        max={17}
        value={currentValue}
        onChange={(newValue) => setCurrentVal(newValue)}
        labelRenderer={false}
        onRelease={() =>
          elecPeriod !== currentValue
            ? optsDispatch([OptsActions.ELEC_PERIOD_CHANGED, currentValue])
            : null
        }
      />
      <h6>{labelGenerator(currentValue)}</h6>
    </div>
  );
};

export const FiltersGroup = (props) => {
  const {
    uniqueFilterVals,
    groupName,
    filters,
    optsDispatch,
    isMirrored,
  } = props;
  return (
    <div className={style.filterGroupWrap}>
      <h5>{groupName.toLowerCase()}</h5>
      {filters.map((filter, i) => (
        <Filter
          key={groupName + filter.title}
          filter={filter}
          uniqueVals={uniqueFilterVals[filter.title]}
          inactiveColor={backgroundColor}
          onFilterChange={(val) =>
            optsDispatch([OptsActions.MP_FILTER_CHANGED, [filter, val]])
          }
          isMirrored={isMirrored}
        />
      ))}
    </div>
  );
};
