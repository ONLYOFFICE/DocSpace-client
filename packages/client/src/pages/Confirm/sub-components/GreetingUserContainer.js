// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
              {t("Common:Back")}
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
          i18nKey="AccountWillBeCreated"
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
