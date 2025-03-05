import { CaretLeft, X } from "@phosphor-icons/react";
import clsx from "clsx";
import React, { PropsWithChildren, useCallback, useContext } from "react";
import { Context } from "./ModalContext";
import { ModalProps } from "./types";

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  title,
  onDismiss: onDismiss_,
  onBack,
  children,
  hideCloseButton = false,
  maxWidth = "max-w-md",
  minHeight,
  contentMinHeight,
  headerRightSlot,
}) => {
  const context = useContext(Context);
  const onDismiss = useCallback(() => {
    context?.onDismiss?.();
    onDismiss_?.();
  }, [context, onDismiss_]);

  return (
    <div
      className={clsx(
        "p-6 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gray-850 z-modal w-[calc(100%-2rem)] max-h-[92vh]",
        maxWidth,
        minHeight
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {onBack && (
            <button type="button" onClick={onBack} className="hover:opacity-70">
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

      <div
        className={clsx("flex relative overflow-y-auto overflow-x-hidden flex-col max-h-[72vh] mt-8", contentMinHeight)}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
