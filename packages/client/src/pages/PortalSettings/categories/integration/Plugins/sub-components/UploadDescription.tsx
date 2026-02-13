import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget } from "@docspace/shared/components/link";
import { StyledUploadDescription } from "../Plugins.styled";
import { UploadDecsriptionProps } from "../Plugins.types";

const UploadDescription = ({
  pluginsSdkUrl,
  currentColorScheme,
  t,
}: UploadDecsriptionProps) => {
  return (
    <StyledUploadDescription>
      <Text className="upload-description-text">
        {t("UploadDescription", { productName: t("Common:ProductName") })}
      </Text>
      {pluginsSdkUrl ? (
        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          isHovered
          target={LinkTarget.blank}
          href={pluginsSdkUrl}
          dataTestId="api_plugins_sdk_link"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}
    </StyledUploadDescription>
  );
};

export default UploadDescription;
