import React from "react";

import EnterpriseLoader from "./Payments.enterprise";
import TrialLoader from "./Payments.trial";

import { PaymentsStandaloneLoaderProps } from "./Payments.types";

export const PaymentsStandaloneLoader = ({
  isEnterprise = false,
  ...rest
}: PaymentsStandaloneLoaderProps) => {
  return isEnterprise ? (
    <EnterpriseLoader {...rest} />
  ) : (
    <TrialLoader {...rest} />
  );
};
