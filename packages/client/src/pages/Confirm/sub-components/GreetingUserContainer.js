import { useTranslation, Trans } from "react-i18next";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";

import ArrowIcon from "PUBLIC_DIR/images/arrow.left.react.svg?url";

const DEFAULT_CREATION_TEXT =
  "A DocSpace account will be created for {{email}}. Please, complete your registration:";

const GreetingUserContainer = ({
  email,
  onClickBack,
  emailFromLink,
  type,
  defaultText,
}) => {
  const { t } = useTranslation(["Confirm", "Common"]);

  return (
    <div className="greeting-container">
      <div className="back-sign-in-container">
        {type === "LinkInvite" && !emailFromLink && (
          <div className="back-button">
            <IconButton size={16} iconName={ArrowIcon} onClick={onClickBack} />
            <Text fontWeight={600} onClick={onClickBack}>
              {t("Back")}
            </Text>
          </div>
        )}

        <Text fontWeight={600} fontSize={"16px"}>
          {t("SignUp")}
        </Text>
      </div>
      <Text>
        <Trans
          t={t}
          i18nKey={"AccountWillBeCreated"}
          ns="Confirm"
          defaults={DEFAULT_CREATION_TEXT}
          values={{
            email,
          }}
          components={{
            1: <ColorTheme tag="a" themeId={ThemeId.Link} isHovered={false} />,
          }}
        />
      </Text>
    </div>
  );
};

export default GreetingUserContainer;
