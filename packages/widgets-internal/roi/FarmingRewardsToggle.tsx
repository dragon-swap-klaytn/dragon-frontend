import { memo, useCallback } from "react";

import { CheckboxV2 } from "@pancakeswap/uikit";

interface Props {
  on?: boolean;
  onToggle?: (on: boolean) => void;
}

export const FarmingRewardsToggle = memo(function FarmingRewardsToggle({ on = true, onToggle }: Props) {
  const onChange = useCallback(() => onToggle?.(!on), [onToggle, on]);

  return <CheckboxV2 checked={on} onChange={onChange} />;
});
