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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { EmptyServerErrorContainer } from "SRC_DIR/components/EmptyContainer/EmptyServerErrorContainer";
import {
  changeApiKeyStatus,
  deleteApiKey,
} from "@docspace/shared/api/api-keys";
import {
  TApiKey,
  TApiKeyParamsRequest,
} from "@docspace/shared/api/api-keys/types";
import { isMobile } from "@docspace/shared/utils";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import CreateApiKeyDialog from "./sub-components/CreateApiKeyDialog";
import DeleteApiKeyDialog from "./sub-components/DeleteApiKeyDialog";
import ApiKeysView from "./sub-components";
import { ApiKeysProps } from "./types";
import { StyledApiKeys, StyledMobileButton } from "./StyledApiKeys";

const ApiKeys = (props: ApiKeysProps) => {
  const {
    viewAs,
    currentColorScheme,
    apiKeysLink,
    isUser,
    apiKeys,
    setApiKeys,
    permissions,
    error,
  } = props;

  const { t, ready } = useTranslation(["Settings", "Common"]);

  const [createKeyDialogIsVisible, setCreateKeyDialogIsVisible] =
    useState(false);
  const [deleteKeyDialogIsVisible, setDeleteKeyDialogIsVisible] =
    useState(false);
  const [actionItem, setActionItem] = useState<TApiKey | null>(null);
  const [isRequestRunning, setIsRequestRunning] = useState(false);

  const onDeleteApiKey = (id: TApiKey["id"]) => {
    const itemIndex = apiKeys.findIndex((x) => x.id === id);
    if (itemIndex > -1) {
      setActionItem(apiKeys[itemIndex]);
    }

    setDeleteKeyDialogIsVisible(true);
  };

  const onDelete = () => {
    if (!actionItem) return;
    setIsRequestRunning(true);
    deleteApiKey(actionItem.id)
      .then((res) => {
        if (res) {
          setApiKeys((prev) => prev.filter((k) => k.id !== actionItem.id));
          toastr.success(t("Settings:SecretKeyDeleted"));
        }
      })
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsRequestRunning(false);
        setDeleteKeyDialogIsVisible(false);
        setActionItem(null);
      });
  };

  const onChangeApiKeyParams = (
    id: TApiKey["id"],
    params: TApiKeyParamsRequest,
  ) => {
    setIsRequestRunning(true);
    changeApiKeyStatus(id, params)
      .then((res) => {
        if (res) {
          const items = apiKeys.slice();
          const index = items.findIndex((x) => x.id === id);
          if (index > -1) {
            if (params.isActive !== undefined) {
              items[index].isActive = params.isActive;
            }
            if (params.name) {
              items[index].name = params.name;
            }
            if (params.permissions?.length) {
              items[index].permissions = params.permissions;
            }
          }

          setApiKeys(items);
          toastr.success(t("Settings:SecretKeyEdited"));
        }
      })
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsRequestRunning(false);
        setCreateKeyDialogIsVisible(false);
        setActionItem(null);
      });
  };

  const onEditApiKey = (id: TApiKey["id"]) => {
    const itemIndex = apiKeys.findIndex((x) => x.id === id);
    if (itemIndex > -1) {
      setActionItem(apiKeys[itemIndex]);
      setCreateKeyDialogIsVisible(true);
    }
  };

  useEffect(() => {
    if (ready) {
      setDocumentTitle(t("Settings:ApiKeys"));
    }
  }, [ready]);

  return (
    <StyledApiKeys>
      <div
        className={classNames("api-keys_description", {
          withEmptyScreen: !!error,
        })}
      >
        <Text lineHeight="20px" className="api-keys_text">
          {t("Settings:ApiKeysDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        <Text className="api-keys_text api-keys_description-text">
          {t("Settings:ApiKeysShareDescription")}
        </Text>

        <Text className="api-keys_text api-keys_usage-text">
          {t("Settings:ApiKeyViewUsage")}
        </Text>
        <Link
          isHovered
          color={currentColorScheme?.main?.accent}
          fontSize="13px"
          fontWeight={600}
          onClick={() => window.open(apiKeysLink, "_blank")}
          dataTestId="api_guide_link"
        >
          {t("Settings:APIGuide")}
        </Link>
      </div>
      <div>
        {error ? (
          <EmptyServerErrorContainer />
        ) : (
          <>
            {isMobile() ? (
              <StyledMobileButton>
                <Button
                  onClick={() => setCreateKeyDialogIsVisible(true)}
                  label={t("Settings:CreateNewSecretKey")}
                  primary
                  size={ButtonSize.normal}
                  scale
                  testId="create_new_secret_key_button"
                />
              </StyledMobileButton>
            ) : (
              <Button
                onClick={() => setCreateKeyDialogIsVisible(true)}
                label={t("Settings:CreateNewSecretKey")}
                primary
                size={ButtonSize.small}
                testId="create_new_secret_key_button"
              />
            )}
            <div>
              {apiKeys.length ? (
                <ApiKeysView
                  items={apiKeys}
                  viewAs={viewAs}
                  onDeleteApiKey={onDeleteApiKey}
                  onChangeApiKeyParams={onChangeApiKeyParams}
                  onEditApiKey={onEditApiKey}
                  permissions={permissions}
                />
              ) : null}
            </div>
          </>
        )}
      </div>
      {createKeyDialogIsVisible ? (
        <CreateApiKeyDialog
          isVisible={createKeyDialogIsVisible}
          setIsVisible={setCreateKeyDialogIsVisible}
          setListItems={setApiKeys}
          permissions={permissions}
          setActionItem={setActionItem}
          actionItem={actionItem}
          onChangeApiKeyParams={onChangeApiKeyParams}
          isRequestRunning={isRequestRunning}
          isUser={isUser}
        />
      ) : null}

      {deleteKeyDialogIsVisible ? (
        <DeleteApiKeyDialog
          isVisible={deleteKeyDialogIsVisible}
          onClose={() => {
            setDeleteKeyDialogIsVisible(false);
            setActionItem(null);
          }}
          onDelete={onDelete}
          isRequestRunning={isRequestRunning}
        />
      ) : null}
    </StyledApiKeys>
  );
};

export default inject(({ setup, settingsStore, userStore }: TStore) => {
  const { viewAs } = setup;
  const {
    currentColorScheme,
    apiKeysLink,
    apiKeys,
    permissions,
    errorKeys: error,
    setApiKeys,
  } = settingsStore;
  const { user } = userStore;

  return {
    viewAs,
    currentColorScheme,
    apiKeysLink,
    isUser: user?.isCollaborator,
    apiKeys,
    permissions,
    error,
    setApiKeys,
  };
})(observer(ApiKeys));
