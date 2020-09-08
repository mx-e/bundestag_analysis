export const selectedColor = "#66d9ef";
export const activeColor = "#a6e22e";
export const neutralColor = "#cfcfc2";
export const inactiveColor = "#75715e";
export const textColorLight = "#f8f8f2";
export const textColorDark = "#3e3d32";
export const errorColor = "#f92672";
export const backgroundColor = "#272822";

export const partyColorMap = {
  CDU: "#000000",
  SPD: "#EB001F",
  FDP: "#FFED00",
  CSU: "#008AC5",
  "Left Party/PDS": "#BE3075",
  Greens: "#64A12D",
};

const genderColorMap = {
  male: selectedColor,
  female: errorColor,
};

export const getPartyColor = (party) =>
  partyColorMap[party] ? partyColorMap[party] : neutralColor;

export const getGenderColor = (gender) =>
  genderColorMap[gender] ? genderColorMap[gender] : neutralColor;

export const getUniformColorScheme = () => "#cfcfc2";
