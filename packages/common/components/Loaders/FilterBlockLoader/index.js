import React from "react";
import { RoomsType } from "../../../constants";

import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

import { StyledBlock, StyledContainer } from "./StyledFilterBlockLoader";

const FilterBlockLoader = ({
  id,
  className,
  style,
  isRooms,
  isAccounts,

  ...rest
}) => {
  const roomTypeLoader = isRooms ? (
    <>
      {Object.values(RoomsType).map((roomType) => {
        switch (roomType) {
          case RoomsType.FillingFormsRoom:
            return (
              <RectangleSkeleton
                key={roomType}
                width={"77"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            );
          case RoomsType.EditingRoom:
            return (
              <RectangleSkeleton
                key={roomType}
                width={"98"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            );
          case RoomsType.ReviewRoom:
            return (
              <RectangleSkeleton
                key={roomType}
                width={"112"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            );
          case RoomsType.ReadOnlyRoom:
            return (
              <RectangleSkeleton
                key={roomType}
                width={"73"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            );
          case RoomsType.CustomRoom:
          default:
            return (
              <RectangleSkeleton
                key={roomType}
                width={"89"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            );
        }
      })}
    </>
  ) : null;

  return (
    <StyledContainer id={id} className={className} style={style} {...rest}>
      {!isRooms && !isAccounts && (
        <StyledBlock>
          <RectangleSkeleton
            width={"50"}
            height={"16"}
            borderRadius={"3"}
            className={"loader-item"}
          />
          <RectangleSkeleton
            width={"100%"}
            height={"32"}
            borderRadius={"3"}
            className={"loader-item"}
          />
          <div className="row-loader">
            <RectangleSkeleton
              width={"16"}
              height={"16"}
              borderRadius={"3"}
              className={"loader-item"}
            />
            <RectangleSkeleton
              width={"137"}
              height={"20"}
              borderRadius={"3"}
              className={"loader-item"}
            />
          </div>
        </StyledBlock>
      )}

      {!isAccounts && (
        <StyledBlock>
          <RectangleSkeleton
            width={"51"}
            height={"16"}
            borderRadius={"3"}
            className={"loader-item"}
          />
          <div className="row-loader">
            <RectangleSkeleton
              width={"51"}
              height={"28"}
              borderRadius={"16"}
              className={"loader-item"}
            />
            <RectangleSkeleton
              width={"68"}
              height={"28"}
              borderRadius={"16"}
              className={"loader-item"}
            />
          </div>
          {isRooms && (
            <div className="row-loader">
              <RectangleSkeleton
                width={"16"}
                height={"16"}
                borderRadius={"3"}
                className={"loader-item"}
              />
              <RectangleSkeleton
                width={"137"}
                height={"20"}
                borderRadius={"3"}
                className={"loader-item"}
              />
            </div>
          )}
        </StyledBlock>
      )}

      {(isRooms || isAccounts) && (
        <StyledBlock>
          <RectangleSkeleton
            width={"50"}
            height={"16"}
            borderRadius={"3"}
            className={"loader-item"}
          />
          <div className="row-loader">
            {isAccounts ? (
              <>
                <RectangleSkeleton
                  width={"67"}
                  height={"28"}
                  borderRadius={"16"}
                  className={"loader-item tag-item"}
                />
                <RectangleSkeleton
                  width={"80"}
                  height={"28"}
                  borderRadius={"16"}
                  className={"loader-item tag-item"}
                />
                <RectangleSkeleton
                  width={"83"}
                  height={"28"}
                  borderRadius={"16"}
                  className={"loader-item tag-item"}
                />
              </>
            ) : isRooms ? (
              <>{roomTypeLoader}</>
            ) : (
              <></>
            )}
          </div>
        </StyledBlock>
      )}

      {isAccounts && (
        <StyledBlock>
          <RectangleSkeleton
            width={"50"}
            height={"16"}
            borderRadius={"3"}
            className={"loader-item"}
          />
          <div className="row-loader">
            <RectangleSkeleton
              width={"114"}
              height={"28"}
              borderRadius={"16"}
              className={"loader-item tag-item"}
            />
            <RectangleSkeleton
              width={"110"}
              height={"28"}
              borderRadius={"16"}
              className={"loader-item tag-item"}
            />
            <RectangleSkeleton
              width={"108"}
              height={"28"}
              borderRadius={"16"}
              className={"loader-item tag-item"}
            />
            <RectangleSkeleton
              width={"59"}
              height={"28"}
              borderRadius={"16"}
              className={"loader-item tag-item"}
            />
          </div>
        </StyledBlock>
      )}

      <StyledBlock isLast>
        <RectangleSkeleton
          width={"50"}
          height={"16"}
          borderRadius={"3"}
          className={"loader-item"}
        />
        <div className="row-loader">
          {isAccounts ? (
            <>
              <RectangleSkeleton
                width={"57"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"57"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            </>
          ) : isRooms ? (
            <>
              <RectangleSkeleton
                width={"67"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"73"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"67"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"74"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"65"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"72"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            </>
          ) : (
            <>
              <RectangleSkeleton
                width={"73"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"99"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"114"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"112"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"130"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"66"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"81"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"74"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
              <RectangleSkeleton
                width={"68"}
                height={"28"}
                borderRadius={"16"}
                className={"loader-item tag-item"}
              />
            </>
          )}
        </div>
      </StyledBlock>
    </StyledContainer>
  );
};

export default FilterBlockLoader;
