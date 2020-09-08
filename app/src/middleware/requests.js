import axios from "axios";

export const requestElecPeriodData = (elecPeriod, dispatch, errorDispatch) => {
  axios
    .get("./data/bundestag_" + elecPeriod + ".json")
    .then((result) => {
      dispatch(result.data);
    })
    .catch((error) => {
      errorDispatch(error);
    });
};

export const requestVoteData = (dispatch, errorDispatch) => {
  axios
    .get("./data/votes.json")
    .then((result) => {
      dispatch(result.data);
    })
    .catch((error) => {
      errorDispatch(error);
    });
};

export const requestMPData = (dispatch, errorDispatch) => {
  axios
    .get("./data/mps.json")
    .then((result) => {
      dispatch(result.data);
    })
    .catch((error) => {
      errorDispatch(error);
    });
};

export const errorDispatch = (err) => {
  console.log(err);
};
