export function ConfirmationModalContent({
  bottomContent,
  topContent,
}: {
  topContent: () => React.ReactNode;
  bottomContent: () => React.ReactNode;
}) {
  return (
    <div className="w-full">
      {topContent()}
      {bottomContent()}
    </div>
  );
}
