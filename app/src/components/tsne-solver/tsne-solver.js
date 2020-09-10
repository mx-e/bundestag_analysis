import React, { useEffect, useMemo, useReducer, useState } from "react";
import { tsnejs } from "./tsne";
import { NormalizedScatterplot } from "./normalized-scatterplot";
import { ComputationStates, DisplayModes, OptsActions } from "../../views/data";
import { elecPeriodMap } from "../../util/util";

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
      newInstance.initDataRaw(tsneData);
      newInstance.step();
      const displayData = newInstance.getSolution();
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
  if (!votingData[elecPeriod]) return [];
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
        data={displayData}
        overlayData={overlayData}
        dims={dims}
      />
    </div>
  );
};
