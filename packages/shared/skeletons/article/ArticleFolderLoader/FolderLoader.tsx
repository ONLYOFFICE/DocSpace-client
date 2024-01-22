import React from "react";

import {
  StyledContainer,
  StyledBlock,
  StyledRectangleLoader,
} from "./FolderLoader.styled";
import { FolderLoaderProps } from "./FolderLoader.types";

const ArticleFolderLoader = ({
  id,
  className,
  style,
  showText,
  isVisitor,
  ...rest
}: FolderLoaderProps) => {
  return (
    <StyledContainer
      id={id}
      className={className}
      style={style}
      showText={showText}
    >
      {isVisitor ? (
        <>
          <StyledBlock showText={showText}>
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
          </StyledBlock>

          <StyledBlock showText={showText}>
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
          </StyledBlock>
        </>
      ) : (
        <>
          <StyledBlock showText={showText}>
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
          </StyledBlock>

          <StyledBlock showText={showText}>
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
            <StyledRectangleLoader
              {...rest}
              className="article-folder-loader"
            />
          </StyledBlock>
        </>
      )}
    </StyledContainer>
  );
};

export default ArticleFolderLoader;
