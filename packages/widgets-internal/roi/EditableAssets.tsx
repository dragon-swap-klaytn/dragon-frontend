import { useTranslation } from "@pancakeswap/localization";
import { memo, ReactNode, useCallback, useRef } from "react";

import { ButtonV2 } from "@pancakeswap/uikit";
import { AssetCard, AssetCardProps, SectionTitle } from "./AssetCard";

interface Props extends AssetCardProps {
  title?: ReactNode;
  onReset?: () => void;
}

export const EditableAssets = memo(function EditableAssets({ title, onReset, ...rest }: Props) {
  const { t } = useTranslation();
  const firstPriceInputRef = useRef<HTMLInputElement>(null);
  const onEdit = useCallback(() => {
    firstPriceInputRef.current?.focus();
    firstPriceInputRef.current?.select();
  }, []);

  return (
    <div className="rounded-2xl w-full">
      <div className="w-full flex items-center space-x-2 justify-between mb-2.5">
        <SectionTitle>{title}</SectionTitle>

        <div className="flex items-center space-x-2">
          <ButtonV2 variant="subtle" scale="xs" onClick={onEdit}>
            {t("Edit")}
          </ButtonV2>

          <ButtonV2 variant="subtle" scale="xs" onClick={() => onReset?.()}>
            {t("Reset")}
          </ButtonV2>
        </div>
      </div>

      <AssetCard {...rest} firstPriceInputRef={firstPriceInputRef} />
    </div>
  );
});
