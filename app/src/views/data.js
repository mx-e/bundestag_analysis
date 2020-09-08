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
import { ColorOverlay, Filter } from "./data-filters";
import style from "./data.module.css";

export const ComputationStates = Object.freeze({
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  RESET: "RESET",
  FINISHED: "FINISHED",
  WAITING: "WAITING",
});
export const OptsActions = Object.freeze({
  PLAY_PRESSED: "PLAY_PRESSED",
  PAUSE_PRESSED: "PAUSE_PRESSED",
  RESET_PRESSED: "RESET_PRESSED",
  IS_FINISHED: "IS_FINISHED",
  NEW_DATA_ARRIVED: "NEW_DATA_ARRIVED",
  OVERLAY_SELECTED: "OVERLAY_SELECTED",
  ELEC_PERIOD_CHANGED: "ELEC_PERIOD_CHANGED",
  PERPLEXITY_CHANGED: "PERPLEXITY_CHANGED",
});
export const DisplayModes = Object.freeze({
  MPS: "MPS",
  VOTES: "VOTES",
});
export const Overlays = Object.freeze({
  MPS: {
    party: ColorOverlay("party", "party", "heatmap"),
    gender: ColorOverlay("gender", "gender", "people"),
  },
  VOTES: {},
});

const DEFAULT_ITERATIONS = 1000;
const DEFAULT_ELEC_PERIOD = 8;
const DEFAULT_MP_OVERLAY = Overlays.MPS.party;

const defaultFilters = {
  ELEC_PERIOD: Filter("bundestag of:", "elecPeriod", DEFAULT_ELEC_PERIOD),
  MPS: [],
  VOTES: [],
};

const initialOpts = {
  votingData: {},
  computationState: ComputationStates.WAITING,
  maxIter: DEFAULT_ITERATIONS,
  displayMode: DisplayModes.MPS,
  colorOverlay: DEFAULT_MP_OVERLAY,
  filters: defaultFilters,
  tsne: {
    epsilon: 10,
    perplexity: 20,
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
    case OptsActions.OVERLAY_SELECTED:
      return { ...state, colorOverlay: Overlays[state.displayMode][value] };
    case OptsActions.ELEC_PERIOD_CHANGED:
      return {
        ...state,
        filters: {
          ...state.filters,
          ELEC_PERIOD: Filter(
            state.filters.ELEC_PERIOD.title,
            state.filters.ELEC_PERIOD.property,
            value
          ),
        },
        computationState: state.votingData[value]
          ? ComputationStates.RESET
          : ComputationStates.WAITING,
        maxIter: DEFAULT_ITERATIONS,
      };
    case OptsActions.PERPLEXITY_CHANGED:
      return {
        ...state,
        computationState: ComputationStates.RESET,
        tsne: { ...state.tsne, perplexity: value },
      };
    case OptsActions.NEW_DATA_ARRIVED:
      let newData = { ...state.votingData };
      newData[state.filters.ELEC_PERIOD.value] = value;
      return {
        ...state,
        computationState: ComputationStates.RESET,
        votingData: newData,
      };

    default:
      return state;
  }
};

const applyElecPeriodFilters = (mps, votes, filter) => [
  filter.filterFunc(mps),
  filter.filterFunc(votes),
];

const applyOtherFilters = (mps, votes, filters) => {
  let filteredMPs = { ...mps };
  let filteredVotes = { ...votes };
  const uniqueVals = { MPS: {}, VOTES: {} };
  filters.MPS.forEach((filter) => {
    const { filterFunc, title, uniqueValFunc } = filter;
    filteredMPs = filterFunc(filteredMPs);
    uniqueVals.MPS[title] = uniqueValFunc(mps);
  });
  filters.VOTES.forEach((filter) => {
    const { filterFunc, title, uniqueValFunc } = filter;
    filteredVotes = filterFunc(filteredVotes);
    uniqueVals.VOTES[title] = uniqueValFunc(votes);
  });
  return [filteredMPs, filteredVotes, uniqueVals];
};

const computeOverlayData = (displayMode, overlay, mps, votes) =>
  displayMode === DisplayModes.MPS
    ? [overlay.colorFunc(mps), overlay.uniqueValFunc(mps)]
    : [overlay.colorFunc(mps), overlay.uniqueValFunc(votes)];

//MAIN
export const DataView = (props) => {
  const { mps, votes } = props;
  const [optsState, optsDispatch] = useReducer(optsReducer, initialOpts);

  const {
    votingData,
    displayMode,
    computationState,
    filters,
    colorOverlay,
    tsne,
  } = optsState;
  const elecPeriod = filters.ELEC_PERIOD.value;
  useEffect(() => {
    if (!votingData[elecPeriod]) {
      requestElecPeriodData(
        elecPeriod,
        (data) => optsDispatch([OptsActions.NEW_DATA_ARRIVED, data]),
        errorDispatch
      );
    }
  }, [elecPeriod]);

  const [windowWidth, windowHeight] = useWindowSize();
  const mainVisHeight = Math.max(windowHeight * 0.5, 500);
  const mainVisWidth = Math.max(windowWidth * 0.7, 420);
  const [elecPeriodMPs, elecPeriodVotes] = useMemo(
    () => applyElecPeriodFilters(mps, votes, filters.ELEC_PERIOD),
    [filters.ELEC_PERIOD.value]
  );
  const [filteredMPs, filteredVotes, uniqueFilterVals] = useMemo(
    () => applyOtherFilters(elecPeriodMPs, elecPeriodVotes, filters),
    [elecPeriodMPs, elecPeriodVotes, ...filters.MPS, ...filters.VOTES]
  );

  const [overlayColors, overlayVals] = useMemo(
    () =>
      computeOverlayData(displayMode, colorOverlay, filteredMPs, filteredVotes),
    [displayMode, colorOverlay, filteredMPs, filteredVotes]
  );

  return (
    <div className={style.dataViewWrap}>
      <header className={style.header}>
        <h1 className={style.title}>bunDestaG vOting behavioUr</h1>
        <h2 className={style.title}>an analysis</h2>
      </header>
      <div className={style.mainVis}>
        <TSNESolver
          dims={[mainVisWidth, mainVisHeight]}
          elecPeriod={elecPeriod}
          opts={optsState}
          optsDispatch={optsDispatch}
          data={[votingData, filteredMPs, filteredVotes, overlayColors]}
        />
      </div>
      <div className={style.visControls}>
        <Legend colorOverlay={colorOverlay} uniqueVals={overlayVals} />
        <VisControls
          computationState={computationState}
          optsDispatch={optsDispatch}
        />
        <OverlayControls
          displayMode={displayMode}
          colorOverlay={colorOverlay}
          optsDispatch={optsDispatch}
        />
      </div>
      <div className={style.dataControls}>
        <PerplexitySlider
          perplexity={tsne.perplexity}
          optsDispatch={optsDispatch}
        />
        <ElecPeriodSlider elecPeriod={elecPeriod} optsDispatch={optsDispatch} />
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
};
