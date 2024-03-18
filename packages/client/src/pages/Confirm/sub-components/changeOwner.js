// (c) Copyright Ascensio System SIA 2010-2024
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

import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { inject, observer } from "mobx-react";
import {
  StyledPage,
  StyledBody,
  ButtonsWrapper,
  StyledContent,
} from "./StyledConfirm";
import withLoader from "../withLoader";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { toastr } from "@docspace/shared/components/toast";
import DocspaceLogo from "../../../components/DocspaceLogoWrapper";
import { ownerChange } from "@docspace/shared/api/settings";
import { getUserFromConfirm } from "@docspace/shared/api/people";

const ChangeOwnerForm = (props) => {
  const { t, greetingTitle, linkData, history } = props;
  const [newOwner, setNewOwner] = useState("");
  const [isOwnerChanged, setIsOwnerChanged] = useState(false);

  const navigate = useNavigate();
  const ownerId = linkData.uid;

  useEffect(() => {
    const fetchData = async () => {
      const confirmKey = linkData.confirmHeader;
      const user = await getUserFromConfirm(ownerId, confirmKey);
      setNewOwner(user?.displayName);
    };

    fetchData();
  }, []);

  const onChangeOwnerClick = async () => {
    try {
      await ownerChange(ownerId, linkData.confirmHeader);
      setIsOwnerChanged(true);
      setTimeout(() => (location.href = "/"), 10000);
    } catch (error) {
      toastr.error(e);
      console.error(error);
    }
  };

  const onCancelClick = () => {
    navigate("/");
  };

  return (
    <StyledPage>
      <StyledContent>
        <StyledBody>
          <DocspaceLogo className="docspace-logo" />
          <Text fontSize="23px" fontWeight="700" className="title">
            {greetingTitle}
          </Text>

          <FormWrapper>
            {isOwnerChanged ? (
              <Text>{t("ConfirmOwnerPortalSuccessMessage")}</Text>
            ) : (
              <>
                <Text className="subtitle">
                  {t("ConfirmOwnerPortalTitle", { newOwner: newOwner })}
                </Text>
                <ButtonsWrapper>
                  <Button
                    primary
                    scale
                    size="medium"
                    label={t("Common:SaveButton")}
                    tabIndex={2}
                    isDisabled={false}
                    onClick={onChangeOwnerClick}
                  />
                  <Button
                    scale
                    size="medium"
                    label={t("Common:CancelButton")}
                    tabIndex={2}
                    isDisabled={false}
                    onClick={onCancelClick}
                  />
                </ButtonsWrapper>
              </>
            )}
          </FormWrapper>
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ settingsStore }) => ({
  greetingTitle: settingsStore.greetingSettings,
  defaultPage: settingsStore.defaultPage,
}))(
  withTranslation(["Confirm", "Common"])(withLoader(observer(ChangeOwnerForm)))
);
