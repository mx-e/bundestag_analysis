import {
  getAgeColor,
  getGenderColor,
  getPartyColor,
  getPassageColor,
  getPositionColor,
  getSubjectColor,
  getUniformColorScheme,
} from "../util/color-util";

export const getUniqueVals = (object, property) => {
  const unique = uniqueVals(Object.values(object).map((val) => val[property]));
  unique.sort((a, b) => a.localeCompare(b));
  return unique;
};

const getUniqueValsOfArrays = (object, property) => {
  const unique = union(Object.values(object).map((val) => val[property]));
  unique.sort((a, b) => a.localeCompare(b));
  return unique;
};

const uniqueVals = (list) => Array.from(new Set(list));

const union = (listOfLists) => [
  ...listOfLists.reduce((setList, list) => new Set([...setList, ...list])),
];

const listFilter = (object, property, listOfValues) => {
  return Object.keys(object).filter((key) =>
    listOfValues
      .map((value) => object[key][property].includes(value))
      .includes(true)
  );
};

const simpleFilter = (object, property, listOfValues) => {
  return Object.keys(object).filter((key) =>
    listOfValues.map((value) => object[key][property] === value).includes(true)
  );
};

export const filterObject = (object, filterFunc) => {
  let out = {};
  const filteredKeys = Object.keys(object).filter((key) =>
    filterFunc(object[key])
  );
  filteredKeys.forEach((key) => (out[key] = object[key]));
  return out;
};

export const mapObject = (object, mapFunc) => {
  let out = {};
  Object.keys(object).forEach((key) => (out[key] = mapFunc(object[key])));
  return out;
};

const createFilterFunc = (property, value) => (object) => {
  let filterVal = Array.isArray(value) ? value : [value];
  let filteredObject = {};
  let filteredKeys;
  if (Array.isArray(Object.values(object)[0][property])) {
    filteredKeys = listFilter(object, property, filterVal);
  } else if (Object.values(object)[0][property]) {
    filteredKeys = simpleFilter(object, property, filterVal);
  } else {
    return object;
  }
  filteredKeys.forEach((key) => {
    filteredObject[key] = object[key];
  });
  return filteredObject;
};

const createUniqueValFunc = (property) => (object) => {
  if (Object.values(object).length === 0) {
    return [];
  } else if (Array.isArray(Object.values(object)[0][property])) {
    return getUniqueValsOfArrays(object, property);
  } else if (Object.values(object)[0][property]) {
    return getUniqueVals(object, property);
  } else {
    return [];
  }
};

const createColorFuncs = (property) => {
  let coloring;
  let colorFunc;
  switch (property) {
    case "party":
      colorFunc = getPartyColor;
      coloring = (mp) => colorFunc(mp[property]);
      break;
    case "gender":
      colorFunc = getGenderColor;
      coloring = (mp) => colorFunc(mp[property]);
      break;
    case "sponsors":
      colorFunc = getPartyColor;
      coloring = (vote) => vote[property].map((party) => colorFunc(party));
      break;
    case "policy":
      colorFunc = getSubjectColor;
      coloring = (vote) => vote[property].map((subject) => colorFunc(subject));
      break;
    case "govPos":
      colorFunc = getPositionColor;
      coloring = (mp) => mp[property].map((pos) => colorFunc(pos));
      break;
    case "passage":
      colorFunc = getPassageColor;
      coloring = (vote) => vote[property].map((pas) => colorFunc(pas));
      break;
    case "age":
      colorFunc = getAgeColor;
      coloring = (mp) => colorFunc(mp[property]);
      break;
    default:
      colorFunc = getUniformColorScheme;
      coloring = () => getUniformColorScheme();
  }
  return [(object) => Object.values(object).map(coloring), colorFunc];
};

export const Filter = (title, property, value) => {
  const [, colorFuncSingle] = createColorFuncs(property);
  return {
    filterFunc: createFilterFunc(property, value),
    uniqueValFunc: createUniqueValFunc(property),
    colorFunc: colorFuncSingle,
    title: title,
    value: value,
    property: property,
  };
};

export const ColorOverlay = (title, property, icon) => {
  const [colorFunc, colorFuncSingle] = createColorFuncs(property);
  return {
    uniqueValFunc: createUniqueValFunc(property),
    colorFunc: colorFunc,
    colorFuncSingle: colorFuncSingle,
    title: title,
    icon: icon,
    property: property,
  };
};
