import { useTranslation } from "@pancakeswap/localization";
import { Dots } from "../Loader/Dots";
import { Text } from "../Text";

export function LoadingDot() {
  const { t } = useTranslation();

  return (
    <Text color="textSubtle" textAlign="center">
      <Dots>{t("Loading")}</Dots>
    </Text>
  );
}
