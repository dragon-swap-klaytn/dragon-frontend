interface Props {
  className?: string
  up?: boolean
  down?: boolean
}

function CaretUpDown({ className, up = false, down = false }: Props) {
  return (
    <svg className={className} width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 0L6.53109 5.14286H0.468911L3.5 0Z" fill={up ? '#fff' : '#52525b'} />
      <path d="M3.5 12L0.468912 6.85714L6.53109 6.85714L3.5 12Z" fill={down ? '#fff' : '#52525b'} />
    </svg>
  )
}

export default CaretUpDown
