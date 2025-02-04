import { X } from "@phosphor-icons/react";
import clsx from "clsx";
import { m as motion, MotionProps } from "framer-motion";
import React, { forwardRef, HTMLAttributes, MouseEvent, PropsWithChildren, useEffect } from "react";
import { styled } from "styled-components";
import { MotionBox } from "../../components/Box";
import Flex from "../../components/Box/Flex";
import { IconButton } from "../../components/Button";
import { ArrowBackIcon } from "../../components/Svg";
import { WindowSize } from "../../consts";
import { useWindowSize } from "../../hooks/useWindowSize";
import { ModalProps } from "./types";

export const mobileFooterHeight = 73;

export const ModalHeader = styled(Flex)<{ background?: string; headerBorderColor?: string }>`
  align-items: center;
  background: transparent;
  border-bottom: 1px solid ${({ theme, headerBorderColor }) => headerBorderColor || theme.colors.cardBorder};
  display: flex;
  padding: 12px 24px;

  ${({ theme }) => theme.mediaQueries.md} {
    background: ${({ background }) => background || "transparent"};
  }
`;

export const ModalTitle = styled(Flex)`
  align-items: center;
  flex: 1;
`;

export const ModalBody = styled(Flex)`
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(90vh - ${mobileFooterHeight}px);
  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    max-height: 90vh;
  }
`;

export const ModalCloseButton: React.FC<React.PropsWithChildren<{ onDismiss: ModalProps["onDismiss"] }>> = ({
  onDismiss,
}) => {
  return (
    <button
      type="button"
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onDismiss?.();
      }}
      aria-label="Close the dialog"
      className="hover:opacity-70 fixed right-6 top-6 z-50"
    >
      <X height={20} width={20} className="text-on-surface-subtlest" />
    </button>
  );
};

export const ModalBackButton: React.FC<React.PropsWithChildren<{ onBack: ModalProps["onBack"] }>> = ({ onBack }) => {
  return (
    <IconButton variant="text" onClick={onBack} area-label="go back" mr="8px">
      <ArrowBackIcon color="primary" />
    </IconButton>
  );
};

export const ModalContainer = styled(MotionBox)`
  overflow: hidden;
  background: #222;
  box-shadow: 0px 20px 36px -8px rgba(14, 14, 44, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 32px 32px 0px 0px;
  width: 100%;
  max-height: calc(var(--vh, 1vh) * 100);
  z-index: ${({ theme }) => theme.zIndices.modal};
  position: absolute;
  bottom: 0;
  max-width: none !important;
  min-height: 300px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: auto;
    position: auto;
    bottom: auto;
    border-radius: 32px;
    max-height: 100vh;
  }
` as typeof MotionBox;

export const ModalContainerV3 = forwardRef<
  HTMLDivElement,
  PropsWithChildren<
    MotionProps & HTMLAttributes<HTMLElement> & { maxWidth?: string; onDismiss: ModalProps["onDismiss"] }
  >
>(({ children, maxWidth = "max-w-md", onDismiss, ...rest }, ref) => {
  const { width } = useWindowSize();
  useEffect(() => {
    if (width < WindowSize.mobile) return;

    onDismiss?.();
  }, [onDismiss, width]);

  return (
    <motion.div
      ref={ref}
      className={clsx(
        "overflow-hidden bg-gray-850 z-modal w-full",
        "px-6 pb-6 absolute bottom-0 min-h-[300px] rounded-t-2xl max-h-[80vh]",
        "md:p-6 md:rounded-2xl md:max-h-fit md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
        {
          [maxWidth]: width >= 768,
        }
      )}
      {...rest}
    >
      <button
        className="w-10 h-1 bg-neutral rounded mt-2 mb-6 flex justify-center mx-auto md:hidden"
        type="button"
        onClick={onDismiss}
      />
      {children}
    </motion.div>
  );
});
