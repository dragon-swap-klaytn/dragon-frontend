import { ReactNode } from "react";

import { ColumnCenter, Spinner } from "@pancakeswap/uikit";

export function InfoBox({ message, icon }: { message?: ReactNode; icon?: ReactNode }) {
  return (
    <ColumnCenter style={{ height: "100%", justifyContent: "center" }}>
      {icon ?? <Spinner />}
      {message && <p className="font-bold text-on-surface-primary mt-2">{message}</p>}
    </ColumnCenter>
  );
}
