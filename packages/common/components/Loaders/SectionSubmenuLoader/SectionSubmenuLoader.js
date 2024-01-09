import React from "react";
import PropTypes from "prop-types";
import { StyledSubmenu } from "./StyledSubmenuLoader";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const SectionSubmenuLoader = ({ id, className, style, ...rest }) => {
  const { title } = rest;

  return (
    <StyledSubmenu id={id} className={className} style={style}>
      <RectangleSkeleton title={title} width="80" height="32" />
      <RectangleSkeleton title={title} width="115" height="32" />
    </StyledSubmenu>
  );
};

SectionSubmenuLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

SectionSubmenuLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default SectionSubmenuLoader;
