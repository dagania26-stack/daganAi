"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

// Supprime les emojis Unicode (filet de sécurité côté rendu)
function stripEmojis(text: string): string {
  return text.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}]/gu,
    ""
  ).trim();
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-display font-bold text-lg text-dark mt-4 mb-2 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display font-bold text-base text-dark mt-4 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display font-semibold text-sm text-dark mt-3 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="font-sans text-sm text-dark leading-relaxed mb-2 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-dark">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-muted">{children}</em>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors duration-150"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-terracotta/40 pl-3 my-3 italic text-muted text-sm leading-relaxed">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-none space-y-1 mb-2 pl-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-2 pl-1 text-sm text-dark">
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => {
    // Detect if inside ol (ordered) via the parent context — use a simple bullet for ul
    const isOrdered = "index" in props;
    return (
      <li className="flex items-start gap-2 text-sm text-dark leading-relaxed">
        {!isOrdered && (
          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-terracotta/60" aria-hidden="true" />
        )}
        <span>{children}</span>
      </li>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-terracotta/8">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left font-display font-semibold text-dark text-xs px-3 py-2 border border-border-custom">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="font-sans text-dark text-xs px-3 py-2 border border-border-custom">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-surface/50">{children}</tr>
  ),
  code: ({ children }) => (
    <code className="font-mono text-xs bg-surface border border-border-custom rounded px-1 py-0.5 text-dark">
      {children}
    </code>
  ),
  hr: () => <hr className="border-border-custom my-3" />,
};

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {stripEmojis(content)}
    </ReactMarkdown>
  );
}
