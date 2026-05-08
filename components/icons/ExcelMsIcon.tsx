/** Figma Office Logos / Excel 24×24에 맞춘 단순화 마크(장식용) */
export default function ExcelMsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      width={24}
      height={24}
      aria-hidden
    >
      <path
        d="M12.2 2.25 20.25 2.25A1.75 1.75 0 0 1 22 4v9.4l-4.9-2.1L12.2 13.5V4A1.75 1.75 0 0 1 14 2.25H12.2z"
        fill="#33C481"
      />
      <path d="M12.2 2.25v11.25l4.9-2.1L22 13.5V4c0-.97-.78-1.75-1.75-1.75H12.2z" fill="#107C41" />
      <rect x="2" y="5.5" width="12.5" height="16" rx="1.75" fill="#185C37" />
      <path
        fill="#fff"
        d="M5.15 9.35h2.25l1.4 2.5 1.4-2.5h2.15l-2.35 3.65 2.35 3.65H10.2l-1.4-2.45-1.4 2.45H5.15l2.35-3.65-2.35-3.65z"
      />
    </svg>
  );
}
