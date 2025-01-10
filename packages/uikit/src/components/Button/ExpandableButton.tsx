import React from "react";
import { SpaceProps } from "styled-system";

import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { ChevronDownIcon, ChevronUpIcon } from "../Svg";
import IconButton from "./IconButton";

interface Props extends SpaceProps {
  onClick?: () => void;
  expanded?: boolean;
}

export const ExpandableButton: React.FC<React.PropsWithChildren<Props>> = ({
  onClick,
  expanded,
  children,
  ...rest
}) => {
  return (
    <IconButton aria-label="Hide or show expandable content" onClick={onClick} {...rest}>
      {children}
      {expanded ? <ChevronUpIcon color="invertedContrast" /> : <ChevronDownIcon color="invertedContrast" />}
    </IconButton>
  );
};
ExpandableButton.defaultProps = {
  expanded: false,
};

export const ExpandableLabel: React.FC<React.PropsWithChildren<Props>> = ({ onClick, expanded, children }) => {
  return (
    <button
      type="button"
      className="hover:opacity-70 font-bold text-on-surface-brand flex items-center space-x-2 mx-auto text-xs"
      onClick={onClick}
    >
      <span>{children}</span> {expanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
    </button>
  );
};
ExpandableLabel.defaultProps = {
  expanded: false,
};
