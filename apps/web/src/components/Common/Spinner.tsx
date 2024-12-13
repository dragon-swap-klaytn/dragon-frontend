import { DragonSwapLogo } from 'components/Vector'

export default function Spinner() {
  return (
    <div className="">
      <DragonSwapLogo />

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="blue"
          stroke-width="5"
          fill="none"
          stroke-dasharray="200"
          stroke-dashoffset="0"
          stroke-linecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate attributeName="stroke-dashoffset" from="0" to="400" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
