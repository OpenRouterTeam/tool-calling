export function ErrorMessage({ modelSlug }: { modelSlug?: string | null }) {
  return (
    <div className="text-red-500">
      Error: Failed to get response from {modelSlug ?? 'model'}. Please try
      again or select a different model.
    </div>
  )
}
