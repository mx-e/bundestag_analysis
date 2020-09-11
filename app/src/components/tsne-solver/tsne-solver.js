import React, { useEffect, useMemo, useReducer, useState } from "react";
import { tsnejs } from "./tsne";
import { NormalizedScatterplot } from "./normalized-scatterplot";
import { ComputationStates, DisplayModes, OptsActions } from "../../views/data";

const SolverActions = Object.freeze({
  COMPUTATION_RESET: "COMPUTATION_RESET",
  STEP_TIMEOUT_FIRED: "STEP_TIMEOUT_FIRED",
});

const initialSolverState = {
  tsneInstance: null,
  step: 0,
  displayData: [],
};

const tsneSolverReducer = (state, action) => {
  const [type, value] = action;
  switch (type) {
    case SolverActions.COMPUTATION_RESET:
      const [
        [votingData, mpData, votesData],
        tsneOpts,
        elecPeriod,
        displayMode,
      ] = value;
      const newInstance = new tsnejs.tSNE(tsneOpts);
      const tsneData = computeTsneMatrix(
        mpData,
        votesData,
        votingData,
        elecPeriod,
        displayMode
      );
      let displayData = [];
      if (tsneData[0]) {
        newInstance.initDataRaw(tsneData);
        newInstance.step();
        displayData = newInstance.getSolution();
      }
      return {
        ...state,
        tsneInstance: newInstance,
        step: 1,
        displayData: displayData,
      };
    case SolverActions.STEP_TIMEOUT_FIRED:
      return {
        ...state,
        displayData: state.tsneInstance.getSolution(),
        step: state.step + 1,
      };

    default:
      return state;
  }
};

const votingBehaviourToCoords = (mp, vote, votingData, elecPeriod) => {
  const hasCastVote = votingData[elecPeriod].mps[mp].find(
    (vb) => vb[0] + "" === vote
  );
  return hasCastVote ? hasCastVote[1] : 0;
};

const computeTsneMatrix = (mps, votes, votingData, elecPeriod, displayMode) => {
  if (
    !votingData[elecPeriod] ||
    Object.keys(mps).length === 0 ||
    Object.keys(votes).length === 0
  )
    return [];
  else if (displayMode === DisplayModes.MPS) {
    return Object.keys(mps).map((mp) =>
      Object.keys(votes).map((vote) =>
        votingBehaviourToCoords(mp, vote, votingData, elecPeriod)
      )
    );
  } else {
    return Object.keys(votes).map((vote) =>
      Object.keys(mps).map((mp) =>
        votingBehaviourToCoords(mp, vote, votingData, elecPeriod)
      )
    );
  }
};

export const TSNESolver = (props) => {
  const {
    displayMode,
    dims,
    elecPeriod,
    opts: { computationState, tsne, maxIter },
    optsDispatch,
    magnificationEnabled,
    data,
    data: [, , , overlayData],
  } = props;
  const [tsneSolverState, tsneSolverDispatch] = useReducer(
    tsneSolverReducer,
    initialSolverState
  );
  const { tsneInstance, step, displayData } = tsneSolverState;

  useEffect(() => {
    if (computationState === ComputationStates.RESET) {
      tsneSolverDispatch([
        SolverActions.COMPUTATION_RESET,
        [data, tsne, elecPeriod, displayMode],
      ]);
      optsDispatch([OptsActions.PLAY_PRESSED]);
    }
  }, [computationState]);

  useEffect(() => {
    if (
      step < maxIter &&
      tsneInstance &&
      computationState === ComputationStates.RUNNING
    ) {
      const timer = setTimeout(() => {
        tsneInstance.step();
        tsneSolverDispatch([SolverActions.STEP_TIMEOUT_FIRED]);
      }, 15);
      return () => clearTimeout(timer);
    } else if (
      tsneInstance &&
      step >= maxIter &&
      computationState === ComputationStates.RUNNING
    ) {
      optsDispatch([OptsActions.IS_FINISHED]);
    }
  }, [step, maxIter, computationState]);

  return (
    <div>
      <NormalizedScatterplot
        showPoints={
          step > 10 &&
          computationState !== ComputationStates.WAITING &&
          computationState !== ComputationStates.RESET
        }
        data={displayData ? displayData : []}
        overlayData={overlayData}
        dims={dims}
        mouseOverEnabled={
          computationState === ComputationStates.FINISHED ||
          computationState === ComputationStates.PAUSED
        }
        mouseOverDisabledMessage="wait for the computation to finish or pause it to interact with the plot"
        magnificationEnabled={magnificationEnabled}
      />
    </div>
  );
};
