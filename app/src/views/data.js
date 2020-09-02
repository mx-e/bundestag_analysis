import React, { useEffect, useMemo, useReducer, useState } from "react";
import {
  requestElecPeriodData,
  requestMPData,
  requestVoteData,
} from "../middleware/requests";
import { tsnejs } from "../tsne/tsne";

const dispatchError = (err) => {
  console.log(err);
};

const filterMPs = (mps, optsState) =>
  Object.keys(mps).filter((mp) =>
    mps[mp].elecPeriod.includes(optsState.elecPeriod)
  );

const filterVotes = (votes, optsState) =>
  Object.keys(votes).filter(
    (vote) => votes[vote].elecPeriod === optsState.elecPeriod
  );

export const OptsActions = {};

const initialOpts = {
  elecPeriod: 1,
  maxIter: 150,
  tsne: {
    epsilon: 10,
    perplexity: 15,
    dim: 2,
  },
};

const optsReducer = (state, action) => {
  switch (action) {
    default:
      return state;
  }
};

export const DataView = () => {
  const [optsState, optsDispatch] = useReducer(optsReducer, initialOpts);
  const [votingData, setData] = useState({});
  const [mps, setMPs] = useState([]);
  const [votes, setVotes] = useState([]);

  useEffect(() => requestMPData(setMPs, dispatchError), []);
  useEffect(() => requestVoteData(setVotes, dispatchError), []);
  useEffect(
    () =>
      requestElecPeriodData(
        optsState.elecPeriod,
        votingData,
        setData,
        dispatchError
      ),
    [optsState.elecPeriod]
  );

  if (
    Object.keys(mps).length > 0 &&
    Object.keys(votes).length > 0 &&
    votingData[optsState.elecPeriod]
  ) {
    return (
      <div>
        <TSNE_Solver opts={optsState} data={[votingData, mps, votes]} />
      </div>
    );
  } else {
    return <div>WAITING FOR DATA...</div>;
  }
};

const computeTsneMatrix = (mps, votes, votingData, opts) => {
  const filteredMPsKeys = filterMPs(mps, opts);
  const filteredVotesKeys = filterVotes(votes, opts);
  return filteredMPsKeys.map((mp) =>
    filteredVotesKeys.map((vote) => {
      const hasCastVote = votingData[opts.elecPeriod].mps[mp].find(
        (vb) => vb[0] + "" === vote
      );
      return hasCastVote ? hasCastVote[1] : 0;
    })
  );
};

export const TSNE_Solver = (props) => {
  const {
    opts,
    data: [votingData, mpData, votesData],
  } = props;
  const [tsneSolver, setTsneSolver] = useState(null);
  const [step, setStep] = useState(0);
  const tsneData = useMemo(
    () => computeTsneMatrix(mpData, votesData, votingData, opts),
    [votingData, mpData, votesData, opts]
  );
  useEffect(() => {
    setStep(0);
    setTsneSolver(new tsnejs.tSNE(opts.tsne));
  }, [opts]);

  useEffect(() => {
    if (tsneSolver) {
      tsneSolver.initDataRaw(tsneData);
    }
  }, [tsneData]);

  const { maxIter } = opts;
  useEffect(() => {
    if (step < maxIter && tsneSolver) {
      tsneSolver.step();
      setStep(step + 1);
      console.log(step);
    }
  });
  return <div>SCATTERPLOT</div>;
};
