import styled, { css } from "styled-components";

const StyledBaseQuotaComponent = styled.div`
  .backup_radio-button {
    margin-top: 16px;
  }
  .radio-button_content {
    margin-top: 16px;
  }
`;
const StyledDiscSpaceUsedComponent = styled.div`
  margin-top: 16px;
  .disk-space_title {
    margin-bottom: 16px;
  }
`;

const StyledDiagramComponent = styled.div`
  .diagram_slider,
  .diagram_description {
    margin-top: 16px;
  }
  .diagram_slider {
    width: 100%;
    max-width: ${(props) => props.maxWidth}px;
    display: flex;
    background: #f3f4f4;
    border-radius: 29px;
  }
  .diagram_description {
    display: flex;

    flex-wrap: wrap;

    .diagram_folder-tag {
      display: flex;
      margin-right: 24px;
      padding-bottom: 8px;
    }
  }
`;

const StyledFolderTagSection = styled.div`
  height: 12px;
  border-right: 1px solid #f3f4f4;
  background: ${(props) => props.color};
  width: ${(props) => props.width + "%"};

  &:first-of-type {
    border-radius: 46px 0px 0px 46px;
  }
`;

const StyledFolderTagColor = styled.div`
  margin: auto 0;

  width: 12px;
  height: 12px;
  background: ${(props) => props.color};
  border-radius: 50%;
  margin-right: 4px;
`;

export {
  StyledBaseQuotaComponent,
  StyledDiscSpaceUsedComponent,
  StyledFolderTagSection,
  StyledFolderTagColor,
  StyledDiagramComponent,
};
