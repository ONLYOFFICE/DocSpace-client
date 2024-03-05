import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";

import PaymentsEnterprise from "./Standalone";
import PaymentsSaaS from "./SaaS";

const PaymentsPage = (props) => {
  const { standalone } = props;

  return standalone ? <PaymentsEnterprise /> : <PaymentsSaaS />;
};

export default inject(({ settingsStore }) => {
  const { standalone } = settingsStore;

  return {
    standalone,
  };
})(observer(PaymentsPage));
