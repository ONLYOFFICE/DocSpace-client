import styled from "styled-components";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Base } from "@docspace/shared/themes";

const StyledUserSessionsPanel = styled.div`
  .user-sessions-panel {
    .scroll-body {
      padding-right: 0px !important;
    }
  }

  .user-sessions-header {
    padding: 0px 16px;
    border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

    .header-text {
      font-weight: 700;
      font-size: 21px;
      margin: 12px 0px;
    }
  }
`;

const StyledScrollbar = styled(Scrollbar)`
  position: relative;
  padding: 16px 0;
  height: calc(100vh - 87px) !important;
`;

StyledUserSessionsPanel.defaultProps = { theme: Base };

export { StyledUserSessionsPanel, StyledScrollbar };
