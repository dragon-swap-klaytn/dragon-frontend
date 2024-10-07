import { Svg, SvgProps } from '@pancakeswap/uikit'

const Icon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
      <g clip-path="url(#clip0_2030_4666)">
        <rect width="32" height="32" rx="7" fill="#BFF009" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.7036 10.3111L14.1809 21.1193L14.5171 20.0753L11.3758 10.3111H12.54L15.0994 18.2663L15.4348 17.2222L13.2121 10.3111H14.3763L16.0172 15.4124L17.6591 10.3111H26.1334L22.0721 22.9333H13.5978L13.5993 22.9292L9.53941 10.3111H10.7036ZM8.86728 10.3111L12.9286 22.9333H11.7644L7.70305 10.3111H8.86728ZM7.03092 10.3111L11.0922 22.9333H9.928L5.8667 10.3111H7.03092Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_2030_4666">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )
}

export default Icon
