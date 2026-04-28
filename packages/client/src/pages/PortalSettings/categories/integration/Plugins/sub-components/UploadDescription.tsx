import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import styles from "../Plugins.module.scss";
import { UploadDecsriptionProps } from "../Plugins.types";
import { getBrandName } from "@docspace/shared/constants/brands";

const UploadDescription = ({
  pluginsSdkUrl,
  currentColorScheme,
  t,
}: UploadDecsriptionProps) => {
  return (
    <div className={styles.uploadDescription}>
      <Text className={styles.uploadDescriptionText}>
        {t("UploadDescription", { productName: getBrandName("ProductName") })}
      </Text>
      {pluginsSdkUrl ? (
        <Link
          className="link-learn-more"
          color={currentColorScheme?.main?.accent ?? undefined}
          isHovered
          target={LinkTarget.blank}
          href={pluginsSdkUrl}
          dataTestId="api_plugins_sdk_link"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}
    </div>
  );
};

export default UploadDescription;
