import { useTranslation } from "@pancakeswap/localization";
import { Modal, ModalV2, ModalV2Props } from "@pancakeswap/uikit";
import { styled } from "styled-components";

import { RoiCalculator, RoiCalculatorProps } from "./RoiCalculator";

export const StyledModal = styled(Modal)`
  & > :nth-child(2) {
    padding: 0;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 860px;
  }
`;

export function RoiCalculatorModal({
  isOpen,
  closeOnOverlayClick,
  onDismiss,
  ...rest
}: RoiCalculatorProps & ModalV2Props) {
  const { t } = useTranslation();

  return (
    <ModalV2 onDismiss={onDismiss} isOpen={isOpen} closeOnOverlayClick={closeOnOverlayClick}>
      <Modal title={t("ROI Calculator")} maxWidth="max-w-4xl">
        <RoiCalculator {...rest} />
      </Modal>
    </ModalV2>
  );
}
