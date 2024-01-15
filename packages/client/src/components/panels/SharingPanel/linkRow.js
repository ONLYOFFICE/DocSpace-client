import React from "react";
import styled, { css } from "styled-components";
import { Row } from "@docspace/shared/components/row";
import { LinkWithDropdown } from "@docspace/shared/components/link-with-dropdown";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { StyledLinkRow } from "../StyledPanels";
import AccessComboBox from "./AccessComboBox";
import { ShareAccessRights } from "@docspace/shared/enums";
import AccessEditIcon from "PUBLIC_DIR/images/access.edit.react.svg";
import CopyIcon from "PUBLIC_DIR/images/copy.react.svg";
import { commonIconsStyles } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

const StyledAccessEditIcon = styled(AccessEditIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesPanels.sharing.fill};
  }
`;

StyledAccessEditIcon.defaultProps = { theme: Base };

const StyledCopyIcon = styled(CopyIcon)`
  ${commonIconsStyles}

  cursor: pointer;

  ${(props) =>
    props.isDisabled &&
    css`
      cursor: default;
      pointer-events: none;
    `}
`;

class LinkRow extends React.Component {
  onToggleButtonChange = () => {
    const { onToggleLink, item } = this.props;

    onToggleLink(item);
  };

  render() {
    const {
      linkText,
      options,
      index,
      t,
      item,
      withToggle,
      externalAccessOptions,
      onChangeItemAccess,
      isLoading,
      theme,
      onCopyLink,
    } = this.props;

    const isChecked = item.access !== ShareAccessRights.DenyAccess;
    const disableLink = withToggle ? !isChecked : false;
    const isDisabled = isLoading || disableLink;

    return (
      <StyledLinkRow
        theme={theme}
        withToggle={withToggle}
        isDisabled={isDisabled}
        className="link-row__container"
      >
        <Row
          theme={theme}
          className="link-row"
          key={`${linkText.replace(" ", "-")}-key_${index}`}
          element={
            withToggle ? (
              <AccessComboBox
                theme={theme}
                t={t}
                access={item.access}
                directionX="left"
                accessOptions={externalAccessOptions}
                onAccessChange={onChangeItemAccess}
                itemId={item.sharedTo.id}
                isDisabled={isDisabled}
                disableLink={disableLink}
              />
            ) : (
              <StyledAccessEditIcon
                theme={theme}
                size="medium"
                className="sharing_panel-owner-icon"
              />
            )
          }
          contextButtonSpacerWidth="0px"
        >
          <>
            <div className="sharing_panel-link-container">
              <LinkWithDropdown
                theme={theme}
                className="sharing_panel-link"
                color={theme.filesPanels.sharing.dropdownColor}
                dropdownType="alwaysDashed"
                data={options}
                fontSize="13px"
                fontWeight={600}
                isDisabled={isDisabled}
              >
                {linkText}
              </LinkWithDropdown>
              {onCopyLink && (
                <StyledCopyIcon
                  theme={theme}
                  isDisabled={isDisabled}
                  size="medium"
                  onClick={onCopyLink}
                  title={t("CopyExternalLink")}
                />
              )}
            </div>
            {withToggle && (
              <div>
                <ToggleButton
                  theme={theme}
                  isChecked={isChecked}
                  onChange={this.onToggleButtonChange}
                  isDisabled={isLoading}
                  className="sharing-row__toggle-button"
                />
              </div>
            )}
          </>
        </Row>
      </StyledLinkRow>
    );
  }
}

export default LinkRow;
