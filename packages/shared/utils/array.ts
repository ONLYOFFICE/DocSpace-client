import differenceWith from "lodash/differenceWith";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";

export const isArrayEqual = <T1, T2>(arr1: T1[], arr2: T2[]) => {
  return isEmpty(differenceWith(arr1, arr2, isEqual));
};
