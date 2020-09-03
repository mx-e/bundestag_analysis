import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  requestElecPeriodData,
  requestMPData,
  requestVoteData,
} from "../middleware/requests";
import { TSNESolver } from "../components/tsne-solver/tsne-solver";

const dispatchError = (err) => {
  console.log(err);
};

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

export const OptsActions = {};

const initialOpts = {
  elecPeriod: 16,
  maxIter: 2000,
  tsne: {
    epsilon: 8,
    perplexity: 12,
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

  const filteredMps = filterMPs(mps, optsState);
  const filteredVotes = filterVotes(votes, optsState);

  if (
    Object.keys(filteredMps).length > 0 &&
    Object.keys(filteredVotes).length > 0 &&
    votingData[optsState.elecPeriod]
  ) {
    return (
      <div>
        <TSNESolver
          opts={optsState}
          data={[votingData, filteredMps, filteredVotes]}
        />
      </div>
    );
  } else {
    return <div>WAITING FOR DATA...</div>;
  }
};
