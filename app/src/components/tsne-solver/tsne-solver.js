import React, { useEffect, useMemo, useState } from "react";
import { tsnejs } from "./tsne";
import { NormalizedScatterplot } from "./normalized-scatterplot";
import { getElemColor } from "../../util/color-util";
import {
  ComputationStates,
  OptsActions,
  Overlays,
  DisplayModes,
} from "../../views/data";

const computeTsneMatrix = (mps, votes, votingData, elecPeriod) =>
  Object.keys(mps).map((mp) =>
    Object.keys(votes).map((vote) => {
      const hasCastVote = votingData[elecPeriod].mps[mp].find(
        (vb) => vb[0] + "" === vote
      );
      return hasCastVote ? hasCastVote[1] : 0;
    })
  );

const computeMetaData = (displayMode, colorOverlay, mps, votes) => {
  if (displayMode === DisplayModes.MPS) {
    return Object.values(mps).map((mp) => ({
      color: getElemColor(colorOverlay, mp),
    }));
  } else {
    return Object.values(votes).map((vote) => ({
      color: getElemColor(colorOverlay, vote),
    }));
  }
};

export const TSNESolver = (props) => {
  const {
    dims,
    opts: {
      elecPeriod,
      computationState,
      tsne,
      maxIter,
      colorOverlay,
      displayMode,
    },
    optsDispatch,
    data: [votingData, mpData, votesData],
  } = props;
  const [tsneInstance, setTsneInstance] = useState(null);
  const [displayData, setDisplayData] = useState([]);
  const [step, setStep] = useState(0);
  const tsneData = useMemo(
    () => computeTsneMatrix(mpData, votesData, votingData, elecPeriod),
    [votingData, mpData, votesData, elecPeriod]
  );

  const metaData = useMemo(
    () => computeMetaData(displayMode, colorOverlay, mpData, votesData),
    [mpData, votesData, colorOverlay, displayMode]
  );

  useEffect(() => {
    setTsneInstance(new tsnejs.tSNE(tsne));
  }, [tsneData]);

  useEffect(() => {
    if (computationState === ComputationStates.RESET) {
      optsDispatch([OptsActions.PAUSE_PRESSED]);
      setTsneInstance(new tsnejs.tSNE(tsne));
    }
  }, [computationState]);

  useEffect(() => {
    if (tsneInstance) {
      tsneInstance.initDataRaw(tsneData);
      tsneInstance.step();
      setDisplayData(tsneInstance.getSolution());
      setStep(step + 1);
    }
  }, [tsneInstance]);

  useEffect(() => {
    if (
      step < maxIter &&
      tsneInstance &&
      computationState === ComputationStates.RUNNING
    ) {
      setTimeout(() => {
        tsneInstance.step();
        setDisplayData(tsneInstance.getSolution());
        setStep(step + 1);
      }, 15);
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
        data={displayData}
        metaData={metaData}
        dims={dims}
      />
    </div>
  );
};
