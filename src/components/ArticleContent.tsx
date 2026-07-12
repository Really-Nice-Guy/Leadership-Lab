import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const cleaned = content.replace(/^sunday thoughts\s*:\s*/i, '').trim();

  return (
    <div className="prose prose-neutral max-w-[68ch] prose-headings:font-medium prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-p:leading-relaxed prose-li:my-1 prose-a:underline prose-a:underline-offset-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleaned}</ReactMarkdown>
    </div>
  );
}
