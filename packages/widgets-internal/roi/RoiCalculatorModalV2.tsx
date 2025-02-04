import { Modal, ModalV2, ModalV2Props } from "@pancakeswap/uikit";

import { useTranslation } from "@pancakeswap/localization";
import { RoiCalculator, RoiCalculatorProps } from "./RoiCalculator";

export function RoiCalculatorModalV2({
  isOpen,
  closeOnOverlayClick,
  onDismiss,
  ...rest
}: RoiCalculatorProps & ModalV2Props) {
  const { t } = useTranslation();
  return (
    <ModalV2 onDismiss={onDismiss} isOpen={isOpen} closeOnOverlayClick={closeOnOverlayClick}>
      <Modal onDismiss={onDismiss} title={t("ROI Calculator")} maxWidth="max-w-4xl">
        <RoiCalculator {...rest} />
      </Modal>
    </ModalV2>
  );
}
