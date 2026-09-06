import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeImageUrl } from "../lib/api";
import { BrandIcon } from "./TipCard";

/** Ligne de la forme [icon:github] → affiche l'icône de marque thesvg.org */
function IconLine({ children }: { children?: React.ReactNode }) {
  const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
  const m = text.trim().match(/^\[icon:([a-z0-9-]+)\]$/i);
  if (!m) return <p>{children}</p>;
  return (
    <div className="my-4 flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3">
      <BrandIcon slug={m[1].toLowerCase()} className="h-8 w-8" />
      <span className="text-sm text-bone-500">
        Icône de marque :{" "}
        <a
          className="text-redhot-400 hover:underline"
          href={`https://thesvg.org/icons/${m[1].toLowerCase()}/default.svg`}
          target="_blank"
          rel="noopener"
        >
          thesvg.org/{m[1].toLowerCase()}
        </a>
      </span>
    </div>
  );
}

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-astuce">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => {
            const url = typeof src === "string" ? safeImageUrl(src) : null;
            if (!url) return null;
            return <img src={url} alt={alt ?? ""} loading="lazy" className="rounded-xl" />;
          },
          p: ({ children }) => <IconLine>{children}</IconLine>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
