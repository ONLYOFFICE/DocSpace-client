import React from "react";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";
import { useTranslation, Trans } from "react-i18next";

import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ModalDialogType } from "@docspace/shared/components/modal-dialog/ModalDialog.enums";
import { SocialButton } from "@docspace/shared/components/social-button";
import { Text } from "@docspace/shared/components/text";
import { Textarea } from "@docspace/shared/components/textarea";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { globalColors } from "@docspace/shared/themes";
import { generatePKCEPair } from "@docspace/shared/utils/oauth";
import { AuthenticationMethod } from "@docspace/shared/enums";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import OnlyofficeLight from "PUBLIC_DIR/images/onlyoffice.light.react.svg";
import OnlyofficeDark from "PUBLIC_DIR/images/onlyoffice.dark.react.svg";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import {
  StyledContainer,
  StyledPreviewContainer,
  StyledBlocksContainer,
} from "../OAuth.styled";

const htmlBlock = `<body>
    <button id="docspace-button" class="docspace-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M8.89992 18.7913L1.47441 15.2914C0.841864 14.9858 0.841864 14.5136 1.47441 14.2359L4.05959 13.0137L8.87242 15.2914C9.50497 15.5969 10.5225 15.5969 11.1276 15.2914L15.9404 13.0137L18.5256 14.2359C19.1581 14.5414 19.1581 15.0136 18.5256 15.2914L11.1001 18.7913C10.5225 19.069 9.50497 19.069 8.89992 18.7913Z" fill=${globalColors.redRomb}/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M8.87586 14.4606L1.47296 10.9566C0.842346 10.6507 0.842346 10.178 1.47296 9.89989L3.99543 8.7041L8.87586 11.0123C9.50647 11.3182 10.5209 11.3182 11.1241 11.0123L16.0046 8.7041L18.527 9.89989C19.1577 10.2058 19.1577 10.6785 18.527 10.9566L11.1241 14.4606C10.4935 14.7665 9.47906 14.7665 8.87586 14.4606Z" fill=${globalColors.greenRomb}/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M8.87586 10.1747L1.47296 6.72119C0.842346 6.41969 0.842346 5.95374 1.47296 5.67965L8.87586 2.22612C9.50647 1.92463 10.5209 1.92463 11.1241 2.22612L18.527 5.67965C19.1577 5.98115 19.1577 6.4471 18.527 6.72119L11.1241 10.1747C10.4935 10.4488 9.47906 10.4488 8.87586 10.1747Z" fill=${globalColors.blueRomb}/>
		</svg>

        Sign in with DocSpace
    </button>
</body>`;

const styleBlock = `<style>
    .docspace-button {
        width: auto;
        padding: 0 20px;

        display: flex;
        flex-direction: row;
        align-items: center;
        text-decoration: none;
        border-radius: 2px;

        height: 40px;

        border: none;
        stroke: none;
        background: ${globalColors.white};
        box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 1px, rgba(0, 0, 0, 0.12) 0px 0px 1px;

        color: ${globalColors.gray};

        font-weight: 600;
        font-size: 14px;
        line-height: 14px;
        user-select: none;

        font-family: Roboto, "Open Sans", sans-serif, Arial;
    }

    .docspace-button:hover {
        box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 1px, rgba(0, 0, 0, 0.12) 0px 0px 1px;
        cursor: pointer;
        color: ${globalColors.black};
    }
	
	.docspace-button:active {
		background-color: ${globalColors.grayLight};
		color: ${globalColors.black};
		cursor: pointer;
	}

    .logo-svg {
        width: 18px;
        min-width: 18px;
        height: 18px;
        min-height: 18px;

        margin: 11px 16px;
    }

</style>`;

const linkParams =
  "width=800,height=800,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no";

interface PreviewDialogProps {
  visible: boolean;

  setPreviewDialogVisible?: (value: boolean) => void;
  client?: IClientProps;
}

const PreviewDialog = ({
  visible,
  setPreviewDialogVisible,
  client,
}: PreviewDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common", "Webhooks"]);
  const theme = useTheme();

  const [codeVerifier, setCodeVerifier] = React.useState("");
  const [codeChallenge, setCodeChallenge] = React.useState("");
  const [state, setState] = React.useState("");

  const onClose = () => setPreviewDialogVisible?.(false);

  const icon = theme.isBase ? OnlyofficeLight : OnlyofficeDark;

  const scopesString = client?.scopes.join(" ");

  const isClientSecretPost = !client?.authenticationMethods.includes(
    AuthenticationMethod.none,
  );

  const encodingScopes = encodeURI(scopesString || "");

  React.useEffect(() => {
    const getData = () => {
      const { verifier, challenge, state: s } = generatePKCEPair();

      setCodeVerifier(verifier);
      setCodeChallenge(challenge);
      setState(s);
    };

    getData();
  }, []);

  const getLink = () => {
    return `${
      window?.ClientConfig?.oauth2.origin || window.location.origin
    }/oauth2/authorize?response_type=code&client_id=${client?.clientId}&redirect_uri=${
      client?.redirectUris[0]
    }&scope=${encodingScopes}&state=${state}${
      isClientSecretPost
        ? ""
        : `&code_challenge_method=S256&code_challenge=${codeChallenge}`
    }`;
  };

  const link = getLink();

  const scriptBlock = `<script>
    const button = document.getElementById('docspace-button')

    function openOAuthPage() {
        window.open(
            "${link}",
            "login",
            ${linkParams}
        );
    }

    button.addEventListener('click', openOAuthPage)
</script>`;

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>{t("OAuth:AuthButton")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledContainer>
          <StyledPreviewContainer>
            <SocialButton
              className="social-button"
              label={
                <Trans
                  t={t}
                  ns="OAuth"
                  i18nKey="SignIn"
                  values={{ productName: t("Common:ProductName") }}
                />
              }
              IconComponent={icon}
              onClick={() => {
                window.open(link, "login", linkParams);
              }}
            />
          </StyledPreviewContainer>
          <StyledBlocksContainer>
            <div className="block-container">
              <Text fontWeight={600} lineHeight="20px" fontSize="13px" noSelect>
                HTML
              </Text>
              <Textarea
                heightTextArea={64}
                enableCopy
                isReadOnly
                isDisabled
                value={htmlBlock}
              />
            </div>
            <div className="block-container">
              <Text fontWeight={600} lineHeight="20px" fontSize="13px" noSelect>
                CSS
              </Text>
              <Textarea
                heightTextArea={64}
                enableCopy
                isReadOnly
                isDisabled
                value={styleBlock}
              />
            </div>
            <div className="block-container">
              <Text fontWeight={600} lineHeight="20px" fontSize="13px" noSelect>
                JavaScript
              </Text>
              <Textarea
                heightTextArea={64}
                enableCopy
                isReadOnly
                isDisabled
                value={scriptBlock}
              />
            </div>
            <div className="block-container">
              <Text fontWeight={600} lineHeight="20px" fontSize="13px" noSelect>
                {t("OAuth:AuthorizeLink")}
              </Text>
              <Textarea
                heightTextArea={64}
                enableCopy
                isReadOnly
                isDisabled
                value={link}
              />
            </div>

            <div className="block-container">
              <Text fontWeight={600} lineHeight="20px" fontSize="13px" noSelect>
                {t("Webhooks:State")}
              </Text>
              <Textarea
                heightTextArea={64}
                enableCopy
                isReadOnly
                isDisabled
                value={state}
              />
            </div>

            {!isClientSecretPost && (
              <div className="block-container">
                <Text
                  fontWeight={600}
                  lineHeight="20px"
                  fontSize="13px"
                  noSelect
                >
                  {t("OAuth:CodeVerifier")}
                </Text>
                <Textarea
                  heightTextArea={64}
                  enableCopy
                  isReadOnly
                  isDisabled
                  value={codeVerifier}
                />
              </div>
            )}
          </StyledBlocksContainer>
        </StyledContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          size={ButtonSize.normal}
          scale
          label={t("Common:OkButton")}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    oauthStore,
    settingsStore,
  }: {
    settingsStore: SettingsStore;
    oauthStore: OAuthStoreProps;
  }) => {
    const { setPreviewDialogVisible, bufferSelection } = oauthStore;

    const { theme } = settingsStore;

    return {
      setPreviewDialogVisible,
      client: bufferSelection,
      theme,
    };
  },
)(observer(PreviewDialog));
