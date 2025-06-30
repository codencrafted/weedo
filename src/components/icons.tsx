import type { SVGProps } from "react";

export function WeedoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-52 -52 104 104"
      fill="currentColor"
      {...props}
    >
      <g>
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" />
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" transform="rotate(45)" />
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" transform="rotate(90)" />
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" transform="rotate(135)" />
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" transform="rotate(180)" />
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" transform="rotate(225)" />
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" transform="rotate(270)" />
        <path d="M0,0 C-10,-20 -30,-20 -40,0 C-30,20 -10,20 0,0Z" transform="rotate(315)" />
      </g>
    </svg>
  );
}