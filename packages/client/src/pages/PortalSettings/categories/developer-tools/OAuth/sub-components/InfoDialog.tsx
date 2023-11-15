import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { IClientProps, IScope } from "@docspace/common/utils/oauth/interfaces";
import ScopeList from "@docspace/common/utils/oauth/ScopeList";
//@ts-ignore
import getCorrectDate from "@docspace/components/utils/getCorrectDate";
//@ts-ignore
import { getCookie } from "@docspace/components/utils/cookie";
//@ts-ignore
import ModalDialog from "@docspace/components/modal-dialog";
import Text from "@docspace/components/text";
import ContextMenuButton from "@docspace/components/context-menu-button";

//@ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import Avatar from "@docspace/components/avatar";
import Link from "@docspace/components/link";
import { Base } from "@docspace/components/themes";

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
`;

StyledContainer.defaultProps = { theme: Base };

interface InfoDialogProps {
  visible: boolean;
  scopeList?: IScope[];

  setInfoDialogVisible?: (value: boolean) => void;
  getContextMenuItems?: (
    t: any,
    item: IClientProps,
    isInfo?: boolean,
    isSettings?: boolean
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];

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
      client &&
      getContextMenuItems &&
      getContextMenuItems(t, client, true, !isProfile);

    return contextOptions;
  };

  const onClose = () => {
    setInfoDialogVisible?.(false);
  };

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale, client?.modifiedOn);

  return (
    <ModalDialog visible={visible} displayType={"aside"} onClose={onClose}>
      <ModalDialog.Header>{t("Common:Info")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledContainer
          showDescription={showDescription}
          withShowText={withShowText}
        >
          <div className="client-block">
            <div className="client-block__info">
              <img className="client-block__info-logo" src={client?.logo} />
              {/* @ts-ignore */}
              <Text
                fontSize={"16px"}
                lineHeight={"22px"}
                fontWeight={"700"}
                noSelect
                truncate
              >
                {client?.name}
              </Text>
            </div>

            <ContextMenuButton getData={getContextOptions} />
          </div>
          {!isProfile && (
            <>
              {/* @ts-ignore */}
              <Text
                className={"block-header"}
                fontSize={"14px"}
                lineHeight={"16px"}
                fontWeight={"600"}
                noSelect
                truncate
              >
                {t("Creator")}
              </Text>
              <div className="creator-block">
                <Avatar source={client?.creatorAvatar} size={"min"} />
                {/* @ts-ignore */}
                <Text
                  fontSize={"14px"}
                  lineHeight={"16px"}
                  fontWeight={"600"}
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
              {/* @ts-ignore */}
              <Text
                className={"block-header"}
                fontSize={"14px"}
                lineHeight={"16px"}
                fontWeight={"600"}
                noSelect
                truncate
              >
                {t("Common:Description")}
              </Text>
              {/* @ts-ignore */}
              <Text
                id={"client-info-description-text"}
                className={"description"}
                fontSize={"13px"}
                lineHeight={"20px"}
                fontWeight={"400"}
                noSelect
              >
                {client?.description}
              </Text>
              {withShowText && (
                <>
                  {/* @ts-ignore */}
                  <Link
                    className={"desc-link"}
                    fontSize={"13px"}
                    lineHeight={"15px"}
                    fontWeight={"600"}
                    isHovered
                    onClick={() => setShowDescription((val) => !val)}
                    type={"action"}
                  >
                    {showDescription ? "Hide" : "Show more"}
                  </Link>
                </>
              )}
            </>
          )}
          {/* @ts-ignore */}
          <Text
            className={"block-header"}
            fontSize={"14px"}
            lineHeight={"16px"}
            fontWeight={"600"}
            noSelect
            truncate
          >
            {t("Common:Website")}
          </Text>
          {/* @ts-ignore */}
          <Link
            fontSize={"13px"}
            lineHeight={"15px"}
            fontWeight={"600"}
            isHovered
            href={client?.websiteUrl}
            type={"action"}
            target={"_blank"}
          >
            {client?.websiteUrl}
          </Link>
          {/* @ts-ignore */}
          <Text
            className={"block-header"}
            fontSize={"14px"}
            lineHeight={"16px"}
            fontWeight={"600"}
            noSelect
            truncate
          >
            {t("Access")}
          </Text>
          <ScopeList
            selectedScopes={client?.scopes || []}
            scopes={scopeList || []}
            t={t}
          />
          {isProfile && (
            <>
              {/* @ts-ignore */}
              <Text
                className={"block-header"}
                fontSize={"14px"}
                lineHeight={"16px"}
                fontWeight={"600"}
                noSelect
                truncate
              >
                {t("AccessGranted")}
              </Text>
              {/* @ts-ignore */}
              <Text
                fontSize={"13px"}
                lineHeight={"20px"}
                fontWeight={"600"}
                noSelect
                truncate
              >
                {modifiedDate}
              </Text>
            </>
          )}
          {/* @ts-ignore */}
          <Text
            className={"block-header"}
            fontSize={"14px"}
            lineHeight={"20px"}
            fontWeight={"600"}
            noSelect
            truncate
          >
            {t("SupportAndLegalInfo")}
          </Text>
          {/* @ts-ignore */}
          <Text
            className={"privacy-block"}
            fontSize={"13px"}
            lineHeight={"15px"}
            fontWeight={"600"}
            noSelect
            truncate
          >
            {/* @ts-ignore */}
            <Link
              fontSize={"13px"}
              lineHeight={"15px"}
              fontWeight={"600"}
              isHovered
              href={client?.policyUrl}
              type={"action"}
              target={"_blank"}
            >
              {t("PrivacyPolicy")}
            </Link>
            <span className="separator"></span>
            {/* @ts-ignore */}
            <Link
              fontSize={"13px"}
              lineHeight={"15px"}
              fontWeight={"600"}
              isHovered
              href={client?.termsUrl}
              type={"action"}
              target={"_blank"}
            >
              {t("Terms of Service")}
            </Link>
          </Text>
          {!isProfile && (
            <>
              {/* @ts-ignore */}
              <Text
                className={"block-header"}
                fontSize={"14px"}
                lineHeight={"16px"}
                fontWeight={"600"}
                noSelect
                truncate
              >
                {t("LastModified")}
              </Text>
              {/* @ts-ignore */}
              <Text
                fontSize={"13px"}
                lineHeight={"20px"}
                fontWeight={"600"}
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
