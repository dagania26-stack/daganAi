import DOMPurify from "isomorphic-dompurify"

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "blockquote",
  "a", "img", "span", "h1", "h2", "h3", "h4", "ul", "ol", "li",
]
const ALLOWED_ATTR = ["href", "src", "alt", "title", "style", "target", "rel", "data-width", "data-align"]

export function sanitizeAnnouncementHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
}
