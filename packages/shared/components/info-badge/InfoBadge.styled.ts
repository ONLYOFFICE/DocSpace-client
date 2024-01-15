import styled from "styled-components";

import { Tooltip } from "../tooltip";
import { mobile } from "../../utils/device";
import { Base } from "../../themes";

export const StyledToolTip = styled(Tooltip)`
  .__react_component_tooltip {
    padding: 16px;
    box-shadow: 0px 12px 40px 0px
      ${(props) => props.theme.betaBadgeTooltip.boxShadowColor};

    max-width: 240px;

    @media ${mobile} {
      max-width: calc(100vw - 32px);
    }
  }
`;

StyledToolTip.defaultProps = { theme: Base };

export const InfoBadgeContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InfoBadgeHeader = styled.div`
  display: flex;
  justify-content: space-between;

  .info-badge__close {
    height: 16px;
    width: 16px;
    cursor: pointer;
  }
`;

export const InfoBadgeTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;

  color: ${(props) => props.theme.tooltip.textColor};
`;

InfoBadgeTitle.defaultProps = { theme: Base };

export const InfoBadgeDescription = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 16px;

  > a {
    font-size: 12px;
  }
`;
