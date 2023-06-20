import React, { useEffect, useState } from "react";
import RectangleLoader from "../RectangleLoader";
import CircleLoader from "../CircleLoader";
import ModalDialog from "@docspace/components/modal-dialog";
import styled from "styled-components";
import { size } from "@docspace/components/utils/device";

const StyledModalDialog = styled(ModalDialog)`
  .tooltip-loader {
    padding-bottom: 19px;
  }

  .list-title {
    padding-bottom: 12px;
  }

  .name {
    padding-left: 8px;
    padding-right: 28px;
    max-width: 284px;
  }

  .row-loader {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
  }

  .row-with-remove {
    justify-content: space-between;
    align-items: center;
  }

  .avatar-with-role {
    display: flex;
    align-items: center;

    .name {
      padding-right: 12px;
    }
  }

  .row-container {
    padding-left: 17px;
  }

  .avatar {
    min-width: 32px;
  }
`;

const StartFillingPanelLoader = ({ visible, onClose, isCloseable }) => {
  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const checkWidth = () => {
    window.innerWidth <= size.smallTablet
      ? setIsMobileView(true)
      : setIsMobileView(false);
  };

  return (
    <StyledModalDialog
      displayType="aside"
      visible={visible}
      withFooterBorder
      onClose={onClose}
      isCloseable={isCloseable}
    >
      <ModalDialog.Header>
        <RectangleLoader height="29" />
      </ModalDialog.Header>
      <ModalDialog.Body>
        <RectangleLoader
          className="tooltip-loader"
          height={isMobileView ? "92px" : "76px"}
        />
        <RectangleLoader className="list-title" width="120px" height="16px" />

        <div className="row-container">
          <div className="row-loader">
            <CircleLoader
              className="avatar"
              x="16"
              y="16"
              width="32"
              height="32"
              radius="16"
            />
            <RectangleLoader className="name" height="16px" />
          </div>
          <div className="row-loader">
            <CircleLoader
              className="avatar"
              x="16"
              y="16"
              width="32"
              height="32"
              radius="16"
            />
            <RectangleLoader className="name" height="16px" />
          </div>
          <div className="row-loader row-with-remove">
            <div className="avatar-with-role">
              <CircleLoader
                className="avatar"
                x="16"
                y="16"
                width="32"
                height="32"
                radius="16"
              />
              <RectangleLoader className="name" height="16px" />
            </div>

            <RectangleLoader width="16" height="16" />
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <RectangleLoader height="40" />
        <RectangleLoader height="40" />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default StartFillingPanelLoader;
