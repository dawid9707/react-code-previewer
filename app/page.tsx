import { CodePreview } from "@/components/code-preview"

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Code Preview</h1>
      <p className="text-center mb-8 text-muted-foreground">
        Paste your HTML, CSS, and JavaScript code to see a live preview
      </p>
      <CodePreview />
    </main>
  )
}

