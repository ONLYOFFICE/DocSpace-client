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
    <>
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
      </Box>
    </>
  );
};

export default FileUpload;
