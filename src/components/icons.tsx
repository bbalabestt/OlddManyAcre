import type { SVGProps } from 'react';

export function SpaceWiseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 10H3C2.44772 10 2 10.4477 2 11V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V11C22 10.4477 21.5523 10 21 10Z" />
      <path d="M3 6H21V10H3V6Z" />
      <path d="M12 2V6" />
      <path d="M7 2V6" />
      <path d="M17 2V6" />
    </svg>
  );
}

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2 h-6 w-6"
      {...props}
    >
      <SpaceWiseIcon />
    </svg>
  );
}
