export default function ContactForm() {
  return (
    <div className="w-full flex items-center justify-between">
      <p>You may contact support at <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="font-semibold underline">{`${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}</a>.</p>
    </div>
  )
}