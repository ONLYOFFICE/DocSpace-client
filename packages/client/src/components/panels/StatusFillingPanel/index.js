import { useRef } from "react";
import { ReactSVG } from "react-svg";
import { observer, inject } from "mobx-react";
import { isMobileOnly } from "react-device-detect";

import Backdrop from "@docspace/components/backdrop";
import Aside from "@docspace/components/aside";
import Heading from "@docspace/components/heading";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import Box from "@docspace/components/box";
import IconButton from "@docspace/components/icon-button";

import FillingStatusLine from "./sub-components";

import {
  StyledFillingStatusPanel,
  StyledScrollbar,
} from "./StyledFillingStatusPanel";

const StatusFillingPanel = (props) => {
  const {
    visible,
    setStatusFillinglVisible,
    selection,
    fileId,
    isVisible,
    fileInfo,
    getIcon,
    openLocation,
    openLocationAction,
    isEditor,
  } = props;

  const scrollRef = useRef(null);

  const displayName = selection?.createdBy?.displayName || fileInfo?.createdBy?.displayName;
  const fileTitle = selection?.title || fileInfo?.title;
  const item = selection || fileInfo;
  const icon = getIcon(24, selection?.fileExst || fileInfo?.fileExst);

  const onClose = () => {
    setStatusFillinglVisible(false);
    props.onClose && props.onClose();
  };

  const openFileLocation = () => {
    if (isEditor) {
      openLocationAction(item);
    } else {
      openLocation({ ...item, ExtraLocation: item.folderId });
    }
    return onClose();
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

        <Text className="status-filling_sub-header">File action</Text>

        <Box className="status-filling_item">
          <div className="item-title">
            <ReactSVG className="icon" src={icon} wrapper="span" />
            <span className="name">
              {displayName} - {fileTitle}
            </span>
          </div>

          <IconButton
            className="location-btn"
            iconName="/static/images/folder-location.react.svg"
            size="16"
            isFill={true}
            onClick={openFileLocation}
            title="Open Location"
          />
        </Box>
        
        {isMobileOnly ? (
          <StyledScrollbar ref={scrollRef} stype="mediumBlack">
            <FillingStatusLine selection={selection} fileId={fileId} />
          </StyledScrollbar>
        ) : (
          <FillingStatusLine selection={selection} fileId={fileId} />
        )}

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

export default inject(({ auth, dialogsStore, filesActionsStore, settingsStore }) => {
    const { statusFillingPanelVisible, setStatusFillinglVisible } = dialogsStore;
    const { getInfoPanelItemIcon, selection } = auth.infoPanelStore;
    const { checkAndOpenLocationAction, openLocationAction } = filesActionsStore;
    const { getIcon } = settingsStore;

    return {
      getIcon,
      visible: statusFillingPanelVisible,
      setStatusFillinglVisible,
      getInfoPanelItemIcon,
      selection,
      openLocationAction,
      openLocation: checkAndOpenLocationAction,
    };
  }
)(observer(StatusFillingPanel));
