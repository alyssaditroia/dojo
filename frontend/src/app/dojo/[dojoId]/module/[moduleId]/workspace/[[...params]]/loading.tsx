export default function WorkspaceLoading() {
  return (
    <div className="fixed inset-0 w-full h-full z-40 bg-background">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    </div>
  )
}