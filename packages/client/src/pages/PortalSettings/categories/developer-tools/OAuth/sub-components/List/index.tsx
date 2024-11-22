import { useTranslation, Trans } from "react-i18next";

import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { Text } from "@docspace/shared/components/text";
import { DeviceType } from "@docspace/shared/enums";
import { Consumer } from "@docspace/shared/utils/context";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";

import RegisterNewButton from "../RegisterNewButton";

import TableView from "./TableView";
import RowView from "./RowView";

import { StyledContainer } from "./List.styled";

interface ListProps {
  clients: IClientProps[];
  viewAs: ViewAsType;
  currentDeviceType: DeviceType;
  apiOAuthLink: string;
}

const List = ({
  clients,
  viewAs,
  currentDeviceType,
  apiOAuthLink,
}: ListProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const descText = (
    <Trans
      ns="OAuth"
      t={t}
      i18nKey="OAuthAppDescription"
      values={{
        productName: t("Common:ProductName"),
        organizationName: t("Common:OrganizationName"),
      }}
    />
  );

  return (
    <StyledContainer>
      <Text
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
        className="description"
      >
        {descText}
      </Text>
      <Link
        className="guide-link"
        target={LinkTarget.blank}
        type={LinkType.page}
        fontWeight={600}
        isHovered
        href={apiOAuthLink}
      >
        {t("OAuth:OAuth")} {t("Common:Guide")}
      </Link>
      <RegisterNewButton currentDeviceType={currentDeviceType} />
      <Consumer>
        {(context) =>
          viewAs === "table" ? (
            <TableView
              items={clients || []}
              sectionWidth={context.sectionWidth || 0}
            />
          ) : (
            <RowView
              items={clients || []}
              sectionWidth={context.sectionWidth || 0}
            />
          )
        }
      </Consumer>
    </StyledContainer>
  );
};

export default List;
