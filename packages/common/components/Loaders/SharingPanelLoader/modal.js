import React from "react";
import PropTypes from "prop-types";

import {
  StyledContainer,
  StyledHeader,
  StyledExternalLink,
  StyledInternalLink,
  StyledOwner,
  StyledBody,
  StyledItem,
  StyledButtons,
} from "./StyledSharingPanel";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const SharingPanelLoaderModal = ({
  id,
  className,
  style,
  isShared,
  ...rest
}) => {
  return (
    <StyledContainer>
      <StyledHeader isPersonal={true}>
        <RectangleSkeleton width={"283px"} height={"16px"} />
      </StyledHeader>

      <StyledExternalLink isPersonal={true}>
        <RectangleSkeleton
          className="rectangle-loader"
          width={"146px"}
          height={"22px"}
        />
        {isShared && (
          <>
            <RectangleSkeleton
              className="rectangle-loader"
              width={"368px"}
              height={"32px"}
            />
            <RectangleSkeleton width={"184px"} height={"20px"} />
          </>
        )}
      </StyledExternalLink>
      <StyledButtons>
        <RectangleSkeleton width={"100%"} height={"40px"} />
        <RectangleSkeleton width={"100%"} height={"40px"} />
      </StyledButtons>
    </StyledContainer>
  );
};

SharingPanelLoaderModal.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

SharingPanelLoaderModal.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default SharingPanelLoaderModal;
