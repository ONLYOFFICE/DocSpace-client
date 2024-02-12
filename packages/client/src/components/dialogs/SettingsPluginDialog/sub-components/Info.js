import React from "react";
import styled, { css } from "styled-components";

import { LANGUAGE } from "@docspace/shared/constants";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { getCorrectDate, getCookie } from "@docspace/shared/utils";

import { PluginStatus } from "SRC_DIR/helpers/plugins/enums";
import { Base } from "@docspace/shared/themes";

const StyledContainer = styled.div`
  width: 100%;

  ${(props) =>
    props.withDelete &&
    css`
      margin-bottom: 24px;
    `}
`;

const StyledSeparator = styled.div`
  width: 100%;
  height: 1px;

  margin: 24px 0;

  background-color: ${(props) => props.theme.plugins.borderColor};
`;

StyledSeparator.defaultProps = { theme: Base };

const StyledInfo = styled.div`
  margin-top: 24px;

  width: 100%;
  height: auto;

  display: grid;

  grid-template-columns: max-content 1fr;

  gap: 8px 24px;
`;

const Info = ({ t, plugin, withDelete, withSeparator }) => {
  const locale = getCookie(LANGUAGE) || "en";
  const uploadDate = plugin.createOn && getCorrectDate(locale, plugin.createOn);

  const pluginStatus =
    plugin.status === PluginStatus.active
      ? t("NotNeedSettings")
      : t("NeedSettings");

  return (
    <StyledContainer withDelete={withDelete}>
      {withSeparator && <StyledSeparator />}
      <Text fontSize={"14px"} fontWeight={600} lineHeight={"16px"} noSelect>
        {t("Metadata")}
      </Text>
      <StyledInfo>
        {plugin.author && (
          <>
            <Text
              fontSize={"13px"}
              fontWeight={400}
              lineHeight={"20px"}
              noSelect
              truncate
            >
              {t("Files:ByAuthor")}
            </Text>
            <Text
              fontSize={"13px"}
              fontWeight={600}
              lineHeight={"20px"}
              noSelect
            >
              {plugin.author}
            </Text>
          </>
        )}

        {plugin.version && (
          <>
            <Text
              fontSize={"13px"}
              fontWeight={400}
              lineHeight={"20px"}
              noSelect
              truncate
            >
              {t("Common:Version")}
            </Text>
            <Text
              fontSize={"13px"}
              fontWeight={600}
              lineHeight={"20px"}
              noSelect
            >
              {plugin.version}
            </Text>
          </>
        )}

        {!plugin.system && (
          <>
            <Text
              fontSize={"13px"}
              fontWeight={400}
              lineHeight={"20px"}
              noSelect
              truncate
            >
              {t("Common:Uploader")}
            </Text>
            <Text
              fontSize={"13px"}
              fontWeight={600}
              lineHeight={"20px"}
              noSelect
            >
              {plugin.createBy.displayName}
            </Text>
          </>
        )}

        {!plugin.system && uploadDate && (
          <>
            <Text
              fontSize={"13px"}
              fontWeight={400}
              lineHeight={"20px"}
              noSelect
              truncate
            >
              {t("Common:UploadDate")}
            </Text>
            <Text
              fontSize={"13px"}
              fontWeight={600}
              lineHeight={"20px"}
              noSelect
            >
              {uploadDate}
            </Text>
          </>
        )}

        <Text
          fontSize={"13px"}
          fontWeight={400}
          lineHeight={"20px"}
          noSelect
          truncate
        >
          {t("People:UserStatus")}
        </Text>
        <Text fontSize={"13px"} fontWeight={600} lineHeight={"20px"} noSelect>
          {pluginStatus}
        </Text>

        {plugin.homePage && (
          <>
            <Text
              fontSize={"13px"}
              fontWeight={400}
              lineHeight={"20px"}
              noSelect
              truncate
            >
              {t("Common:Homepage")}
            </Text>
            <Link
              fontSize={"13px"}
              fontWeight={600}
              lineHeight={"20px"}
              type={"page"}
              href={plugin?.homePage}
              target={"_blank"}
              noSelect
              isHovered
            >
              {plugin.homePage}
            </Link>
          </>
        )}
        {plugin.description && (
          <>
            <Text
              fontSize={"13px"}
              fontWeight={400}
              lineHeight={"20px"}
              noSelect
              truncate
            >
              {t("Common:Description")}
            </Text>
            <Text
              fontSize={"13px"}
              fontWeight={600}
              lineHeight={"20px"}
              noSelect
            >
              {plugin.description}
            </Text>
          </>
        )}
      </StyledInfo>
    </StyledContainer>
  );
};

export default Info;
