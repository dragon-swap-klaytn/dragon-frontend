import { CaretLeft, X } from "@phosphor-icons/react";
import clsx from "clsx";
import React, { PropsWithChildren, useContext } from "react";
import { ModalV2Context } from "./ModalV2";
import { ModalProps, ModalWrapperProps } from "./types";

export const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300;

export const ModalWrapper = ({ children, maxWidth = "max-w-md" }: PropsWithChildren<ModalWrapperProps>) => {
  return (
    <div
      className={clsx(
        "p-6 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gray-850 z-[9999] w-[calc(100%-2rem)]",
        maxWidth
      )}
    >
      {children}
    </div>
  );
};

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  title,
  onDismiss: onDismiss_,
  onBack,
  children,
  hideCloseButton = false,
  maxWidth = "max-w-md",
  headerRightSlot,
}) => {
  const context = useContext(ModalV2Context);
  const onDismiss = context?.onDismiss || onDismiss_;

  return (
    <ModalWrapper onDismiss={onDismiss} maxWidth={maxWidth}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {onBack && (
            <button type="button" onClick={onBack}>
              <CaretLeft height={20} width={20} className="text-on-surface-subtlest" />
            </button>
          )}
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
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
              <X height={20} width={20} className="text-on-surface-subtlest" />
            </button>
          )}
        </div>
      </div>

      <div className="flex relative overflow-y-auto overflow-x-hidden flex-col max-h-[90vh] mt-4">{children}</div>
    </ModalWrapper>
  );
};

export default Modal;
