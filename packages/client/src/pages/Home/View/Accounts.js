import React from "react";
import { Consumer } from "@docspace/components/utils/context";
import Submenu from "@docspace/components/submenu";

import { AccountsSectionBodyContent } from "../Section";

const AccountsView = () => {
  return (
    <>
      <Consumer>
        {(context) => (
          <>
            <AccountsSectionBodyContent sectionWidth={context.sectionWidth} />
          </>
        )}
      </Consumer>
    </>
  );
};

export default AccountsView;
