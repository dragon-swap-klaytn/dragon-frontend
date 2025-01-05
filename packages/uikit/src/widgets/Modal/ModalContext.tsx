import get from "lodash/get";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Overlay } from "../../components/Overlay";
import { useIsomorphicEffect } from "../../hooks";
import getPortalRoot from "../../util/getPortalRoot";
import { Handler } from "./types";

interface ModalsContext {
  isOpen: boolean;
  nodeId: string;
  modalNode: React.ReactNode;
  setModalNode: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  onPresent: (node: React.ReactNode, newNodeId: string, closeOverlayClick: boolean) => void;
  onDismiss: Handler;
}

export const Context = createContext<ModalsContext>({
  isOpen: false,
  nodeId: "",
  modalNode: null,
  setModalNode: () => null,
  onPresent: () => null,
  onDismiss: () => null,
});

const ModalProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalNode, setModalNode] = useState<React.ReactNode>();
  const [nodeId, setNodeId] = useState("");
  const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true);

  useIsomorphicEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    return () => window.removeEventListener("resize", setViewportHeight);
  }, []);

  const handlePresent = useCallback((node: React.ReactNode, newNodeId: string, closeOverlayClick: boolean) => {
    setModalNode(node);
    setIsOpen(true);
    setNodeId(newNodeId);
    setCloseOnOverlayClick(closeOverlayClick);
  }, []);

  const handleDismiss = useCallback(() => {
    setModalNode(undefined);
    setIsOpen(false);
    setNodeId("");
    setCloseOnOverlayClick(true);
  }, []);

  const handleOverlayDismiss = useCallback(() => {
    if (closeOnOverlayClick) {
      const customOnDismiss = get(modalNode, "props.customOnDismiss") as any;
      customOnDismiss?.();
      handleDismiss();
    }
  }, [closeOnOverlayClick, handleDismiss, modalNode]);

  const providerValue = useMemo(() => {
    return { isOpen, nodeId, modalNode, setModalNode, onPresent: handlePresent, onDismiss: handleDismiss };
  }, [isOpen, nodeId, modalNode, setModalNode, handlePresent, handleDismiss]);

  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const portalRoot = getPortalRoot();
    if (!portalRoot) return;

    setPortal(portalRoot);
  }, []);

  if (!portal) return null;

  return (
    <Context.Provider value={providerValue}>
      {createPortal(
        isOpen && (
          <div className="flex flex-col justify-center items-center fixed inset-0 z-50">
            <Overlay onClick={handleOverlayDismiss} />

            {React.isValidElement(modalNode) &&
              React.cloneElement(modalNode, {
                // @ts-ignore
                onDismiss: handleDismiss,
              })}
          </div>
        ),
        portal
      )}

      {children}
    </Context.Provider>
  );
};

export default ModalProvider;
