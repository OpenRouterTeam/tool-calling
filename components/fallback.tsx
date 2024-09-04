import { Button } from '@/components/ui/button'

export default function Fallback() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center h-screen">
      Something went wrong.
      <br /> Please refresh the page.
      <Button onClick={() => (window.location.href = window.location.href)}>
        Refresh
      </Button>
    </div>
  )
}
