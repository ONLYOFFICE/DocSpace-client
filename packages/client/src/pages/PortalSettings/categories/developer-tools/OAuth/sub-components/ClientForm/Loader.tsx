import React from "react";

//@ts-ignore
import RectangleLoader from "@docspace/common/components/Loaders/RectangleLoader";
import { DeviceUnionType } from "@docspace/common/hooks/useViewEffect";

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
  return <RectangleLoader width={"12px"} height={"12px"} />;
};

const CheckboxSkeleton = ({ className }: { className?: string }) => {
  return (
    <RectangleLoader className={className} width={"16px"} height={"16px"} />
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
          <RectangleLoader width={"78px"} height={"16px"} />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleLoader width={"65px"} height={"13px"} />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleLoader width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleLoader width={"80px"} height={"13px"} />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleLoader width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <div className="label">
              <RectangleLoader width={"60px"} height={"13px"} />
            </div>
            <div className="select">
              <RectangleLoader width={"32px"} height={"32px"} />
              <RectangleLoader width={"32px"} height={"32px"} />
              <RectangleLoader width={"109px"} height={"13px"} />
            </div>
            <RectangleLoader width={"130px"} height={"12px"} />
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleLoader width={"75px"} height={"13px"} />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleLoader width={"100%"} height={"60px"} />
            </StyledInputRow>
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      {isEdit && (
        <StyledBlock>
          <StyledHeaderRow>
            <RectangleLoader width={"47px"} height={"16px"} />
            <HelpButtonSkeleton />
          </StyledHeaderRow>
          <StyledInputBlock>
            <StyledInputGroup>
              <StyledHeaderRow>
                <RectangleLoader width={"96px"} height={"13px"} />
              </StyledHeaderRow>
              <StyledInputRow>
                <RectangleLoader width={"100%"} height={"32px"} />
              </StyledInputRow>
            </StyledInputGroup>
            <StyledInputGroup>
              <StyledHeaderRow>
                <RectangleLoader width={"60px"} height={"13px"} />
              </StyledHeaderRow>
              <StyledInputRow>
                <RectangleLoader
                  className={"loader"}
                  width={"calc(100% - 91px)"}
                  height={"32px"}
                />
                <RectangleLoader width={"91px"} height={"32px"} />
              </StyledInputRow>
            </StyledInputGroup>
          </StyledInputBlock>
        </StyledBlock>
      )}
      <StyledBlock>
        <StyledHeaderRow>
          <RectangleLoader width={"96px"} height={"16px"} />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleLoader width={"87px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleLoader
                className={"loader"}
                width={"calc(100% - 40px)"}
                height={"32px"}
              />
              <RectangleLoader width={"32px"} height={"32px"} />
            </StyledInputRow>
            <RectangleLoader width={"162px"} height={"32px"} />
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleLoader width={"96px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleLoader
                className={"loader"}
                width={"calc(100% - 40px)"}
                height={"32px"}
              />
              <RectangleLoader width={"32px"} height={"32px"} />
            </StyledInputRow>
            <RectangleLoader width={"162px"} height={"32px"} />
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      <StyledScopesContainer>
        <StyledHeaderRow className="header">
          <RectangleLoader width={"111px"} height={"16px"} />
          <HelpButtonSkeleton />
        </StyledHeaderRow>
        <RectangleLoader className="header" width={"34px"} height={"16px"} />
        <RectangleLoader
          className="header header-last"
          width={"37px"}
          height={"16px"}
        />
        <StyledScopesName>
          <RectangleLoader
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleLoader
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleLoader
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
          <RectangleLoader
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleLoader
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleLoader
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
          <RectangleLoader
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleLoader
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleLoader
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
          <RectangleLoader
            className="scope-name-loader"
            width={"98px"}
            height={"14px"}
          />
          <RectangleLoader
            className={"scope-desc-loader"}
            width={"200px"}
            height={"12px"}
          />
          <RectangleLoader
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
          <RectangleLoader width={"162px"} height={"16px"} />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleLoader width={"114px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleLoader width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleLoader width={"96px"} height={"13px"} />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleLoader width={"100%"} height={"32px"} />
            </StyledInputRow>
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      <StyledButtonContainer>
        <RectangleLoader
          width={currentDeviceType === "desktop" ? "86px" : "100%"}
          height={buttonHeight}
        />
        <RectangleLoader
          width={currentDeviceType === "desktop" ? "86px" : "100%"}
          height={buttonHeight}
        />
      </StyledButtonContainer>
    </StyledContainer>
  );
};

export default ClientFormLoader;
