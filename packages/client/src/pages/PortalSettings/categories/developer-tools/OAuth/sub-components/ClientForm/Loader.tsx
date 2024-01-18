import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
//@ts-ignore
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";

import {
  StyledBlock,
  StyledButtonContainer,
  StyledContainer,
  StyledHeaderRow,
  StyledInputBlock,
  StyledInputGroup,
  StyledInputRow,
  StyledScopesCheckbox,
  StyledScopesContainer,
  StyledScopesName,
} from "./ClientForm.styled";

const HelpButtonSkeleton = () => {
  return <RectangleSkeleton width={"12px"} height={"12px"} />;
};

const CheckboxSkeleton = ({ className }: { className?: string }) => {
  return (
    <RectangleSkeleton className={className} width={"16px"} height={"16px"} />
  );
};

const ClientFormLoader = ({
  currentDeviceType,
  isEdit,
}: {
  currentDeviceType?: DeviceUnionType;
  isEdit: boolean;
}) => {
  const buttonHeight = currentDeviceType !== "desktop" ? "40px" : "32px";

  return (
    <StyledContainer>
      <StyledBlock>
        <StyledHeaderRow>
          <RectangleSkeleton width={"78px"} height={"16px"} />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width={"65px"} height={"13px"} />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width={"80px"} height={"13px"} />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <div className="label">
              <RectangleSkeleton width={"60px"} height={"13px"} />
            </div>
            <div className="select">
              <RectangleSkeleton width={"32px"} height={"32px"} />
              <RectangleSkeleton width={"32px"} height={"32px"} />
              <RectangleSkeleton width={"109px"} height={"13px"} />
            </div>
            <RectangleSkeleton width={"130px"} height={"12px"} />
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width={"75px"} height={"13px"} />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width={"100%"} height={"60px"} />
            </StyledInputRow>
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      {isEdit && (
        <StyledBlock>
          <StyledHeaderRow>
            <RectangleSkeleton width={"47px"} height={"16px"} />
            <HelpButtonSkeleton />
          </StyledHeaderRow>
          <StyledInputBlock>
            <StyledInputGroup>
              <StyledHeaderRow>
                <RectangleSkeleton width={"96px"} height={"13px"} />
              </StyledHeaderRow>
              <StyledInputRow>
                <RectangleSkeleton width={"100%"} height={"32px"} />
              </StyledInputRow>
            </StyledInputGroup>
            <StyledInputGroup>
              <StyledHeaderRow>
                <RectangleSkeleton width={"60px"} height={"13px"} />
              </StyledHeaderRow>
              <StyledInputRow>
                <RectangleSkeleton
                  className={"loader"}
                  width={"calc(100% - 91px)"}
                  height={"32px"}
                />
                <RectangleSkeleton width={"91px"} height={"32px"} />
              </StyledInputRow>
            </StyledInputGroup>
          </StyledInputBlock>
        </StyledBlock>
      )}
      <StyledBlock>
        <StyledHeaderRow>
          <RectangleSkeleton width={"96px"} height={"16px"} />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width={"87px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton
                className={"loader"}
                width={"calc(100% - 40px)"}
                height={"32px"}
              />
              <RectangleSkeleton width={"32px"} height={"32px"} />
            </StyledInputRow>
            <RectangleSkeleton width={"162px"} height={"32px"} />
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width={"96px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton
                className={"loader"}
                width={"calc(100% - 40px)"}
                height={"32px"}
              />
              <RectangleSkeleton width={"32px"} height={"32px"} />
            </StyledInputRow>
            <RectangleSkeleton width={"162px"} height={"32px"} />
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      <StyledScopesContainer>
        <StyledHeaderRow className="header">
          <RectangleSkeleton width={"111px"} height={"16px"} />
          <HelpButtonSkeleton />
        </StyledHeaderRow>
        <RectangleSkeleton className="header" width={"34px"} height={"16px"} />
        <RectangleSkeleton
          className="header header-last"
          width={"37px"}
          height={"16px"}
        />
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"230px"}
            height={"12px"}
          />
        </StyledScopesName>

        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>

        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"230px"}
            height={"12px"}
          />
        </StyledScopesName>

        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>

        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"230px"}
            height={"12px"}
          />
        </StyledScopesName>

        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>

        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleSkeleton
            className={"scope-desc-loader"}
            width={"230px"}
            height={"12px"}
          />
        </StyledScopesName>

        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>

        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>
      </StyledScopesContainer>
      <StyledBlock>
        <StyledHeaderRow>
          <RectangleSkeleton width={"162px"} height={"16px"} />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width={"114px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width={"96px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      <StyledButtonContainer>
        <RectangleSkeleton
          width={currentDeviceType === "desktop" ? "86px" : "100%"}
          height={buttonHeight}
        />
        <RectangleSkeleton
          width={currentDeviceType === "desktop" ? "86px" : "100%"}
          height={buttonHeight}
        />
      </StyledButtonContainer>
    </StyledContainer>
  );
};

export default ClientFormLoader;
