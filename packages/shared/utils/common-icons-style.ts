import { css } from "styled-components";

export const enum IconSizeType {
  extraSmall = "extraSmall",
  small = "small",
  medium = "medium",
  big = "big",
  scale = "scale",
}

const enum IconSizes {
  extraSmall = 8,
  small = 12,
  medium = 16,
  big = 24,
  scale = "scale",
}

const getSizeStyle = (size?: IconSizeType | number) => {
  switch (size) {
    case "scale":
      return `
          &:not(:root) {
            width: 100%;
            height: 100%;
          }
        `;
    case IconSizeType.extraSmall:
      return `
          
      width: ${IconSizes.extraSmall}px;
      
      min-width: ${IconSizes.extraSmall}px;
      
      height: ${IconSizes.extraSmall}px;
      
      min-height: ${IconSizes.extraSmall}px;
    `;
    case IconSizeType.small:
      return `
          
      width: ${IconSizes.small}px;
      
      min-width: ${IconSizes.small}px;
      
      height: ${IconSizes.small}px;
      
      min-height: ${IconSizes.small}px;
    `;
    case IconSizeType.medium:
      return `
          
      width: ${IconSizes.medium}px;
      
      min-width: ${IconSizes.medium}px;
      
      height: ${IconSizes.medium}px;
      
      min-height: ${IconSizes.medium}px;
    `;
    case IconSizeType.big:
      return `
          width: ${IconSizes.big}px;
          min-width: ${IconSizes.big}px;
          height: ${IconSizes.big}px;
          min-height: ${IconSizes.big}px;
        `;
    default:
      return `
        width: ${size}px;
        min-width: ${size}px;
        height: ${size}px;
        min-height: ${size}px;
      `;
  }
};

const commonIconsStyles = css<{ size?: IconSizeType | number }>`
  overflow: hidden;
  vertical-align: middle;
  ${(props) => getSizeStyle(props.size)};
`;

export default commonIconsStyles;
