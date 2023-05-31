import { observer, inject } from "mobx-react";
import Backdrop from "@docspace/components/backdrop";
import Aside from "@docspace/components/aside";
import Heading from "@docspace/components/heading";

const StatusFillingPanel = ({ visible, setStatusFillinglVisible }) => {
  const onClose = () => setStatusFillinglVisible(false);
  return (
    <div>
      <Backdrop
        onClick={onClose}
        visible={visible}
        isAside={true}
        zIndex={210}
      />
      <Aside className="status-filling-panel" visible={visible} onClose={onClose}>
        <div className="status-filling_header">
          <Heading className="status_heading">Status filling</Heading>
        </div>
      </Aside>
    </div>
  );
};

export default inject(({ dialogsStore }) => {
  const { statusFillingPanelVisible, setStatusFillinglVisible } = dialogsStore;

  return {
    visible: statusFillingPanelVisible,
    setStatusFillinglVisible,
  };
})(observer(StatusFillingPanel));
