import React, { createContext, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Overlay } from "../../components/Overlay";
import getPortalRoot from "../../util/getPortalRoot";

export interface ModalV2Props {
  isOpen?: boolean;
  onDismiss?: () => void;
  closeOnOverlayClick?: boolean;
  children?: React.ReactNode;
}

export const ModalV2Context = createContext<{
  onDismiss?: () => void;
}>({});

export type UseModalV2Props = ReturnType<typeof useModalV2>;
export function useModalV2() {
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

export function ModalV2({ isOpen, onDismiss, closeOnOverlayClick, children }: ModalV2Props) {
  const handleOverlayDismiss = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (closeOnOverlayClick) {
      onDismiss?.();
    }
  };

  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const portalRoot = getPortalRoot();
    if (!portalRoot) return;

    setPortal(portalRoot);
  }, []);

  if (!portal) return null;

  return createPortal(
    <ModalV2Context.Provider value={{ onDismiss }}>
      {isOpen && (
        <>
          <Overlay onClick={handleOverlayDismiss} />
          {children}
        </>
      )}
    </ModalV2Context.Provider>,
    portal
  );
}
