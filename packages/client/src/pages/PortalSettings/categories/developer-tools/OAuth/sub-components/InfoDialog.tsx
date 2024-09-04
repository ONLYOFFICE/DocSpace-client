import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { IClientProps, TScope } from "@docspace/shared/utils/oauth/types";
import ScopeList from "@docspace/shared/utils/oauth/ScopeList";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";
import { getCookie } from "@docspace/shared/utils/cookie";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ModalDialogType } from "@docspace/shared/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/shared/components/text";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Base } from "@docspace/shared/themes";
import { TTranslation } from "@docspace/shared/types";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import { Tag } from "@docspace/shared/components/tag";

const StyledContainer = styled.div<{
  showDescription: boolean;
  withShowText: boolean;
}>`
  width: 100%;
  height: 100%;

  box-sizing: border-box;

  padding-top: 8px;

  display: flex;
  flex-direction: column;

  .client-block {
    width: 100%;
    height: 32px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 12px;

    .client-block__info {
      width: 100%;

      display: flex;
      flex-direction: row;
      align-items: center;

      gap: 8px;

      .client-block__info-logo {
        width: 32px;
        height: 32px;

        max-width: 32px;
        max-height: 32px;

        border-radius: 3px;
      }
    }
  }

  .description {
    max-height: ${(props) =>
      props.showDescription ? "100%" : props.withShowText ? "100px" : "100%"};

    overflow: hidden;

    margin-bottom: ${(props) => (props.withShowText ? "4px" : 0)};
  }

  .desc-link {
    color: ${(props) => props.theme.oauth.infoDialog.descLinkColor};
  }

  .block-header {
    margin-top: 20px;
    margin-bottom: 12px;

    color: ${(props) => props.theme.oauth.infoDialog.blockHeaderColor};
  }

  .creator-block {
    margin: 8px 0;

    display: flex;
    flex-direction: row;
    align-items: center;

    gap: 8px;
  }

  .privacy-block {
    display: flex;

    .separator {
      display: inline-block;

      margin-top: 2px;

      height: 16px;
      width: 1px;

      margin: 0 8px;

      background: ${(props) => props.theme.oauth.infoDialog.separatorColor};
    }
  }

  .property-tag_list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .property-tag {
      max-width: 195px;
      margin: 0;
      background: ${(props) => props.theme.infoPanel.details.tagBackground};
      p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`;

StyledContainer.defaultProps = { theme: Base };

interface InfoDialogProps {
  visible: boolean;
  scopeList?: TScope[];

  setInfoDialogVisible?: (value: boolean) => void;
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
    isInfo?: boolean,
    isSettings?: boolean,
  ) => ContextMenuModel[];

  client?: IClientProps;
  isProfile?: boolean;
}

const InfoDialog = ({
  visible,

  client,
  scopeList,

  setInfoDialogVisible,
  getContextMenuItems,

  isProfile,
}: InfoDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const [showDescription, setShowDescription] = React.useState(false);
  const [isRender, setIsRender] = React.useState(false);
  const [withShowText, setWithShowText] = React.useState(false);

  React.useEffect(() => {
    setIsRender(true);
  }, []);

  React.useEffect(() => {
    const el = document.getElementById("client-info-description-text");
    if (!el) return;

    setWithShowText(el?.offsetHeight >= 100);
  }, [isRender]);

  const getContextOptions = () => {
    const contextOptions =
      client && getContextMenuItems
        ? getContextMenuItems(t, client, true, !isProfile)
        : [];

    return contextOptions;
  };

  const onClose = () => {
    setInfoDialogVisible?.(false);
  };

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale || "", client?.modifiedOn || "");

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={onClose}
    >
      <ModalDialog.Header>{t("Common:Info")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledContainer
          showDescription={showDescription}
          withShowText={withShowText}
        >
          <div className="client-block">
            <div className="client-block__info">
              <img
                className="client-block__info-logo"
                alt="client-logo"
                src={client?.logo}
              />

              <Text
                fontSize="16px"
                lineHeight="22px"
                fontWeight="700"
                noSelect
                truncate
              >
                {client?.name}
              </Text>
            </div>

            <ContextMenuButton
              displayType={ContextMenuButtonDisplayType.dropdown}
              getData={getContextOptions}
            />
          </div>
          {!isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
                truncate
              >
                {t("Creator")}
              </Text>
              <div className="creator-block">
                <Avatar
                  source={client?.creatorAvatar || ""}
                  size={AvatarSize.min}
                  role={AvatarRole.user}
                />

                <Text
                  fontSize="14px"
                  lineHeight="16px"
                  fontWeight="600"
                  noSelect
                  truncate
                >
                  {client?.creatorDisplayName}
                </Text>
              </div>
            </>
          )}
          {!isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
                truncate
              >
                {t("Common:Description")}
              </Text>

              <Text
                id="client-info-description-text"
                className="description"
                fontSize="13px"
                lineHeight="20px"
                fontWeight="400"
                noSelect
              >
                {client?.description}
              </Text>
              {withShowText && (
                <Link
                  className="desc-link"
                  fontSize="13px"
                  lineHeight="15px"
                  fontWeight="600"
                  isHovered
                  onClick={() => setShowDescription((val) => !val)}
                  type={LinkType.action}
                >
                  {showDescription ? "Hide" : "Show more"}
                </Link>
              )}
            </>
          )}
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            noSelect
            truncate
          >
            {t("Common:Website")}
          </Text>
          <Link
            fontSize="13px"
            lineHeight="15px"
            fontWeight="600"
            isHovered
            href={client?.websiteUrl}
            type={LinkType.action}
            target={LinkTarget.blank}
          >
            {client?.websiteUrl}
          </Link>
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            noSelect
            truncate
          >
            {t("Scopes")}
          </Text>{" "}
          <ScopeList
            selectedScopes={client?.scopes || []}
            scopes={scopeList || []}
            t={t}
          />
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            noSelect
            truncate
          >
            {t("Access")}
          </Text>
          <div className="property-tag_list">
            {client?.scopes.map((scope) => (
              <Tag
                key={scope}
                tag={scope}
                className="property-tag"
                label={scope}
              />
            ))}
          </div>
          {isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
                truncate
              >
                {t("AccessGranted")}
              </Text>

              <Text
                fontSize="13px"
                lineHeight="20px"
                fontWeight="600"
                noSelect
                truncate
              >
                {modifiedDate}
              </Text>
            </>
          )}
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="20px"
            fontWeight="600"
            noSelect
            truncate
          >
            {t("SupportAndLegalInfo")}
          </Text>
          <Text
            className="privacy-block"
            fontSize="13px"
            lineHeight="15px"
            fontWeight="600"
            noSelect
            truncate
          >
            <Link
              fontSize="13px"
              lineHeight="15px"
              fontWeight="600"
              isHovered
              href={client?.policyUrl}
              type={LinkType.action}
              target={LinkTarget.blank}
            >
              {t("PrivacyPolicy")}
            </Link>
            <span className="separator" />

            <Link
              fontSize="13px"
              lineHeight="15px"
              fontWeight="600"
              isHovered
              href={client?.termsUrl}
              type={LinkType.action}
              target={LinkTarget.blank}
            >
              {t("TermsOfService")}
            </Link>
          </Text>
          {!isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
                truncate
              >
                {t("LastModified")}
              </Text>

              <Text
                fontSize="13px"
                lineHeight="20px"
                fontWeight="600"
                noSelect
                truncate
              >
                {modifiedDate}
              </Text>
            </>
          )}
        </StyledContainer>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStoreProps }) => {
  const {
    setInfoDialogVisible,
    bufferSelection,
    scopeList,
    getContextMenuItems,
  } = oauthStore;

  return {
    setInfoDialogVisible,
    client: bufferSelection,
    scopeList,
    getContextMenuItems,
  };
})(observer(InfoDialog));
