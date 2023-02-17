import styled, { css } from "styled-components";

const StyledBaseQuotaComponent = styled.div`
  .backup_radio-button {
    margin-top: 16px;
  }
  .radio-button_content {
    margin-top: 16px;
  }
  .setting_quota {
    display: flex;
    grid-gap: 4px;

    .quota_limit {
      max-width: 50px;
      max-height: 32px;
    }
    .quota_value {
      max-width: fit-content;
      padding: 0;
    }
  }
`;
const StyledDiscSpaceUsedComponent = styled.div`
  margin-top: 16px;

  .disk-space_slider,
  .disk-space_description {
    margin-top: 16px;
  }
  .disk-space_slider {
    width: 300px;
    display: flex;
    background: #f3f4f4;
    border-radius: 29px;
  }
  .disk-space_description {
    display: flex;

    flex-wrap: wrap;

    .disk-space_folder-tag {
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
};
