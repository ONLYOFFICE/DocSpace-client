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
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import {
  changeApiKeyStatus,
  deleteApiKey,
  getApiKeyPermissions,
  getApiKeys,
} from "@docspace/shared/api/api-keys";
import {
  TApiKey,
  TApiKeyParamsRequest,
} from "@docspace/shared/api/api-keys/types";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import CreateApiKeyDialog from "./sub-components/CreateApiKeyDialog";
import RenameApiKeyDialog from "./sub-components/RenameApiKeyDialog";
import DeleteApiKeyDialog from "./sub-components/DeleteApiKeyDialog";
import ApiKeysView from "./sub-components";
import { ApiKeysProps } from "./types";

const StyledApiKeys = styled.div`
  width: 100%;

  .api-keys_description {
    box-sizing: border-box;
    max-width: 700px;
    margin-bottom: 25px;

    .api-keys_text {
      color: ${(props) => props.theme.client.settings.common.descriptionColor};
    }

    .api-keys_description-text {
      line-height: 20px;
      margin-bottom: 20px;
    }

    .api-keys_usage-text {
      margin-bottom: 8px;
    }
  }
`;

const ApiKeys = (props: ApiKeysProps) => {
  const { t, viewAs, currentColorScheme } = props;

  const [listItems, setListItems] = useState<TApiKey[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [createKeyDialogIsVisible, setCreateKeyDialogIsVisible] =
    useState(false);
  const [renameKeyDialogIsVisible, setRenameKeyDialogIsVisible] =
    useState(false);
  const [deleteKeyDialogIsVisible, setDeleteKeyDialogIsVisible] =
    useState(false);
  const [actionItem, setActionItem] = useState<TApiKey | null>(null);

  const [isRequestRunning, setIsRequestRunning] = useState(false);

  const onRenameApiKey = (id: TApiKey["id"]) => {
    const itemIndex = listItems.findIndex((x) => x.id === id);
    if (itemIndex > -1) {
      setActionItem(listItems[itemIndex]);
    }

    setRenameKeyDialogIsVisible(true);
  };

  const onDeleteApiKey = (id: TApiKey["id"]) => {
    const itemIndex = listItems.findIndex((x) => x.id === id);
    if (itemIndex > -1) {
      setActionItem(listItems[itemIndex]);
    }

    setDeleteKeyDialogIsVisible(true);
  };

  const onDelete = () => {
    if (!actionItem) return;
    setIsRequestRunning(true);
    deleteApiKey(actionItem.id)
      .then((res) => {
        if (res)
          setListItems((prev) => prev.filter((k) => k.id !== actionItem.id));
      })
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsRequestRunning(false);
        setDeleteKeyDialogIsVisible(false);
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
          const items = listItems.slice();
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

          setListItems(items);
        }
      })
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsRequestRunning(false);
        setRenameKeyDialogIsVisible(false);
        setCreateKeyDialogIsVisible(false);
        setActionItem(null);
      });
  };

  const onEditApiKey = (id: TApiKey["id"]) => {
    const itemIndex = listItems.findIndex((x) => x.id === id);
    if (itemIndex > -1) {
      setActionItem(listItems[itemIndex]);
      setCreateKeyDialogIsVisible(true);
    }
  };

  const getKeys = async () => {
    await Promise.all([getApiKeys(), getApiKeyPermissions()])
      .then(([keys, permissionsData]) => {
        setListItems(keys);
        setPermissions(permissionsData);
      })
      .catch((err) => toastr.error(err));
  };

  useEffect(() => {
    getKeys();
  }, []);

  useEffect(() => {
    setDocumentTitle(t("Settings:ApiKeys"));
  }, []);

  return (
    <StyledApiKeys>
      <div className="api-keys_description">
        <Text className="api-keys_text api-keys_description-text">
          {t("Settings:ApiKeysDescription")}
        </Text>

        <Text className="api-keys_text api-keys_usage-text">
          {t("Settings:ApiKeyViewUsage")}
        </Text>
        <Link
          isHovered
          color={currentColorScheme?.main?.accent}
          fontSize="13px"
          fontWeight={600}
        >
          {t("Settings:APIGuide")}
        </Link>
      </div>
      <div>
        <Button
          onClick={() => setCreateKeyDialogIsVisible(true)}
          label={t("Settings:CreateNewSecretKey")}
          primary
          size={ButtonSize.small}
        />
        <div>
          {listItems.length ? (
            <ApiKeysView
              items={listItems}
              viewAs={viewAs}
              onDeleteApiKey={onDeleteApiKey}
              onChangeApiKeyParams={onChangeApiKeyParams}
              onRenameApiKey={onRenameApiKey}
              onEditApiKey={onEditApiKey}
              permissions={permissions}
            />
          ) : null}
        </div>
      </div>
      {createKeyDialogIsVisible ? (
        <CreateApiKeyDialog
          isVisible={createKeyDialogIsVisible}
          setIsVisible={setCreateKeyDialogIsVisible}
          setListItems={setListItems}
          permissions={permissions}
          setActionItem={setActionItem}
          actionItem={actionItem}
          onChangeApiKeyParams={onChangeApiKeyParams}
          isRequestRunning={isRequestRunning}
        />
      ) : null}
      {renameKeyDialogIsVisible && actionItem ? (
        <RenameApiKeyDialog
          isVisible={renameKeyDialogIsVisible}
          setIsVisible={setRenameKeyDialogIsVisible}
          setListItems={setListItems}
          item={actionItem}
          onChangeApiKeyParams={onChangeApiKeyParams}
          isRequestRunning={isRequestRunning}
        />
      ) : null}
      {deleteKeyDialogIsVisible ? (
        <DeleteApiKeyDialog
          isVisible={deleteKeyDialogIsVisible}
          setIsVisible={setDeleteKeyDialogIsVisible}
          onDelete={onDelete}
          isRequestRunning={isRequestRunning}
        />
      ) : null}
    </StyledApiKeys>
  );
};

export default inject(({ setup, settingsStore }: TStore) => {
  const { viewAs } = setup;
  const { currentColorScheme } = settingsStore;

  return {
    viewAs,
    currentColorScheme,
  };
})(withTranslation(["Settings", "Common"])(observer(ApiKeys)));
