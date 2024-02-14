import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";
import { LinkWithDropdown } from "@docspace/shared/components/link-with-dropdown";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { isMobile } from "@docspace/shared/utils";

const DownloadRow = (props) => {
  const {
    t,
    file,
    onRowSelect,
    type,
    dropdownItems,
    getIcon,
    getFolderIcon,
    isOther,
    isChecked,
  } = props;

  //console.log("DownloadRow render");

  const [dropDownIsOpen, setDropDownIsOpen] = useState(false);

  const getItemIcon = (item) => {
    const extension = item.fileExst;
    const icon = extension
      ? getIcon(32, extension)
      : getFolderIcon(item.providerKey, 32);

    return (
      <ReactSVG
        beforeInjection={(svg) => {
          svg.setAttribute("style", "margin-top: 4px; margin-right: 12px;");
        }}
        src={icon}
        loading={() => <div style={{ width: "96px" }} />}
      />
    );
  };

  const element = getItemIcon(file);

  return (
    <div className="download-dialog-row">
      <div className="download-dialog-main-content">
        <Checkbox
          className="download-dialog-checkbox"
          data-item-id={file.id}
          data-type={type}
          onChange={onRowSelect}
          isChecked={isChecked}
        />
        <div className="download-dialog-icon-contatiner">{element}</div>
        <Text
          className="download-dialog-title"
          truncate
          type="page"
          title={file.title}
          fontSize="14px"
          fontWeight={600}
          noSelect
        >
          {file.title}
        </Text>
      </div>

      <div className="download-dialog-actions">
        {file.checked && !isOther && (
          <LinkWithDropdown
            className="download-dialog-link"
            dropDownClassName="download-dialog-dropDown"
            isOpen={dropDownIsOpen}
            dropdownType="alwaysDashed"
            containerMinWidth="fit-content"
            data={dropdownItems}
            directionX="left"
            directionY={isMobile() ? "both" : "bottom"}
            fontSize="13px"
            fontWeight={600}
            hasScroll={isMobile()}
            withExpander
          >
            {file.format || t("OriginalFormat")}
          </LinkWithDropdown>
        )}
        {isOther && file.fileExst && (
          <Text
            className="download-dialog-other-text"
            truncate
            type="page"
            title={file.title}
            fontSize="13px"
            fontWeight={600}
            noSelect
          >
            {t("OriginalFormat")}
          </Text>
        )}
      </div>
    </div>
  );
};

export default inject(({ filesSettingsStore }) => {
  const { getIcon, getFolderIcon } = filesSettingsStore;

  return {
    getIcon,
    getFolderIcon,
  };
})(observer(DownloadRow));
