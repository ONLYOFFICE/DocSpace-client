import { useState } from "react";
import RoomSelector from "@docspace/client/src/components/RoomSelector";
import Aside from "@docspace/components/aside";
import styled from "styled-components";
import Backdrop from "@docspace/components/backdrop";
import Portal from "@docspace/components/portal";
import { StartFillingPanel } from "@docspace/client/src/components/panels/index";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import i18n from "./i18n";

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
  const t = i18n.getFixedT(null, ["SelectRoomPanel", "Common"]);
  const [isDisabledAcceptButton, setIsDisabledAcceptButton] = useState(true);
  const [room, setRoom] = useState({});

  const onCheckSelectedItems = (hasSelected) => {
    setIsDisabledAcceptButton(!hasSelected);
  };
  const onClose = () => {
    setSelectRoomPanelVisible(false);
  };
  const onAccept = (rooms) => {
    setRoom({ id: rooms[0].id, title: rooms[0].label });
    setStartFillingPanelVisible(true);
  };

  if (startFillingPanelVisible) {
    return (
      <StartFillingPanel
        room={room}
        headerCancelButton={"Back"}
        isCloseable={false}
        onCloseSelectRoomPanel={onClose}
      />
    );
  }

  return (
    <>
      <Portal
        element={
          <>
            <Backdrop
              visible={selectRoomPanelVisible}
              zIndex={310}
              strongBlur
            />
            <StyledAside
              visible={selectRoomPanelVisible}
              zIndex={310}
              onClose={onClose}
            >
              <RoomSelector
                onAccept={onAccept}
                onCancel={onClose}
                headerLabel={t("SelectRoomPanel:SelectRoom")}
                acceptButtonLabel={t("Common:Next")}
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
    </>
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
})(withTranslation(["Common", "SelectRoomPanel"])(observer(SelectRoomPanel)));
