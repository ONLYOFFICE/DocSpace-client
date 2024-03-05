import { inject, observer } from "mobx-react";

import Share from "@docspace/shared/components/share";

import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

export default inject(
  ({ infoPanelStore }: { infoPanelStore: InfoPanelStore }) => {
    const {
      setView,
      getPrimaryFileLink,

      editFileLink,
      addFileLink,
      shareChanged,
      setShareChanged,
    } = infoPanelStore;

    return {
      setView,
      getPrimaryFileLink,

      editFileLink,
      addFileLink,
      shareChanged,
      setShareChanged,
    };
  },
)(observer(Share));
