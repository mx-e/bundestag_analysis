import { Overlays } from "../views/data";

const partyColorMap = {
  CDU: "#000000",
  SPD: "#EB001F",
  FDP: "#FFED00",
  CSU: "#008AC5",
  "Left Party/PDS": "#BE3075",
  Greens: "#64A12D",
};

const getPartyColor = (party) =>
  partyColorMap[party] ? partyColorMap[party] : "#cfcfc2";

const uniformColorScheme = "#cfcfc2";

export const getElemColor = (colorOverlay, value) => {
  switch (colorOverlay) {
    case Overlays.MPS.PARTY: {
      return getPartyColor(value.party);
    }
    default:
      return uniformColorScheme;
  }
};
