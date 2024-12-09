import { CaretLeft, X } from "@phosphor-icons/react";
import clsx from "clsx";
import React, { PropsWithChildren, useContext } from "react";
import { useTheme } from "styled-components";
import Heading from "../../components/Heading/Heading";
import { ModalV2Context } from "./ModalV2";
import { mobileFooterHeight } from "./styles";
import { ModalProps, ModalWrapperProps } from "./types";

export const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300;

export const ModalWrapper = ({
  children,
  onDismiss,
  hideCloseButton,
  maxWidth,
  ...props
}: PropsWithChildren<ModalWrapperProps>) => {
  // const { isMobile } = useMatchBreakpoints();
  // const wrapperRef = useRef<HTMLDivElement>(null);

  //   export const ModalContainer = styled(MotionBox)`
  //   overflow: hidden;
  //   background: ${({ theme }) => theme.modal.background};
  //   box-shadow: 0px 20px 36px -8px rgba(14, 14, 44, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.05);
  //   border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  //   border-radius: 32px 32px 0px 0px;
  //   width: 100%;
  //   max-height: calc(var(--vh, 1vh) * 100);
  //   z-index: ${({ theme }) => theme.zIndices.modal};
  //   position: absolute;
  //   bottom: 0;
  //   max-width: none !important;
  //   min-height: 300px;

  //   ${({ theme }) => theme.mediaQueries.md} {
  //     width: auto;
  //     position: auto;
  //     bottom: auto;
  //     border-radius: 32px;
  //     max-height: 100vh;
  //   }
  // ` as typeof MotionBox;

  return (
    // @ts-ignore
    <div
      // drag={isMobile && !hideCloseButton ? "y" : false}
      // dragConstraints={{ top: 0, bottom: 600 }}
      // dragElastic={{ top: 0 }}
      // dragSnapToOrigin
      // onDragStart={() => {
      //   if (wrapperRef.current) wrapperRef.current.style.animation = "none";
      // }}
      // // @ts-ignore
      // onDragEnd={(e, info) => {
      //   if (info.velocity.y > MODAL_SWIPE_TO_CLOSE_VELOCITY && onDismiss) onDismiss();
      // }}
      className={clsx(
        "p-6 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gray-850 z-[9999] w-full",
        // "p-6 bg-gray-850 z-[9999] w-full",
        maxWidth
      )}
      // ref={wrapperRef}
    >
      {children}
    </div>
  );
};

const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  title,
  onDismiss: onDismiss_,
  onBack,
  children,
  hideCloseButton = false,
  headerPadding = "12px 24px",
  bodyPadding = "24px",
  headerBackground = "transparent",
  minWidth = "320px",
  maxWidth = "max-w-md",
  headerRightSlot,
  bodyAlignItems,
  headerBorderColor,
  bodyTop = "0px",
  ...props
}) => {
  const context = useContext(ModalV2Context);
  const onDismiss = context?.onDismiss || onDismiss_;
  const theme = useTheme();
  return (
    <ModalWrapper
      minWidth={minWidth}
      onDismiss={onDismiss}
      hideCloseButton={hideCloseButton}
      maxWidth={maxWidth}
      {...props}
    >
      {/* align-items: center;
  background: transparent;
  border-bottom: 1px solid ${({ theme, headerBorderColor }) => headerBorderColor || theme.colors.cardBorder};
  display: flex;
  padding: 12px 24px;

  ${({ theme }) => theme.mediaQueries.md} {
    background: ${({ background }) => background || "transparent"};
  } */}

      {/* <ModalHeader
        background={getThemeValue(theme, `colors.${headerBackground}`, headerBackground)}
        p={headerPadding}
        headerBorderColor={headerBorderColor}
      > */}
      <div
        // background={getThemeValue(theme, `colors.${headerBackground}`, headerBackground)}
        // p={headerPadding}
        // headerBorderColor={headerBorderColor}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-1">
          {onBack && (
            <button type="button" onClick={onBack}>
              <CaretLeft height={20} width={20} className="text-on-surface-tertiary" />
            </button>
          )}
          <Heading>{title}</Heading>
        </div>
        <div className="flex items-center space-x-3">
          {headerRightSlot}

          {!hideCloseButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.();
              }}
              aria-label="Close the dialog"
              className="hover:opacity-70"
            >
              <X height={20} width={20} className="text-on-surface-tertiary" />
            </button>
          )}
        </div>
      </div>

      {/* export const ModalBody = styled(Flex)`
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(90vh - ${mobileFooterHeight}px);
  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    max-height: 90vh;
  }
`; */}

      <div
        className="flex relative overflow-y-auto overflow-x-hidden flex-col max-h-[90vh]"
        // position="relative"
        // top={bodyTop}
        // // prevent drag event from propagating to parent on scroll
        // onPointerDownCapture={(e) => e.stopPropagation()}
        // p={bodyPadding}
        // style={{ alignItems: bodyAlignItems ?? "normal" }}
        style={{
          maxHeight: `calc(90vh - ${mobileFooterHeight}px)`,
        }}
      >
        {children}
      </div>
    </ModalWrapper>
  );
};

export default Modal;
