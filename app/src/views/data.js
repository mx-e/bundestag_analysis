import React, { useEffect, useMemo, useReducer, useState } from "react";
import {
  Legend,
  VisControls,
  ElecPeriodSlider,
  MPFilters,
  OverlayControls,
  PerplexitySlider,
  VoteFilters,
  FiltersGroup,
} from "./data-controls";
import { requestElecPeriodData, errorDispatch } from "../middleware/requests";
import { TSNESolver } from "../components/tsne-solver/tsne-solver";
import { useWindowSize } from "../util/util";
import {
  ColorOverlay,
  Filter,
  filterObject,
  getUniqueVals,
  mapObject,
} from "./data-filters";
import style from "./data.module.css";
import {
  ageColorMap,
  genderColorMap,
  partyColorMap,
  passageColorMap,
  positionColorMap,
  subjectColorMap,
} from "../util/color-util";
import { Tooltip } from "../components/ui/tooltip";

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
  DISPLAY_MODE_SWITCHED: "DISPLAY_MODE_SWITCHED",
  NEW_DATA_ARRIVED: "NEW_DATA_ARRIVED",
  OVERLAY_SELECTED: "OVERLAY_SELECTED",
  ELEC_PERIOD_CHANGED: "ELEC_PERIOD_CHANGED",
  PERPLEXITY_CHANGED: "PERPLEXITY_CHANGED",
  MP_FILTER_CHANGED: "MP_FILTER_CHANGED",
  VOTES_FILTER_CHANGED: "VOTES_FILTER_CHANGED",
  MAGNIFIER_SWITCHED: "MAGNIFIER_SWITCHED",
});
export const DisplayModes = Object.freeze({
  MPS: "MPS",
  VOTES: "VOTES",
});
export const Overlays = Object.freeze({
  MPS: {
    party: ColorOverlay("party", "party", "heatmap"),
    govPos: ColorOverlay("position", "govPos", "badge"),
    gender: ColorOverlay("gender", "gender", "people"),
    age: ColorOverlay("age", "age", "time"),
  },
  VOTES: {
    sponsors: ColorOverlay("sponsors", "sponsors", "heatmap"),
    policy: ColorOverlay("subject", "policy", "box"),
    passage: ColorOverlay("passage", "passage", "tick-circle"),
  },
});

const DEFAULT_ITERATIONS = 2000;
const DEFAULT_ELEC_PERIOD = 2;
const DEFAULT_PERPLEXITY = 15;
const DEFAULT_DISPLAY_MODE = DisplayModes.MPS;
const DEFAULT_MP_OVERLAY = Overlays.MPS.party;
const DEFAULT_VOTES_OVERLAY = Overlays.VOTES.sponsors;

const defaultFilters = {
  ELEC_PERIOD: Filter("bundestag of:", "elecPeriod", DEFAULT_ELEC_PERIOD),
  MPS: [
    Filter("party", "party", Object.keys(partyColorMap)),
    Filter("position", "govPos", Object.keys(positionColorMap)),
    Filter("gender", "gender", Object.keys(genderColorMap)),
    Filter("age", "age", Object.keys(ageColorMap)),
  ],
  VOTES: [
    Filter("sponsors", "sponsors", Object.keys(partyColorMap)),
    Filter("subject", "policy", Object.keys(subjectColorMap)),
    Filter("passage", "passage", Object.keys(passageColorMap)),
  ],
};

const initialOpts = {
  votingData: {},
  computationState: ComputationStates.WAITING,
  maxIter: DEFAULT_ITERATIONS,
  displayMode: DEFAULT_DISPLAY_MODE,
  colorOverlay:
    DEFAULT_DISPLAY_MODE === DisplayModes.MPS
      ? DEFAULT_MP_OVERLAY
      : DEFAULT_VOTES_OVERLAY,
  filters: defaultFilters,
  magnificationEnabled: true,
  tsne: {
    epsilon: 10,
    perplexity: DEFAULT_PERPLEXITY,
    dim: 2,
  },
};

const optsReducer = (state, action) => {
  const [type, value] = action;
  console.log("OPTS_ACTION:", type, value);
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
    case OptsActions.MP_FILTER_CHANGED:
      const [mpFilter, mpChangedValue] = value;
      const mpNewValue = mpFilter.value.includes(mpChangedValue)
        ? mpFilter.value.filter((val) => val !== mpChangedValue)
        : mpFilter.value.concat([mpChangedValue]);
      const newMpFilters = [...state.filters.MPS];
      newMpFilters[
        newMpFilters.findIndex((fil) => fil.title === mpFilter.title)
      ] = Filter(mpFilter.title, mpFilter.property, mpNewValue);
      return {
        ...state,
        filters: {
          ...state.filters,
          MPS: newMpFilters,
        },
        computationState: ComputationStates.RESET,
      };
    case OptsActions.VOTES_FILTER_CHANGED:
      const [votesFilter, votesChangedValue] = value;
      const votesNewValue = votesFilter.value.includes(votesChangedValue)
        ? votesFilter.value.filter((val) => val !== votesChangedValue)
        : votesFilter.value.concat([votesChangedValue]);
      const newVoteFilters = [...state.filters.VOTES];
      newVoteFilters[
        newVoteFilters.findIndex((fil) => fil.title === votesFilter.title)
      ] = Filter(votesFilter.title, votesFilter.property, votesNewValue);
      return {
        ...state,
        filters: {
          ...state.filters,
          VOTES: newVoteFilters,
        },
        computationState: ComputationStates.RESET,
      };
    case OptsActions.DISPLAY_MODE_SWITCHED:
      return {
        ...state,
        displayMode:
          state.displayMode === DisplayModes.MPS
            ? DisplayModes.VOTES
            : DisplayModes.MPS,
        computationState: ComputationStates.RESET,
        colorOverlay:
          state.displayMode === DisplayModes.MPS
            ? DEFAULT_VOTES_OVERLAY
            : DEFAULT_MP_OVERLAY,
      };
    case OptsActions.MAGNIFIER_SWITCHED:
      return {
        ...state,
        magnificationEnabled: !state.magnificationEnabled,
      };

    default:
      return state;
  }
};

const collapseEntityToElecPeriod = (entity, elecPeriod) => {
  let out = {};
  Object.keys(entity).forEach((key) => {
    if (Array.isArray(entity[key]) || typeof entity[key] !== "object") {
      out[key] = entity[key];
    } else {
      out[key] = entity[key][elecPeriod];
    }
  });
  return out;
};

const applyElecPeriodFilters = (mps, votes, filter) => {
  return [
    filter.filterFunc(
      mapObject(mps, (entity) =>
        collapseEntityToElecPeriod(entity, filter.value)
      )
    ),
    filter.filterFunc(
      mapObject(votes, (entity) =>
        collapseEntityToElecPeriod(entity, filter.value)
      )
    ),
  ];
};

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
    : [overlay.colorFunc(votes), overlay.uniqueValFunc(votes)];

const getTooltipContent = (entity, displayMode) =>
  Object.values(Overlays[displayMode]).map((overlay) => {
    return Array.isArray(entity[overlay.property])
      ? {
          texts: entity[overlay.property],
          colors: entity[overlay.property].map(overlay.colorFuncSingle),
        }
      : {
          texts: [entity[overlay.property]],
          colors: [overlay.colorFuncSingle(entity[overlay.property])],
        };
  });

const computeTooltips = (displayMode, mps, votes) => {
  const callToAction = null; //"double click for more details";

  if (displayMode === DisplayModes.MPS) {
    console.log(mps);
    return Object.values(mps).map((mp) => (
      <Tooltip
        content={getTooltipContent(mp, displayMode)}
        callToAction={callToAction}
        title={mp.firstName + " " + mp.lastName}
      />
    ));
  } else {
    return Object.values(votes).map((vote) => (
      <Tooltip
        content={getTooltipContent(vote, displayMode)}
        callToAction={callToAction}
        title={vote.title}
      />
    ));
  }
};

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
    magnificationEnabled,
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
  const mainVisHeight = Math.max(windowHeight * 0.55, 500);
  const mainVisWidth = Math.max(windowWidth * 0.75, 420);
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

  const mouseOverTooltips = useMemo(
    () => computeTooltips(displayMode, filteredMPs, filteredVotes),
    [displayMode, filteredMPs, filteredVotes]
  );

  console.log(filteredMPs);

  return (
    <div className={style.dataViewWrap}>
      <header className={style.header}>
        <h1 className={style.title}>bunDestaG vOting behavioUr</h1>
        <h2 className={style.title}>an analysis</h2>
      </header>
      <div className={style.mainVis}>
        <TSNESolver
          displayMode={displayMode}
          dims={[mainVisWidth, mainVisHeight]}
          elecPeriod={elecPeriod}
          opts={optsState}
          optsDispatch={optsDispatch}
          data={[
            votingData,
            filteredMPs,
            filteredVotes,
            overlayColors,
            mouseOverTooltips,
          ]}
          magnificationEnabled={magnificationEnabled}
        />
      </div>
      <div className={style.visControls}>
        <Legend colorOverlay={colorOverlay} uniqueVals={overlayVals} />
        <VisControls
          magnificationEnabled={magnificationEnabled}
          displayMode={displayMode}
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
        <FiltersGroup
          uniqueFilterVals={uniqueFilterVals.MPS}
          filters={filters.MPS}
          groupName={DisplayModes.MPS}
          onFilterChange={(filter, val) =>
            optsDispatch([OptsActions.MP_FILTER_CHANGED, [filter, val]])
          }
          isMirrored={true}
        />
        <FiltersGroup
          uniqueFilterVals={uniqueFilterVals.VOTES}
          filters={filters.VOTES}
          groupName={DisplayModes.VOTES}
          onFilterChange={(filter, val) =>
            optsDispatch([OptsActions.VOTES_FILTER_CHANGED, [filter, val]])
          }
          isMirrored={false}
        />
      </div>
    </div>
  );
};
