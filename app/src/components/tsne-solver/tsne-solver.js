import React, { useEffect, useMemo, useReducer, useState } from "react";
import { tsnejs } from "./tsne";
import { NormalizedScatterplot } from "./normalized-scatterplot";
import { ComputationStates, OptsActions } from "../../views/data";

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
      const [[votingData, mpData, votesData], tsneOpts, elecPeriod] = value;
      const newInstance = new tsnejs.tSNE(tsneOpts);
      const tsneData = computeTsneMatrix(
        mpData,
        votesData,
        votingData,
        elecPeriod
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

const computeTsneMatrix = (mps, votes, votingData, elecPeriod) => {
  if (!votingData[elecPeriod]) return [];
  return Object.keys(mps).map((mp) =>
    Object.keys(votes).map((vote) => {
      const hasCastVote = votingData[elecPeriod].mps[mp].find(
        (vb) => vb[0] + "" === vote
      );
      return hasCastVote ? hasCastVote[1] : 0;
    })
  );
};

export const TSNESolver = (props) => {
  const {
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
        [data, tsne, elecPeriod],
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
      }, 10);
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
