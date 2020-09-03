import React, { useEffect, useMemo, useState } from "react";
import { tsnejs } from "./tsne";
import { NormalizedScatterplot } from "./normalized-scatterplot";
import { getPartyColor } from "../../util/util";

const computeTsneMatrix = (mps, votes, votingData, opts) =>
  Object.keys(mps).map((mp) =>
    Object.keys(votes).map((vote) => {
      const hasCastVote = votingData[opts.elecPeriod].mps[mp].find(
        (vb) => vb[0] + "" === vote
      );
      return hasCastVote ? hasCastVote[1] : 0;
    })
  );

const computeMetaData = (mps, votes, opts) => {
  return Object.values(mps).map((mp) => ({
    color: getPartyColor(mp.party),
  }));
};

export const TSNESolver = (props) => {
  const dimensions = [800, 400];
  const {
    opts,
    data: [votingData, mpData, votesData],
  } = props;
  const [tsneInstance, setTsneInstance] = useState(null);
  const [displayData, setDisplayData] = useState([]);
  const [step, setStep] = useState(0);
  const tsneData = useMemo(
    () => computeTsneMatrix(mpData, votesData, votingData, opts),
    [votingData, mpData, votesData, opts]
  );

  const metaData = useMemo(() => computeMetaData(mpData, votesData, opts), [
    mpData,
    votesData,
    opts.elecPeriod,
  ]);

  useEffect(() => {
    setTsneInstance(new tsnejs.tSNE(opts.tsne));
    console.log("done");
  }, [tsneData]);

  useEffect(() => {
    if (tsneInstance) {
      console.log("1");
      tsneInstance.initDataRaw(tsneData);
      setStep(step + 1);
    }
  }, [tsneInstance]);

  useEffect(() => {
    if (step < opts.maxIter && tsneInstance) {
      const timer = setTimeout(() => {
        Array(2)
          .fill()
          .forEach((_) => tsneInstance.step());
        setDisplayData(tsneInstance.getSolution());
        setStep(step + 2);
      }, 10);
    } else if (step >= opts.maxIter) {
      console.log("finished");
    }
  }, [step]);

  return (
    <div>
      <NormalizedScatterplot
        data={displayData}
        metaData={metaData}
        dims={dimensions}
      />
    </div>
  );
};
