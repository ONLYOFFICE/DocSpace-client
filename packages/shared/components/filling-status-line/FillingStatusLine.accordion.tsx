import React, { useState } from "react";
import { ReactSVG } from "react-svg";

import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";

import { Text } from "../text";
import { Box } from "../box";
import { Avatar, AvatarRole, AvatarSize } from "../avatar";

import { AccordionItem } from "./FillingStatusLine.styled";
import { FillingStatusLineAccordionProps } from "./FillingStatusLine.types";

const FillingStatusAccordion = ({
  avatar,
  displayName,
  role,
  startFilling,
  startFillingDate,
  filledAndSigned,
  filledAndSignedDate,
  returnedByUser,
  returnedDate,
  comment,
  isDone,
  isInterrupted,
}: FillingStatusLineAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClickHandler = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <AccordionItem
      isOpen={isOpen}
      isDone={isDone}
      isInterrupted={isInterrupted}
    >
      <div className="accordion-item-info" onClick={onClickHandler}>
        <Box displayProp="flex" alignItems="center">
          <Avatar
            className="user-avatar"
            size={AvatarSize.min}
            role={AvatarRole.user}
            source={avatar || ""}
            userName={displayName}
          />

          <Box
            displayProp="flex"
            flexDirection="column"
            marginProp="0 0 0 10px"
          >
            <Text
              className="accordion-displayname"
              fontSize="14px"
              lineHeight="16px"
              fontWeight="bold"
            >
              {displayName}
            </Text>
            <Text
              as="span"
              className="accordion-role"
              fontSize="12px"
              lineHeight="16px"
            >
              {role}
            </Text>
          </Box>
        </Box>
        <ReactSVG src={ArrowReactSvgUrl} className="arrow-icon" />
      </div>

      {isOpen ? (
        <>
          <div className="accordion-item-history">
            <div className="accordion-item-wrapper">
              <Text fontSize="12px" lineHeight="16px" className="status-text">
                {startFilling}
              </Text>
            </div>

            <Text fontSize="12px" lineHeight="16px" className="status-date">
              {startFillingDate}
            </Text>
          </div>

          {returnedByUser && (
            <div className="accordion-item-history">
              <div className="accordion-item-wrapper">
                <Text fontSize="12px" lineHeight="16px" className="status-text">
                  {returnedByUser}
                </Text>
              </div>

              <Text fontSize="12px" lineHeight="16px" className="status-date">
                {returnedDate}
              </Text>
            </div>
          )}

          {comment && (
            <div className="accordion-item-history">
              <div className="accordion-item-wrapper">
                <Text fontSize="12px" lineHeight="16px" className="status-text">
                  {comment}
                </Text>
              </div>
            </div>
          )}

          {isDone && (
            <div className="accordion-item-history">
              <div className="accordion-item-wrapper">
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  className="filled-status-text"
                >
                  {filledAndSigned}
                </Text>
              </div>

              <Text fontSize="12px" lineHeight="16px" className="status-date">
                {filledAndSignedDate}
              </Text>
            </div>
          )}
        </>
      ) : (
        <div className="accordion-item-history">
          <div className="accordion-item-wrapper">
            <Text
              fontSize="12px"
              lineHeight="16px"
              className="filled-status-text"
            >
              {filledAndSigned}
            </Text>
          </div>

          <Text fontSize="12px" lineHeight="16px" className="status-date">
            {filledAndSignedDate}
          </Text>
        </div>
      )}
    </AccordionItem>
  );
};
export { FillingStatusAccordion };
