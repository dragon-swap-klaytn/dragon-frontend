import { CaretDown } from "@phosphor-icons/react";
import React, { useState } from "react";
import { styled } from "styled-components";
import { Flex } from "../../../../components/Box";
import { UserMenuProps, variants } from "./types";

export const StyledUserMenu = styled(Flex)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.tertiary};
  border-radius: 16px;
  box-shadow: inset 0px -2px 0px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: inline-flex;
  height: 32px;
  padding-left: 32px;
  padding-right: 8px;
  position: relative;

  &:hover {
    opacity: 0.65;
  }
`;

export const LabelText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  display: none;
  font-weight: 600;

  ${({ theme }) => theme.mediaQueries.sm} {
    display: block;
    margin-left: 8px;
    margin-right: 4px;
  }
`;

const UserMenu: React.FC<UserMenuProps> = ({
  account,
  // text,
  // avatarSrc,
  // avatarClassName,
  variant = variants.DEFAULT,
  children,
  disabled,
  placement = "bottom-end",
  recalculatePopover,
  ellipsis = true,
  icon,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const accountEllipsis = account ? `${account.substring(0, 2)}...${account.substring(account.length - 4)}` : null;

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center space-x-2 hover:opacity-70"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="text-sm">{ellipsis ? accountEllipsis : account}</span>
        {!disabled && <CaretDown size={16} />}
      </button>

      {children?.({ isOpen })}
    </div>
  );

  // </div>
};

export default UserMenu;
