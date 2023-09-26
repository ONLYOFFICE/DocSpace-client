import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/components";

import ItemContextOptions from "./ItemContextOptions";
import CalendarComponent from "./Calendar";

import { StyledTitle, StyledItemOptions } from "../../styles/common";

const FilesItemTitle = ({ t, selection, isSeveralItems, openHistory }) => {
  const itemTitleRef = useRef();

  if (isSeveralItems) return <></>;

  const icon = selection.icon;
  //only history

  return (
    <StyledTitle ref={itemTitleRef}>
      <div className="item-icon">
        <img
          className={`icon ${selection.isRoom && "is-room"}`}
          src={icon}
          alt="thumbnail-icon"
        />
      </div>
      <Text className="text">{selection.title}</Text>
      {selection && (
        <StyledItemOptions>
          {openHistory && <CalendarComponent />}

          <ItemContextOptions
            t={t}
            itemTitleRef={itemTitleRef}
            selection={selection}
          />
        </StyledItemOptions>
      )}
    </StyledTitle>
  );
};

export default withTranslation([
  "Files",
  "Common",
  "Translations",
  "InfoPanel",
  "SharingPanel",
])(observer(FilesItemTitle));
