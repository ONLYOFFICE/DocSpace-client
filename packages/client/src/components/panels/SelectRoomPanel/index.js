import { useState } from "react";
import RoomSelector from "@docspace/client/src/components/RoomSelector";
import Aside from "@docspace/components/aside";
import styled from "styled-components";
import Backdrop from "@docspace/components/backdrop";
import Portal from "@docspace/components/portal";
import { StartFillingPanel } from "@docspace/client/src/components/panels/index";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

const StyledAside = styled(Aside)`
  .scroll-body {
    padding-right: 0 !important;
  }
`;

const SelectRoomPanel = ({
  selectRoomPanelVisible,
  setSelectRoomPanelVisible,
  setStartFillingPanelVisible,
  startFillingPanelVisible,
}) => {
  const [isDisabledAcceptButton, setIsDisabledAcceptButton] = useState(true);

  const onCheckSelectedItems = (hasSelected) => {
    setIsDisabledAcceptButton(!hasSelected);
  };
  const onClose = () => {
    setSelectRoomPanelVisible(false);
  };
  const onAccept = () => {
    setStartFillingPanelVisible(true);
  };

  if (startFillingPanelVisible) return <StartFillingPanel />;
  return (
    <Portal
      element={
        <>
          <Backdrop
            visible={selectRoomPanelVisible}
            withBackground={true}
            zIndex={310}
          />
          <StyledAside
            visible={selectRoomPanelVisible}
            zIndex={310}
            onClose={onClose}
          >
            <RoomSelector
              onAccept={onAccept}
              onCancel={onClose}
              headerLabel={"Select room"}
              acceptButtonLabel={"Next"}
              withCancelButton
              withArrowButton={false}
              withButtonsFooterVisible={true}
              countRowLoader={4}
              isDisabledAcceptButton={isDisabledAcceptButton}
              onCheckSelectedItems={onCheckSelectedItems}
            />
          </StyledAside>
        </>
      }
    />
  );
};

export default inject(({ dialogsStore }) => {
  const {
    selectRoomPanelVisible,
    setSelectRoomPanelVisible,
    setStartFillingPanelVisible,
    startFillingPanelVisible,
  } = dialogsStore;

  return {
    selectRoomPanelVisible,
    setSelectRoomPanelVisible,
    setStartFillingPanelVisible,
    startFillingPanelVisible,
  };
})(withTranslation(["Common"])(observer(SelectRoomPanel)));
