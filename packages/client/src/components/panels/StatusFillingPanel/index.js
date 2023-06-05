import { useRef } from "react";
import { ReactSVG } from "react-svg";
import { observer, inject } from "mobx-react";

import Backdrop from "@docspace/components/backdrop";
import Aside from "@docspace/components/aside";
import Heading from "@docspace/components/heading";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import Box from "@docspace/components/box";
import IconButton from "@docspace/components/icon-button";
import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder-location.react.svg?url";
import ButtonFileReactSvgUrl from "PUBLIC_DIR/images/button.file.react.svg?url";

import FillingStatusLine from "./sub-components";

import {
  StyledFillingStatusPanel,
  StyledScrollbar,
} from "./StyledFillingStatusPanel";

const StatusFillingPanel = ({ visible, setStatusFillinglVisible }) => {
  const scrollRef = useRef(null);
  const onClose = () => setStatusFillinglVisible(false);

  return (
    <StyledFillingStatusPanel>
      <Backdrop
        onClick={onClose}
        visible={visible}
        isAside={true}
        zIndex={210}
      />
      <Aside
        className="status-filling-panel"
        visible={visible}
        onClose={onClose}
      >
        <div className="status-filling_header">
          <Heading className="status_heading">Filling status</Heading>
        </div>

        <StyledScrollbar ref={scrollRef} stype="mediumBlack">
          <Text className="status-filling_sub-header">File action</Text>

          <Box className="status-filling_item">
            <div className="item-title">
              <ReactSVG
                className="icon"
                src={ButtonFileReactSvgUrl}
                wrapper="span"
              />
              <span className="name">Elyor Djalilov - New form template</span>
              <span className="exst">.oform</span>
            </div>

            <IconButton
              className="location-btn"
              iconName={FolderLocationReactSvgUrl}
              size="16"
              isFill={true}
              onClick={() => console.log("icon clicked")}
            />
          </Box>
          
          <FillingStatusLine />
        </StyledScrollbar>

        <div className="status-filling_footer">
          <Text className="footer-text">
            You can stop filling in this instance of the form
          </Text>
          <Button
            size="normal"
            scale={true}
            label="Interrupt filling"
            onClick={onClose}
          />
        </div>
      </Aside>
    </StyledFillingStatusPanel>
  );
};

export default inject(({ auth, dialogsStore }) => {
  const { statusFillingPanelVisible, setStatusFillinglVisible } = dialogsStore;
  const { getInfoPanelItemIcon } = auth.infoPanelStore;

  return {
    visible: statusFillingPanelVisible,
    setStatusFillinglVisible,
    getInfoPanelItemIcon,
  };
})(observer(StatusFillingPanel));
