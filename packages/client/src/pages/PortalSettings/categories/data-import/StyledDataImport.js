import styled from "styled-components";
import { tablet, mobile } from "@docspace/shared/utils/device";

const WorkspacesContainer = styled.div`
  max-width: 700px;
  margin-top: 1px;

  @media ${tablet} {
    max-width: 675px;
  }

  @media ${mobile} {
    max-width: 100%;
  }

  .data-import-description {
    color: ${(props) => props.theme.client.settings.migration.descriptionColor};
    line-height: 20px;
    margin-bottom: 20px;
    max-width: 675px;
  }

  .data-import-subtitle {
    margin-bottom: 21px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .workspace-list {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 20px;
  }

  .workspace-item {
    background: ${(props) =>
      props.theme.client.settings.migration.workspaceBackground};
    border: ${(props) => props.theme.client.settings.migration.workspaceBorder};
    border-radius: 6px;
    width: 340px;
    height: 64px;
    box-sizing: border-box;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      border-color: #4781d1;
    }

    &:active {
      background-color: ${(props) =>
        props.theme.client.settings.migration.workspaceBackground};
    }

    @media ${tablet} {
      width: 327.5px;
    }

    @media ${mobile} {
      width: 100%;
    }

    .workspace-logo {
      display: flex;
      align-items: center;
    }
  }
`;

export { WorkspacesContainer };
