interface HtmlPreviewProps {
  htmlContent: string;
}

export function HtmlPreview({ htmlContent }: HtmlPreviewProps) {
  return <iframe srcDoc={htmlContent} className="w-full h-full border-0" title="HTML Preview" sandbox="allow-scripts" />;
}
