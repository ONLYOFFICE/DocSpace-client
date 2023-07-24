import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import FileInput from "@docspace/components/file-input";

const FileUpload = ({ t, setShowReminder }) => {
  const onClickInput = (file) => {
    let data = new FormData();
    data.append("file", file);
    setShowReminder(true);
  };

  return (
    <Box className="description-wrapper">
      <Text className="step-description">
        {t("Settings:SelectFileDescription")}
      </Text>
      <Box className="select-file-wrapper">
        <Text className="choose-backup-file">
          {t("Settings:ChooseBackupFile")}
        </Text>
        <FileInput
          onInput={onClickInput}
          className="upload-backup-input"
          placeholder={t("Settings:BackupFile")}
          scale
        />
      </Box>
    </Box>
  );
};

export default FileUpload;
