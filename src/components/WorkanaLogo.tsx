export function WorkanaLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/workana-logo.svg"
        alt="Workana"
        width={144}
        height={40}
        className="mt-[10px]"
      />
    </div>
  );
}
