/** Two-column layout: stacks below 900px */
export default function MainGrid({ left, right, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-10 min-[900px]:grid-cols-2 ${className}`}
    >
      <div className="flex w-full flex-col items-center justify-center min-[900px]:items-center">
        {left}
      </div>
      <div className="flex w-full flex-col justify-center min-[900px]:min-h-[420px]">
        {right}
      </div>
    </div>
  );
}
