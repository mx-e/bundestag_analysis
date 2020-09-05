import React, { useEffect, useMemo, useReducer, useState } from "react";
import {
  Legend,
  VisControls,
  ElecPeriodSlider,
  MPFilters,
  OverlayControls,
  PerplexitySlider,
  VoteFilters,
} from "./data-controls";
import { requestElecPeriodData, errorDispatch } from "../middleware/requests";
import { TSNESolver } from "../components/tsne-solver/tsne-solver";
import { useWindowSize } from "../util/util";
import style from "./data.module.css";

const filterMPs = (mps, optsState) => {
  let out = {};
  Object.keys(mps)
    .filter((mp) => mps[mp].elecPeriod.includes(optsState.elecPeriod))
    .forEach((key) => {
      out[key] = mps[key];
    });
  return out;
};

const filterVotes = (votes, optsState) => {
  let out = {};
  Object.keys(votes)
    .filter((vote) => votes[vote].elecPeriod === optsState.elecPeriod)
    .forEach((key) => {
      out[key] = votes[key];
    });
  return out;
};

export const ComputationStates = Object.freeze({
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  RESET: "RESET",
  FINISHED: "FINISHED",
});
export const OptsActions = Object.freeze({
  PLAY_PRESSED: "PLAY_PRESSED",
  PAUSE_PRESSED: "PAUSE_PRESSED",
  RESET_PRESSED: "RESET_PRESSED",
  IS_FINISHED: "IS_FINISHED",
});
export const DisplayModes = Object.freeze({
  MPS: "MPS",
  VOTES: "VOTES",
});
export const Overlays = Object.freeze({
  MPS: {
    PARTY: "PARTY",
  },
  VOTES: {},
});

const DEFAULT_ITERATIONS = 1000;

const defaultFilters = { MPS: [], VOTES: [] };

const initialOpts = {
  computationState: ComputationStates.RUNNING,
  maxIter: DEFAULT_ITERATIONS,
  elecPeriod: 1,
  displayMode: DisplayModes.MPS,
  colorOverlay: Overlays.MPS.PARTY,
  filters: defaultFilters,
  tsne: {
    epsilon: 10,
    perplexity: 15,
    dim: 2,
  },
};

const optsReducer = (state, action) => {
  const [type, value] = action;
  console.log("OPTS_ACTION: " + type + (value ? ", " + value : ""));
  switch (type) {
    case OptsActions.PAUSE_PRESSED:
      return {
        ...state,
        computationState: ComputationStates.PAUSED,
      };
    case OptsActions.PLAY_PRESSED:
      return {
        ...state,
        computationState: ComputationStates.RUNNING,
        maxIter:
          state.computationState === ComputationStates.FINISHED
            ? state.maxIter + state.maxIter
            : state.maxIter,
      };
    case OptsActions.RESET_PRESSED:
      return {
        ...state,
        computationState: ComputationStates.RESET,
        maxIter: DEFAULT_ITERATIONS,
      };
    case OptsActions.IS_FINISHED:
      return {
        ...state,
        computationState: ComputationStates.FINISHED,
      };
    default:
      return state;
  }
};

export const DataView = (props) => {
  const { mps, votes } = props;
  const [optsState, optsDispatch] = useReducer(optsReducer, initialOpts);
  const [votingData, setData] = useState({});

  useEffect(
    () =>
      requestElecPeriodData(
        optsState.elecPeriod,
        votingData,
        setData,
        errorDispatch
      ),
    [optsState.elecPeriod]
  );

  const [windowWidth, windowHeight] = useWindowSize();
  const mainVisHeight = Math.max(windowHeight * 0.5, 500);
  const mainVisWidth = Math.max(windowWidth * 0.7, 420);
  const filteredMps = useMemo(() => filterMPs(mps, optsState), [
    optsState.elecPeriod,
    mps,
  ]);
  const filteredVotes = useMemo(() => filterVotes(votes, optsState), [
    optsState.elecPeriod,
    votes,
  ]);

  if (votingData[optsState.elecPeriod]) {
    return (
      <div className={style.dataViewWrap}>
        <header className={style.header}>
          <h1 className={style.title}>bunDestaG vOting behavioUr</h1>
          <h2 className={style.title}>an analysis</h2>
        </header>
        <div className={style.mainVis}>
          <TSNESolver
            dims={[mainVisWidth, mainVisHeight]}
            opts={optsState}
            optsDispatch={optsDispatch}
            data={[votingData, filteredMps, filteredVotes]}
          />
        </div>
        <div className={style.visControls}>
          <Legend />
          <VisControls
            computationState={optsState.computationState}
            optsDispatch={optsDispatch}
          />
          <OverlayControls />
        </div>
        <div className={style.dataControls}>
          <PerplexitySlider />
          <ElecPeriodSlider />
        </div>
        <div className={style.centeredSubHeading}>
          <h5>filter</h5>
        </div>
        <div className={style.filterControls}>
          <MPFilters />
          <VoteFilters />
        </div>
      </div>
    );
  } else {
    return <div>WAITING FOR DATA...</div>;
  }
};
