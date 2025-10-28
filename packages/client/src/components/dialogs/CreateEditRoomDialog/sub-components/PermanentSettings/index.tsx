// (c) Copyright Ascensio System SIA 2009-2025
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

// import SecuritySvgUrl from "PUBLIC_DIR/images/security.svg?url";
import styled from "styled-components";
import { Trans } from "react-i18next";
import { TFunction } from "i18next";

import { TRoomStorageLocation } from "@docspace/shared/utils/rooms";

import { connectedCloudsTypeTitleTranslation as getProviderTypeTitle } from "SRC_DIR/helpers/filesUtils";

import PermanentSetting from "./PermanentSetting";

const StyledPermanentSettings = styled.div<{ displayNone: boolean }>`
  display: ${(props) => (props.displayNone ? "none" : "flex")};
  flex-direction: row;
  gap: 8px;
  margin-top: -12px;
`;

type PermanentSettingsProps = {
  t: TFunction;
  isThirdparty: boolean;
  storageLocation: TRoomStorageLocation;
};

const PermanentSettings = ({
  t,
  isThirdparty,
  storageLocation,
}: PermanentSettingsProps) => {
  const thirdpartyTitle = getProviderTypeTitle(storageLocation?.providerKey, t);
  const thirdpartyFolderName = isThirdparty ? storageLocation?.title : "";
  const thirdpartyPath = "";

  return (
    <StyledPermanentSettings displayNone={!isThirdparty}>
      {isThirdparty ? (
        <PermanentSetting
          type="storageLocation"
          icon={storageLocation.iconSrc}
          title={thirdpartyTitle}
          isFull={false}
          content={
            <Trans
              i18nKey="ThirdPartyStoragePermanentSettingDescription"
              ns="CreateEditRoomDialog"
              t={t}
              values={{
                thirdpartyTitle,
                thirdpartyFolderName,
                thirdpartyPath,
              }}
              components={{ strong: <strong /> }}
            />
          }
        />
      ) : null}
    </StyledPermanentSettings>
  );
};

export default PermanentSettings;
