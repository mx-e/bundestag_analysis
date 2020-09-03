import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  requestElecPeriodData,
  requestMPData,
  requestVoteData,
} from "../middleware/requests";
import TsnePlot from "./tsne-plot";

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
  tsne: {
    epsilon: 5,
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
  const dimensions = [500, 300];
  const {
    opts,
    data: [votingData, mpData, votesData],
  } = props;
  const [tsnePlot, setTsnePlot] = useState(null);
  const tsnePlotNode = useRef(null);
  const tsneData = useMemo(
    () => computeTsneMatrix(mpData, votesData, votingData, opts),
    [votingData, mpData, votesData, opts]
  );
  useEffect(() => {
    setTsnePlot(new TsnePlot(dimensions, tsneData, tsnePlotNode, opts.tsne));
  }, [tsneData]);

  useEffect(() => {
    if (tsnePlot) {
      console.log("runs");

      tsnePlot.run(1000);
    }
  }, [tsnePlot]);

  return <div ref={tsnePlotNode}>SCATTERPLOT</div>;
};
