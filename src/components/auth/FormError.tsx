export function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-[8px] border border-amber bg-amber-50 px-[12px] py-[9px] text-small font-medium text-t-amber">
      {message}
    </p>
  )
}
