/** Superfície base. variant: vidro (opcional). traco = filete âmbar no topo. */
export default function Card({ as: Tag = 'div', variant, traco, interactive, className = '', children, ...props }) {
  const classes = ['card', variant && `card--${variant}`, traco && 'card--traco', interactive && 'card--interactive', className]
    .filter(Boolean)
    .join(' ')
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}
