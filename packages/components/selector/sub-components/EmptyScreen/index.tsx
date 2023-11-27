import React from "react";

import Heading from "../../../heading";
import Text from "../../../text";

import StyledEmptyScreen from "./StyledEmptyScreen";
import { EmptyScreenProps } from "./EmptyScreen.type";

const EmptyScreen = ({
  image,
  header,
  description,
  searchImage,
  searchHeader,
  searchDescription,
  withSearch,
}: EmptyScreenProps) => {
  const currentImage = withSearch ? searchImage : image;
  const currentHeader = withSearch ? searchHeader : header;
  const currentDescription = withSearch ? searchDescription : description;

  return (
    <StyledEmptyScreen withSearch={withSearch}>
      <img
        className="empty-image"
        src={currentImage}
        alt="empty-screen-image"
      />
      // @ts-expect-error TS(2322): Type '{ children: string | undefined; level: numbe... Remove this comment to see the full error message
      <Heading level={3} className="empty-header">
        {currentHeader}
      </Heading>
      // @ts-expect-error TS(2322): Type '{ children: string | undefined; className: s... Remove this comment to see the full error message
      <Text className="empty-description" noSelect>
        {currentDescription}
      </Text>
    </StyledEmptyScreen>
  );
};

export default EmptyScreen;
