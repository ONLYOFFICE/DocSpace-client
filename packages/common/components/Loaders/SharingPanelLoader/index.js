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
} from "./StyledSharingPanel";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const SharingPanelLoader = ({ id, className, style, ...rest }) => {
  return (
    <StyledContainer>
      <StyledHeader>
        <RectangleSkeleton width={"283px"} height={"29px"} />
        <RectangleSkeleton width={"48px"} height={"29px"} />
      </StyledHeader>

      <StyledExternalLink>
        <RectangleSkeleton
          className="rectangle-loader"
          width={"146px"}
          height={"22px"}
        />
        <RectangleSkeleton
          className="rectangle-loader"
          width={"448px"}
          height={"32px"}
        />
        <RectangleSkeleton width={"184px"} height={"20px"} />
      </StyledExternalLink>

      <StyledInternalLink>
        <RectangleSkeleton width={"99px"} height={"22px"} />
        <RectangleSkeleton width={"30px"} height={"22px"} />
      </StyledInternalLink>

      <StyledOwner>
        <div className="owner-info">
          <RectangleSkeleton
            width={"32px"}
            height={"32px"}
            borderRadius={"1000px"}
          />
          <RectangleSkeleton width={"91px"} height={"16px"} />
        </div>
        <RectangleSkeleton width={"91px"} height={"16px"} />
      </StyledOwner>

      <StyledBody>
        <StyledItem>
          <div className="item-info">
            <RectangleSkeleton
              width={"32px"}
              height={"32px"}
              borderRadius={"1000px"}
            />
            <RectangleSkeleton width={"91px"} height={"16px"} />
          </div>
          <RectangleSkeleton width={"45px"} height={"32px"} />
        </StyledItem>
        <StyledItem>
          <div className="item-info">
            <RectangleSkeleton
              width={"32px"}
              height={"32px"}
              borderRadius={"1000px"}
            />
            <RectangleSkeleton width={"91px"} height={"16px"} />
          </div>
          <RectangleSkeleton width={"45px"} height={"32px"} />
        </StyledItem>
        <StyledItem>
          <div className="item-info">
            <RectangleSkeleton
              width={"32px"}
              height={"32px"}
              borderRadius={"1000px"}
            />
            <RectangleSkeleton width={"91px"} height={"16px"} />
          </div>
          <RectangleSkeleton width={"45px"} height={"32px"} />
        </StyledItem>
        <StyledItem>
          <div className="item-info">
            <RectangleSkeleton
              width={"32px"}
              height={"32px"}
              borderRadius={"1000px"}
            />
            <RectangleSkeleton width={"91px"} height={"16px"} />
          </div>
          <RectangleSkeleton width={"45px"} height={"32px"} />
        </StyledItem>
        <StyledItem>
          <div className="item-info">
            <RectangleSkeleton
              width={"32px"}
              height={"32px"}
              borderRadius={"1000px"}
            />
            <RectangleSkeleton width={"91px"} height={"16px"} />
          </div>
          <RectangleSkeleton width={"45px"} height={"32px"} />
        </StyledItem>
        <StyledItem>
          <div className="item-info">
            <RectangleSkeleton
              width={"32px"}
              height={"32px"}
              borderRadius={"1000px"}
            />
            <RectangleSkeleton width={"91px"} height={"16px"} />
          </div>
          <RectangleSkeleton width={"45px"} height={"32px"} />
        </StyledItem>
      </StyledBody>
    </StyledContainer>
  );
};

SharingPanelLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

SharingPanelLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default SharingPanelLoader;
