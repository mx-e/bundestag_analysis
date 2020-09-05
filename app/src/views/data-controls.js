import React from "react";
import Button from "../components/ui/button";
import { ComputationStates, OptsActions } from "./data";
import style from "./data-controls.module.css";
import { Rectangle } from "../components/ui/rectangle";

export const Legend = (props) => {
  const { colorOverlay, uniqueVals } = props;
  const width = Math.min(uniqueVals.length * 50, 400);
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
              text={val}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const VisControls = (props) => {
  const { computationState, optsDispatch } = props;
  const isRunning = computationState === ComputationStates.RUNNING;
  return (
    <div className={style.visControlsWrap}>
      <Button
        onClick={
          isRunning
            ? () => optsDispatch([OptsActions.PAUSE_PRESSED])
            : () => optsDispatch([OptsActions.PLAY_PRESSED])
        }
        icon={isRunning ? "pause" : "play"}
      />
      <Button
        onClick={() => optsDispatch([OptsActions.RESET_PRESSED])}
        icon={"stop"}
      />
    </div>
  );
};

export const OverlayControls = (props) => {
  return (
    <div className={style.overlayControlsWrap}>
      <h5>overlay</h5>
    </div>
  );
};

export const PerplexitySlider = (props) => {
  return <h5>perplexity slider</h5>;
};

export const ElecPeriodSlider = (props) => {
  return <h5>elec-period slider</h5>;
};

export const MPFilters = (props) => {
  return <h5>mps</h5>;
};

export const VoteFilters = (props) => {
  return <h5>votes</h5>;
};
