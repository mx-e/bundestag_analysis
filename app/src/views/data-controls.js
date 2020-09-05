import React from "react";
import Button from "../components/ui/button";
import { ComputationStates, OptsActions } from "./data";
import style from "./data-controls.module.css";

export const Legend = (props) => {
  return <h5>legend</h5>;
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
  return <h5>overlay</h5>;
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
