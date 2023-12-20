import type { Dispatch, SetStateAction } from "react";
import type { FieldProps } from "../../Cron.types";

interface HoursProps extends FieldProps {
  hours: number[];
  setHours: Dispatch<SetStateAction<number[]>>;
}

export default HoursProps;
