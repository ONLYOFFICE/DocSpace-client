import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { mobile } from "@docspace/components/utils/device";
import styled from "styled-components";

import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import FileInput from "@docspace/components/file-input";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";

const WorkspaceWrapper = styled.div`
  max-width: 700px;

  @media ${mobile} {
    max-width: 343px;
  }

  .data-import-description {
    color: #657077;
    line-height: 20px;
    margin-bottom: 20px;
  }

  .select-file-counter {
    margin-right: 5px;
    font-weight: 700;
    font-size: 16px;
  }

  .select-file-wrapper {
    max-width: 350px;
  }

  .select-file-description {
    font-size: 12px;
    margin-bottom: 16px;
    line-height: 16px;
    color: #333333;
  }

  .select-file-title {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .upload-backup-input {
    height: 32px;
    margin-bottom: 16px;
  }
`;

const GoogleWorkspace = (props) => {
  const { t } = props;

  const onClickInput = (file) => {
    let data = new FormData();
    data.append("file", file);

    console.log(data);
  };

  if (isMobile)
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;

  return (
    <WorkspaceWrapper>
      <Text className="data-import-description">
        {t("Settings:AboutDataImport")}
      </Text>
      <Box displayProp="flex" marginProp="0 0 8px">
        <Text className="select-file-counter">1/6.</Text>
        <Text isBold fontSize="16px">
          {t("Common:SelectFile")}
        </Text>
      </Box>
      <Text className="select-file-description">
        {t("Settings:SelectFileDescription")}
      </Text>

      <Box className="select-file-wrapper">
        <Text className="select-file-title">
          {t("Settings:SelectFileTitle")}
        </Text>
        <FileInput
          onInput={onClickInput}
          className="upload-backup-input"
          placeholder={t("Settings:BackupFile")}
          scale
        />
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={() => console.log("save")}
          onCancelClick={() => console.log("cancel")}
          showReminder={false}
          reminderTest={t("Settings:YouHaveUnsavedChanges")}
          saveButtonLabel={t("Settings:UploadToServer")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
      </Box>
    </WorkspaceWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Common, Settings"])(observer(GoogleWorkspace)));
