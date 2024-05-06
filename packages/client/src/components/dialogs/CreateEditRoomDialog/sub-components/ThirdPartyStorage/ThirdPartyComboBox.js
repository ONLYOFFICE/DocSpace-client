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

import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";

import { isMobile as isMobileUtil, DomHelpers } from "@docspace/shared/utils";
import { isMobileOnly, isMobile } from "react-device-detect";

import { Button } from "@docspace/shared/components/button";
import { connectedCloudsTypeTitleTranslation as ProviderKeyTranslation } from "@docspace/client/src/helpers/filesUtils";
import { Base } from "@docspace/shared/themes";
import { toastr } from "@docspace/shared/components/toast";
import { ComboBox } from "@docspace/shared/components/combobox";

import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

const StyledStorageLocation = styled.div`
  display: flex;
  flex-direction: column;

  .thirdparty-combobox {
    padding: 0px;

    .dropdown-container {
      border: ${(props) =>
        `1px solid ${props.theme.createEditRoomDialog.thirdpartyStorage.combobox.dropdownBorderColor}`};
    }

    .combo-button {
      padding-left: 8px;
    }
  }

  .set_room_params-thirdparty {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .storage-unavailable {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;

    .drop-down-item_icon {
      svg {
        path[fill] {
          fill: ${(props) => props.theme.dropDownItem.disableColor};
        }

        path[stroke] {
          stroke: ${(props) => props.theme.dropDownItem.disableColor};
        }

        circle[fill] {
          fill: ${(props) => props.theme.dropDownItem.disableColor};
        }

        rect[fill] {
          fill: ${(props) => props.theme.dropDownItem.disableColor};
        }
      }
    }

    color: ${(props) => props.theme.dropDownItem.disableColor};
  }
`;

StyledStorageLocation.defaultProps = { theme: Base };

const services = {
  GoogleDrive: "google",
  Box: "box",
  Dropbox: "dropbox",
  OneDrive: "skydrive",
  Nextcloud: "nextcloud",
  kDrive: "kdrive",
  ownCloud: "owncloud",
  WebDav: "webdav",
};

const ThirdPartyComboBox = ({
  t,

  storageLocation,
  onChangeStorageLocation,
  onChangeProvider,

  connectItems,
  setConnectDialogVisible,
  setRoomCreation,
  saveThirdParty,

  saveThirdpartyResponse,
  setSaveThirdpartyResponse,
  openConnectWindow,
  setConnectItem,
  getOAuthToken,

  setIsOauthWindowOpen,

  isDisabled,
}) => {
  const deafultSelectedItem = {
    key: "length",
    label:
      storageLocation?.provider?.title ||
      t("ThirdPartyStorageComboBoxPlaceholder"),
  };

  const [selectedItem, setSelectedItem] = useState(deafultSelectedItem);

  const thirdparties = connectItems.map((item) => ({
    ...item,
    title: ProviderKeyTranslation(item.providerKey, t),
  }));

  const setStorageLocaiton = (thirparty, isConnected) => {
    if (!isConnected) {
      window.open(
        `/portal-settings/integration/third-party-services?service=${services[thirparty.id]}`,
        "_blank",
      );
      return;
    }
    onChangeProvider(thirparty);
  };

  const onShowService = async () => {
    setRoomCreation(true);
    const provider = storageLocation.provider;

    if (storageLocation.provider.isOauth) {
      setIsOauthWindowOpen(true);
      const authModal = window.open(
        "",
        t("Common:Authorization"),
        "height=600, width=1020",
      );
      openConnectWindow(provider.providerKey, authModal).then((modal) =>
        getOAuthToken(modal)
          .then((token) =>
            saveThirdParty(
              provider.oauthHref,
              "",
              "",
              token,
              false,
              ProviderKeyTranslation(provider.providerKey, t),
              provider.providerKey,
              null,
              true,
            ).then((res) => setSaveThirdpartyResponse(res)),
          )
          .catch((e) => {
            if (!e) return;
            toastr.error(e);
            console.error(e);
          })
          .finally(() => {
            authModal.close();
            setIsOauthWindowOpen(false);
          }),
      );
    } else {
      const providerTitle = ProviderKeyTranslation(provider.providerKey, t);
      setConnectItem({
        title: providerTitle,
        customer_title: providerTitle,
        provider_key: provider.providerKey,
      });
      setConnectDialogVisible(true);
    }
  };

  useEffect(() => {
    if (!saveThirdpartyResponse?.id) return;
    onChangeStorageLocation({
      ...storageLocation,
      thirdpartyAccount: saveThirdpartyResponse,
      storageFolderId: saveThirdpartyResponse.id,
    });
    setSaveThirdpartyResponse(null);
  }, [saveThirdpartyResponse]);

  const options = thirdparties
    .sort((storage) => (storage.isConnected ? -1 : 1))
    .map((item) => ({
      label:
        item.title + (item.isConnected ? "" : ` (${t("ActivationRequired")})`),
      title: item.title,
      key: item.id,
      icon: item.isConnected ? undefined : ExternalLinkReactSvgUrl,
      className: item.isConnected ? "" : "storage-unavailable",
    }));

  const onSelect = (elem) => {
    const thirdparty = thirdparties.find((t) => {
      return elem.key === t.id;
    });

    thirdparty && setStorageLocaiton(thirdparty, thirdparty.isConnected);
    thirdparty.isConnected
      ? setSelectedItem(elem)
      : setSelectedItem({ ...deafultSelectedItem });
  };

  return (
    <StyledStorageLocation>
      <div className="set_room_params-thirdparty">
        <ComboBox
          className="thirdparty-combobox"
          selectedOption={selectedItem}
          options={options}
          scaled
          withBackdrop={isMobile}
          size="content"
          manualWidth={"fit-content"}
          isMobileView={isMobileOnly}
          directionY="both"
          displaySelectedOption
          noBorder={false}
          fixedDirection
          isDefaultMode={false}
          hideMobileView={false}
          forceCloseClickOutside
          scaledOptions
          onSelect={onSelect}
        />
        <Button
          id="shared_third-party-storage_connect"
          isDisabled={
            !storageLocation?.provider ||
            !!storageLocation?.thirdpartyAccount ||
            isDisabled
          }
          className="set_room_params-thirdparty-connect"
          size="small"
          label={t("Common:Connect")}
          onClick={onShowService}
        />
      </div>
    </StyledStorageLocation>
  );
};

export default ThirdPartyComboBox;
