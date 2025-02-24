interface Props {
  className?: string
  size?: number
}

export default function MediumLogo({ className, size = 32 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_671_5390)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 3C23.1797 3 29 8.82029 29 16C29 23.1797 23.1797 29 16 29C8.82029 29 3 23.1797 3 16C3 8.82029 8.82029 3 16 3Z"
          fill="white"
        />
        <path
          d="M16.9596 16C16.9596 18.3494 15.0679 20.2541 12.7345 20.2541C10.401 20.2541 8.50954 18.35 8.50954 16C8.50954 13.65 10.4011 11.7461 12.7345 11.7461C15.0678 11.7461 16.9596 13.6506 16.9596 16ZM21.5945 16C21.5945 18.2117 20.6487 20.0045 19.482 20.0045C18.3153 20.0045 17.3694 18.2111 17.3694 16C17.3694 13.7889 18.3153 11.9956 19.482 11.9956C20.6487 11.9956 21.5945 13.7889 21.5945 16ZM23.4903 16C23.4903 17.9816 23.1576 19.5878 22.7473 19.5878C22.337 19.5878 22.0043 17.981 22.0043 16C22.0043 14.0191 22.337 12.4122 22.7474 12.4122C23.1579 12.4122 23.4903 14.0186 23.4903 16Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_671_5390">
          <rect width="26" height="26" fill="white" transform="translate(3 3)" />
        </clipPath>
      </defs>
    </svg>
  )
}
