import React, { useEffect, useState } from "react";
import { DataView } from "./views/data";
import {
  requestMPData,
  requestVoteData,
  errorDispatch,
} from "./middleware/requests";
import style from "./App.module.css";

function App() {
  const [mps, setMPs] = useState([]);
  const [votes, setVotes] = useState([]);

  useEffect(() => requestMPData(setMPs, errorDispatch), []);
  useEffect(() => requestVoteData(setVotes, errorDispatch), []);

  if (Object.keys(mps).length > 0 && Object.keys(votes).length > 0) {
    return (
      <div className={style.background}>
        <div className={style.app}>
          <DataView mps={mps} votes={votes} />
        </div>
      </div>
    );
  } else {
    return <div>LOADING SCREEN</div>;
  }
}
export default App;
