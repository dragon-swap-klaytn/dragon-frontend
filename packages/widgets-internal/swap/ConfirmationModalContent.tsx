import { ReactNode } from "react";

export function ConfirmationModalContent({
  bottomContent,
  topContent,
}: {
  topContent: ReactNode;
  bottomContent: ReactNode;
}) {
  return (
    <div className="w-full">
      {topContent}
      {bottomContent}
    </div>
  );
}
