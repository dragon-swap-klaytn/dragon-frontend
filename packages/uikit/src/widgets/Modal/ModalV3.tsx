import { X } from "@phosphor-icons/react";
import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { AnimatePresence, LazyMotion } from "framer-motion";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { createPortal } from "react-dom";
import { Overlay } from "../../components";
import { useMatchBreakpoints } from "../../contexts";
import { animationHandler, animationMap, animationVariants } from "../../util/animationToolkit";
import getPortalRoot from "../../util/getPortalRoot";
import { ModalContainerV3 } from "./styles";

export const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300;

const DomMax = () => import("./motionDomMax").then((mod) => mod.default);
const DomAnimation = () => import("./motionDomAnimation").then((mod) => mod.default);

export interface ModalV3Props {
  title?: string;
  isOpen?: boolean;
  onDismiss?: () => void;
  closeOnOverlayClick?: boolean;
  children?: React.ReactNode;
  hideCloseButton?: boolean;
  maxWidth?: string;
}

export const ModalV3Context = createContext<{
  onDismiss?: () => void;
}>({});

export type UseModalV3Props = ReturnType<typeof useModalV3>;
export function useModalV3() {
  const [isOpen, setIsOpen] = useState(false);

  const onDismiss = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);

  return {
    onDismiss,
    onOpen,
    isOpen,
    setIsOpen,
  };
}

export function ModalV3({
  title,
  isOpen,
  onDismiss,
  closeOnOverlayClick,
  hideCloseButton = false,
  maxWidth = "max-w-md",
  children,
}: ModalV3Props) {
  const { isMobile: _isMobile } = useMatchBreakpoints();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleOverlayDismiss = useCallback(
    (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      if (!closeOnOverlayClick) return;

      onDismiss?.();
    },
    [closeOnOverlayClick, onDismiss]
  );

  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const portalRoot = getPortalRoot();
    if (!portalRoot) return;

    setPortal(portalRoot);
  }, []);

  if (!portal) return null;

  return createPortal(
    <ModalV3Context.Provider value={{ onDismiss }}>
      {isOpen && (
        <>
          <Overlay onClick={handleOverlayDismiss} />

          <LazyMotion features={isMobile ? DomMax : DomAnimation}>
            <AnimatePresence>
              <DismissableLayer
                role="dialog"
                disableOutsidePointerEvents={false}
                onEscapeKeyDown={handleOverlayDismiss}
              >
                <ModalContainerV3
                  // @ts-ignore
                  onAnimationStart={() => animationHandler(wrapperRef.current)}
                  {...animationMap}
                  variants={animationVariants}
                  transition={{ duration: 0.3 }}
                  drag={_isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 600 }}
                  dragElastic={{ top: 0 }}
                  dragSnapToOrigin
                  onDragStart={() => {
                    if (wrapperRef.current) wrapperRef.current.style.animation = "none";
                  }}
                  // @ts-ignore
                  onDragEnd={(e, info) => {
                    if (info.velocity.y > MODAL_SWIPE_TO_CLOSE_VELOCITY && onDismiss) onDismiss();
                  }}
                  ref={wrapperRef}
                  maxWidth={maxWidth}
                >
                  <div className="flex items-center justify-between">
                    {title && <h2 className="text-lg font-bold text-on-surface">{title}</h2>}

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

                  <div className="relative overflow-y-auto overflow-x-hidden max-h-[90vh] mt-8">{children}</div>
                </ModalContainerV3>
              </DismissableLayer>
            </AnimatePresence>
          </LazyMotion>
        </>
      )}
    </ModalV3Context.Provider>,
    portal
  );
}
