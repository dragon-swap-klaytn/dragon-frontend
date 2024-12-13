import { CaretDown } from "@phosphor-icons/react";
import React, { useState } from "react";
import { styled } from "styled-components";
import { Flex } from "../../../../components/Box";
import { UserMenuItem } from "./styles";
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

const Menu = styled.div<{ $isOpen: boolean }>`
  background-color: ${({ theme }) => theme.card.background};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding-bottom: 4px;
  padding-top: 4px;
  pointer-events: auto;
  width: 280px;
  visibility: visible;
  z-index: 1001;

  ${({ $isOpen }) =>
    !$isOpen &&
    `
    pointer-events: none;
    visibility: hidden;
  `}

  ${UserMenuItem}:first-child {
    border-radius: 8px 8px 0 0;
  }

  ${UserMenuItem}:last-child {
    border-radius: 0 0 8px 8px;
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
  // const [targetRef, setTargetRef] = useState<HTMLDivElement | null>(null);
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);

  // const { styles, attributes, update } = usePopper(targetRef, tooltipRef, {
  //   strategy: "fixed",
  //   placement,
  //   modifiers: [{ name: "offset", options: { offset: [0, 0] } }],
  // });

  const accountEllipsis = account ? `${account.substring(0, 2)}...${account.substring(account.length - 4)}` : null;

  // recalculate the popover position
  // useEffect(() => {
  //   if (recalculatePopover && isOpen && update) update();
  // }, [isOpen, update, recalculatePopover]);

  // useEffect(() => {
  //   const showDropdownMenu = () => {
  //     setIsOpen(true);
  //   };

  //   const hideDropdownMenu = (evt: MouseEvent | TouchEvent) => {
  //     const target = evt.target as Node;
  //     if (target && !tooltipRef?.contains(target)) {
  //       setIsOpen(false);
  //       evt.stopPropagation();
  //     }
  //   };

  //   targetRef?.addEventListener("mouseenter", showDropdownMenu);
  //   targetRef?.addEventListener("mouseleave", hideDropdownMenu);

  //   return () => {
  //     targetRef?.removeEventListener("mouseenter", showDropdownMenu);
  //     targetRef?.removeEventListener("mouseleave", hideDropdownMenu);
  //   };
  // }, [targetRef, tooltipRef, setIsOpen]);

  // {icon ?? <MenuIcon className={avatarClassName} avatarSrc={avatarSrc} variant={variant} />}

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center space-x-2 hover:opacity-70"
        onClick={() => {
          console.log("__clicked");
          setIsOpen((prev) => !prev);
        }}
      >
        {/* {icon ?? <MenuIcon className={avatarClassName} avatarSrc={avatarSrc} variant={variant} />} */}
        {/* <LabelText title={typeof text === "string" ? text || account : account}> */}
        {/* <span className="text-sm">{ellipsis ? accountEllipsis : account}</span> */}
        <span className="text-sm">{ellipsis ? accountEllipsis : account}</span>
        {!disabled && <CaretDown size={16} />}
      </button>

      {children?.({ isOpen })}
    </div>
  );

  // </div>
};

export default UserMenu;
