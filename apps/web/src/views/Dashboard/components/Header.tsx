export default function Header({ title, id }: { title: string; id?: string }) {
  return (
    <h3 id={id} className="text-xl text-on-surface">
      {title}
    </h3>
  )
}
