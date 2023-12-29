import { RoomsType } from "../enums";

export const RoomsTypeValues = Object.values(RoomsType).reduce(
  (acc, current) => {
    return { ...acc, [current]: current };
  },
  {},
);
