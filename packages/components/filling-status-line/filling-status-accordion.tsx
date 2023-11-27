import React, { useState } from "react";
import { ReactSVG } from "react-svg";
import { AccordionItem } from "./styled-filling-status-line";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/arrow.react.... Remove this comment to see the full error message
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";
import Text from "../text";
import Box from "../box";
import Avatar from "../avatar";

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
  isInterrupted
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClickHandler = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <AccordionItem
      // @ts-expect-error TS(2769): No overload matches this call.
      isOpen={isOpen}
      isDone={isDone}
      isInterrupted={isInterrupted}
    >
      <div className="accordion-item-info" onClick={onClickHandler}>
        // @ts-expect-error TS(2322): Type '{ children: Element[]; displayProp: string; ... Remove this comment to see the full error message
        <Box displayProp="flex" alignItems="center">
          <Avatar
            className="user-avatar"
            size="min"
            role="user"
            source={avatar}
            userName={displayName}
          />

          // @ts-expect-error TS(2322): Type '{ children: Element[]; displayProp: string; ... Remove this comment to see the full error message
          <Box
            displayProp="flex"
            flexDirection="column"
            marginProp="0 0 0 10px"
          >
            // @ts-expect-error TS(2322): Type '{ children: any; className: string; fontSize... Remove this comment to see the full error message
            <Text
              className="accordion-displayname"
              fontSize="14px"
              lineHeight="16px"
              fontWeight="bold"
            >
              {displayName}
            </Text>
            // @ts-expect-error TS(2322): Type '{ children: any; as: string; className: stri... Remove this comment to see the full error message
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
              // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
              <Text fontSize="12px" lineHeight="16px" className="status-text">
                {startFilling}
              </Text>
            </div>

            // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
            <Text fontSize="12px" lineHeight="16px" className="status-date">
              {startFillingDate}
            </Text>
          </div>

          {returnedByUser && (
            <div className="accordion-item-history">
              <div className="accordion-item-wrapper">
                // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
                <Text fontSize="12px" lineHeight="16px" className="status-text">
                  {returnedByUser}
                </Text>
              </div>

              // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
              <Text fontSize="12px" lineHeight="16px" className="status-date">
                {returnedDate}
              </Text>
            </div>
          )}

          {comment && (
            <div className="accordion-item-history">
              <div className="accordion-item-wrapper">
                // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
                <Text fontSize="12px" lineHeight="16px" className="status-text">
                  {comment}
                </Text>
              </div>
            </div>
          )}

          {isDone && (
            <div className="accordion-item-history">
              <div className="accordion-item-wrapper">
                // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  className="filled-status-text"
                >
                  {filledAndSigned}
                </Text>
              </div>

              // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
              <Text fontSize="12px" lineHeight="16px" className="status-date">
                {filledAndSignedDate}
              </Text>
            </div>
          )}
        </>
      ) : (
        <div className="accordion-item-history">
          <div className="accordion-item-wrapper">
            // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
            <Text
              fontSize="12px"
              lineHeight="16px"
              className="filled-status-text"
            >
              {filledAndSigned}
            </Text>
          </div>

          // @ts-expect-error TS(2322): Type '{ children: any; fontSize: string; lineHeigh... Remove this comment to see the full error message
          <Text fontSize="12px" lineHeight="16px" className="status-date">
            {filledAndSignedDate}
          </Text>
        </div>
      )}
    </AccordionItem>
  );
};
export default FillingStatusAccordion;
