import { useState, useEffect, useRef } from "react";
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

const StatusFillingPanel = (props) => {
  const {
    visible,
    setStatusFillinglVisible,
    getRolesUsersForFillingForm,
    selection,
    fileId,
    isVisible,
  } = props;

  const [fillingStatusInfo, setfillingStatusInfo] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    getRolesUsersForFillingForm(selection?.id || fileId).then((res) => {
      setfillingStatusInfo(res);
    });
  }, []);

  const onClose = () => {
    setStatusFillinglVisible(false);
    props.onClose && props.onClose();
  };

  return (
    <StyledFillingStatusPanel>
      <Backdrop
        onClick={onClose}
        visible={visible || isVisible}
        isAside={true}
        zIndex={210}
      />
      <Aside
        className="status-filling-panel"
        visible={visible || isVisible}
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

          <FillingStatusLine fillingStatusInfo={fillingStatusInfo} />
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

export default inject(({ auth, dialogsStore, filesStore }) => {
  const { statusFillingPanelVisible, setStatusFillinglVisible } = dialogsStore;
  const { getInfoPanelItemIcon, selection } = auth.infoPanelStore;
  const { getRolesUsersForFillingForm } = filesStore;

  return {
    visible: statusFillingPanelVisible,
    setStatusFillinglVisible,
    getInfoPanelItemIcon,
    getRolesUsersForFillingForm,
    selection,
  };
})(observer(StatusFillingPanel));
