import { getPartyColor } from "../util/color-util";

const uniqueVals = (list) => Array.from(new Set(list));
const union = (listOfLists) => [
  ...listOfLists.reduce((setList, list) => new Set(...setList, list)),
];

const listFilter = (object, property, listOfValues) => {
  return union(
    listOfValues.map((value) =>
      Object.keys(object).filter((key) => object[key][property].includes(value))
    )
  );
};

const simpleFilter = (object, property, listOfValues) => {
  return union(
    listOfValues.map((value) =>
      Object.keys(object).filter((key) => object[key][property] === value)
    )
  );
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
  if (Array.isArray(Object.values(object)[0][property])) {
    return []; //explicit because it might be needed in the future
  } else if (Object.values(object)[0][property]) {
    return uniqueVals(Object.values(object).map((val) => val[property]));
  } else {
    return [];
  }
};

const createColorFunc = (property) => {
  let coloring;
  switch (property) {
    case "party":
      coloring = (mp) => getPartyColor(mp[property]);
  }
  return (object) => Object.values(object).map(coloring);
};

export const Filter = (title, property, value) => {
  return {
    filterFunc: createFilterFunc(property, value),
    uniqueValFunc: createUniqueValFunc(property),
    title: title,
    value: value,
  };
};

export const ColorOverlay = (title, property) => {
  return {
    uniqueValFunc: createUniqueValFunc(property),
    colorFunc: createColorFunc(property),
    colorFuncSingle: (party) => getPartyColor(party),
    title: title,
  };
};
