"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RefreshCw, Copy, Check, Code, Camera, Download } from "lucide-react"

declare global {
  interface Window {
    html2canvas: any
  }
}

export function CodePreview() {
  const [html, setHtml] = useState("")
  const [css, setCss] = useState("")
  const [js, setJs] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [previewContent, setPreviewContent] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("html")

  // Generate preview content
  useEffect(() => {
    if (autoRefresh) {
      updatePreview()
    }
  }, [html, css, js, autoRefresh])

  const updatePreview = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `
    setPreviewContent(content)
  }

  const copyToClipboard = () => {
    const content = `
<!DOCTYPE html>
<html>
  <head>
    <style>
${css}
    </style>
  </head>
  <body>
${html}
    <script>
${js}
    </script>
  </body>
</html>`

    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const simplifyHtml = () => {
    // Basic HTML formatting/simplification
    let formattedHtml = html
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/>\s+</g, ">\n<") // Add new lines between tags
      .replace(/^\s+|\s+$/gm, "") // Trim lines

    // Add indentation
    let indent = 0
    const indentSize = 2
    const lines = formattedHtml.split("\n")
    formattedHtml = lines
      .map((line) => {
        // Decrease indent for closing tags
        if (line.match(/<\/[^>]+>/) && !line.match(/<[^/][^>]*>/)) {
          indent -= 1
        }

        // Apply current indentation
        const indentedLine = " ".repeat(Math.max(0, indent * indentSize)) + line

        // Increase indent for opening tags (not self-closing)
        if (line.match(/<[^/][^>]*>/) && !line.match(/<[^>]+\/>/) && !line.match(/<\/[^>]+>/)) {
          indent += 1
        }

        return indentedLine
      })
      .join("\n")

    setHtml(formattedHtml)
  }

  const takeScreenshot = async () => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas")
      const iframe = document.querySelector("iframe")

      if (!iframe) return

      // Wait for iframe content to load
      await new Promise((resolve) => {
        if (iframe.contentDocument?.readyState === "complete") {
          resolve(true)
        } else {
          iframe.onload = () => resolve(true)
        }
      })

      // Use html2canvas approach
      const script = document.createElement("script")
      script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"
      script.onload = async () => {
        const html2canvas = window.html2canvas
        if (html2canvas && iframe.contentDocument?.body) {
          try {
            // Take screenshot of the iframe content
            const screenshot = await html2canvas(iframe.contentDocument.body, {
              allowTaint: true,
              useCORS: true,
              width: iframe.clientWidth,
              height: iframe.clientHeight,
              scrollX: 0,
              scrollY: 0,
            })

            // Create download link
            const link = document.createElement("a")
            link.download = "preview-screenshot.png"
            link.href = screenshot.toDataURL("image/png")
            link.click()
          } catch (err) {
            console.error("Error capturing screenshot:", err)
            alert("Nie udało się wykonać zrzutu ekranu. Spróbuj ponownie.")
          }
        }
      }

      document.head.appendChild(script)
    } catch (error) {
      console.error("Error taking screenshot:", error)
      alert("Nie udało się wykonać zrzutu ekranu. Spróbuj ponownie.")
    }
  }

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a")
    const file = new Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const downloadProject = () => {
    // Download HTML file
    const htmlContent = html
    downloadFile(htmlContent, "index.html", "text/html")

    // Download CSS file
    const cssContent = css
    downloadFile(cssContent, "styles.css", "text/css")

    // Download JavaScript file
    const jsContent = js
    downloadFile(jsContent, "script.js", "text/javascript")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
            </div>
          </div>

          <TabsContent value="html" className="mt-0">
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={simplifyHtml} className="flex items-center">
                <Code className="mr-2 h-4 w-4" /> Uprość HTML
              </Button>
            </div>
            <Textarea
              placeholder="Paste your HTML code here..."
              className="min-h-[400px] font-mono"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="css" className="mt-0">
            <Textarea
              placeholder="Paste your CSS code here..."
              className="min-h-[400px] font-mono"
              value={css}
              onChange={(e) => setCss(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="js" className="mt-0">
            <Textarea
              placeholder="Paste your JavaScript code here..."
              className="min-h-[400px] font-mono"
              value={js}
              onChange={(e) => setJs(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        {!autoRefresh && (
          <Button onClick={updatePreview} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Preview
          </Button>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Preview</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={downloadProject} className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Pobierz projekt
            </Button>
            <Button variant="outline" size="sm" onClick={takeScreenshot} className="flex items-center">
              <Camera className="mr-2 h-4 w-4" /> Zrzut ekranu
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy Code
                </>
              )}
            </Button>
          </div>
        </div>
        <Card className="flex-1 overflow-hidden border">
          <iframe
            srcDoc={previewContent}
            title="Code Preview"
            className="w-full h-[500px] border-0"
            sandbox="allow-scripts"
          />
        </Card>
      </div>
    </div>
  )
}

