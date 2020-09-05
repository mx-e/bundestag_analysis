const partyColorMap = {
  CDU: "#000000",
  SPD: "#EB001F",
  FDP: "#FFED00",
  CSU: "#008AC5",
  "Left Party/PDS": "#BE3075",
  Greens: "#64A12D",
};

export const getPartyColor = (party) =>
  partyColorMap[party] ? partyColorMap[party] : "#cfcfc2";

export const uniformColorScheme = "#cfcfc2";
