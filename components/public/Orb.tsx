interface OrbProps {
  size?: number
  color?: string
  colorDeep?: string
  shade?: string
  float?: boolean
  squash?: boolean
  className?: string
  style?: React.CSSProperties
  delay?: string
}

export default function Orb({
  size = 80,
  color = '#C6FF3D',
  colorDeep = '#9EE028',
  shade = 'rgba(0,0,0,0.35)',
  float = false,
  squash = false,
  className = '',
  style = {},
  delay,
}: OrbProps) {
  const classes = ['orb', float ? 'orb-float' : '', squash ? 'orb-squash' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        flexShrink: 0,
        ['--orb-color' as string]: color,
        ['--orb-deep' as string]: colorDeep,
        ['--orb-shade' as string]: shade,
        animationDelay: delay,
        ...style,
      }}
    />
  )
}
