import clsx from 'clsx'
import { usePathname } from 'next/navigation'

export default function Background() {
  const pathname = usePathname()
  if (pathname !== '/') {
    return null
  }

  return (
    <>
      <div className="absolute -z-10 w-full left-0 top-[450px] lg:top-[800px]">
        <div
          className={clsx(
            'rounded-full -rotate-[17] bg-[#ff6600] absolute',
            'w-[410px] h-[220px] blur-[140px] -left-[120px] top-[200px]',
            'sm:w-[590px] sm:h-[317px] sm:blur-[200px] sm:left-0',
          )}
        />

        <div
          className={clsx(
            'rounded-full bg-[#FF2200] absolute',
            'w-[350px] h-[350px] blur-[140px] left-[120px]',
            'sm:w-[420px] sm:h-[420px] sm:blur-[200px] sm:right-auto sm:left-[400px]',
          )}
        />
      </div>

      <div className="absolute -z-10 w-full left-0 top-[2150px] s:top-[2200px] lg:top-[2000px]">
        <div
          className={clsx(
            'rounded-full -rotate-[17] bg-[#FF2200] absolute',
            'w-[225px] h-[127px] blur-[100px] left-0',
            'sm:w-[300px] sm:h-[180px] sm:blur-[150px]',
            'md:w-[420px] md:h-[220px] md:blur-[180px]',
            'lg:right-[400px] lg:left-auto',
          )}
        />
        <div
          className={clsx(
            'rounded-full bg-[#ff6600] absolute',
            'w-[200px] h-[200px] blur-[100px] left-[220px]',
            'sm:w-[250px] sm:h-[250px] sm:blur-[150px] sm:left-[400px]',
            'md:w-[350px] md:h-[350px] md:blur-[180px]',
            'lg:right-[100px] lg:left-auto',
          )}
        />
      </div>
    </>
  )
}
