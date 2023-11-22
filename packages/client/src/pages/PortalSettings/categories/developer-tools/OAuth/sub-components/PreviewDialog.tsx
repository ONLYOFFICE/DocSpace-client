import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { IClientProps } from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import ModalDialog from "@docspace/components/modal-dialog";
//@ts-ignore
import SocialButton from "@docspace/components/social-button";
import Text from "@docspace/components/text";
//@ts-ignore
import Textarea from "@docspace/components/textarea";

import OnlyofficeLight from "PUBLIC_DIR/images/onlyoffice.light.react.svg";
import OnlyofficeDark from "PUBLIC_DIR/images/onlyoffice.dark.react.svg";

//@ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import Button from "@docspace/components/button";
import { Base } from "@docspace/components/themes";
import {
  generateCodeChallenge,
  generatePKCEPair,
  generateRandomString,
} from "@docspace/common/utils/oauth";

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;

  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledPreviewContainer = styled.div`
  width: 100%;
  height: 152px;

  box-sizing: border-box;

  border: ${(props) => props.theme.oauth.previewDialog.border};

  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  .social-button {
    max-width: 226px;

    padding: 11px 16px;

    box-sizing: border-box;

    display: flex;
    gap: 16px;

    .iconWrapper {
      padding: 0;
      margin: 0;
    }
  }
`;

StyledPreviewContainer.defaultProps = { theme: Base };

const StyledBlocksContainer = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;

  .block-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const htmlBlock = `<body>
    <button id="docspace-button" class="docspace-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M8.89992 18.7913L1.47441 15.2914C0.841864 14.9858 0.841864 14.5136 1.47441 14.2359L4.05959 13.0137L8.87242 15.2914C9.50497 15.5969 10.5225 15.5969 11.1276 15.2914L15.9404 13.0137L18.5256 14.2359C19.1581 14.5414 19.1581 15.0136 18.5256 15.2914L11.1001 18.7913C10.5225 19.069 9.50497 19.069 8.89992 18.7913Z" fill="#FF6F3D"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M8.87586 14.4606L1.47296 10.9566C0.842346 10.6507 0.842346 10.178 1.47296 9.89989L3.99543 8.7041L8.87586 11.0123C9.50647 11.3182 10.5209 11.3182 11.1241 11.0123L16.0046 8.7041L18.527 9.89989C19.1577 10.2058 19.1577 10.6785 18.527 10.9566L11.1241 14.4606C10.4935 14.7665 9.47906 14.7665 8.87586 14.4606Z" fill="#95C038"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M8.87586 10.1747L1.47296 6.72119C0.842346 6.41969 0.842346 5.95374 1.47296 5.67965L8.87586 2.22612C9.50647 1.92463 10.5209 1.92463 11.1241 2.22612L18.527 5.67965C19.1577 5.98115 19.1577 6.4471 18.527 6.72119L11.1241 10.1747C10.4935 10.4488 9.47906 10.4488 8.87586 10.1747Z" fill="#5DC0E8"/>
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
        background: #ffffff;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 1px, rgba(0, 0, 0, 0.12) 0px 0px 1px;

        color: rgb(163, 169, 174);

        font-weight: 600;
        font-size: 14px;
        line-height: 14px;
        user-select: none;

        font-family: Roboto, "Open Sans", sans-serif, Arial;
    }

    .docspace-button:hover {
        box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 1px, rgba(0, 0, 0, 0.12) 0px 0px 1px;
        cursor: pointer;
        color: #333333;
    }
	
	.docspace-button:active {
		background-color: #F8F9F9;
		color: #333333;
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

  theme?: any;
}

const PreviewDialog = ({
  visible,
  setPreviewDialogVisible,
  client,
  theme,
}: PreviewDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const [codeVerifier, setCodeVerifier] = React.useState("");
  const [codeChallenge, setCodeChallenge] = React.useState("");

  const onClose = () => setPreviewDialogVisible?.(false);

  const icon = theme.isBase ? OnlyofficeLight : OnlyofficeDark;

  const scopesString = client?.scopes.join(" ");

  const encodingScopes = encodeURI(scopesString || "");

  const getData = React.useCallback(() => {
    const { verifier, challenge } = generatePKCEPair();

    setCodeVerifier(verifier);
    setCodeChallenge(challenge);
  }, []);

  React.useEffect(() => {
    getData();
  }, []);

  const getLink = () => {
    return `${window.location.origin}/oauth2/authorize?response_type=code&client_id=${client?.clientId}&redirect_uri=${client?.redirectUris[0]}&scope=${encodingScopes}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
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
      displayType={"aside"}
      onClose={onClose}
      withFooterBorder
    >
      <ModalDialog.Header>Auth button</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledContainer>
          <StyledPreviewContainer>
            <SocialButton
              className={"social-button"}
              label={t("SignIn")}
              IconComponent={icon}
              onClick={() => {
                window.open(link, "login", linkParams);
              }}
            />
          </StyledPreviewContainer>
          <StyledBlocksContainer>
            <div className="block-container">
              {/* @ts-ignore */}
              <Text
                fontWeight={600}
                lineHeight={"20px"}
                fontSize={"13px"}
                noSelect
              >
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
              {/* @ts-ignore */}
              <Text
                fontWeight={600}
                lineHeight={"20px"}
                fontSize={"13px"}
                noSelect
              >
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
              {/* @ts-ignore */}
              <Text
                fontWeight={600}
                lineHeight={"20px"}
                fontSize={"13px"}
                noSelect
              >
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
          </StyledBlocksContainer>
          <div className="block-container">
            {/* @ts-ignore */}
            <Text
              fontWeight={600}
              lineHeight={"20px"}
              fontSize={"13px"}
              noSelect
            >
              Code verifier
            </Text>
            <Textarea
              heightTextArea={64}
              enableCopy
              isReadOnly
              isDisabled
              value={codeVerifier}
            />
          </div>
        </StyledContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          // @ts-ignore
          size={"normal"}
          scale
          label={t("Common:OkButton")}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({ oauthStore, auth }: { auth: any; oauthStore: OAuthStoreProps }) => {
    const { setPreviewDialogVisible, bufferSelection } = oauthStore;

    const { theme } = auth.settingsStore;

    return {
      setPreviewDialogVisible,
      client: bufferSelection,
      theme,
    };
  }
)(observer(PreviewDialog));
