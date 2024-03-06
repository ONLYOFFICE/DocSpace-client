import styled from "styled-components";

import { Base } from "../../themes";

const StyledPublicRoomBar = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.infoBlock.background};
  color: #333;
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 10px;

  .text-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .header-body {
    display: flex;
    height: fit-content;
    width: 100%;
    gap: 8px;
    font-weight: 600;
  }

  .text-container_header {
    color: ${(props) => props.theme.infoBlock.headerColor};
  }

  .text-container_body {
    color: ${(props) => props.theme.infoBlock.descriptionColor};
  }

  .close-icon {
    margin: -5px -17px 0 0;

    path {
      fill: ${({ theme }) => theme.iconButton.color};
    }

    svg {
      weight: 8px;
      height: 8px;
    }
  }
`;

StyledPublicRoomBar.defaultProps = { theme: Base };

export { StyledPublicRoomBar };
