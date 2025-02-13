import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser, isLoading }) => {
  const [displayContent, setDisplayContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isUser && !isLoading) {
      setIsTyping(true);
      setCurrentIndex(0);
      setDisplayContent('');

      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < content.length) {
            setDisplayContent((prevContent) => prevContent + content[prev]);
            return prev + 1;
          }
          clearInterval(interval);
          setIsTyping(false);
          return prev;
        });
      }, 10);

      return () => clearInterval(interval);
    } else {
      setDisplayContent(content);
    }
  }, [content, isUser, isLoading]);

  const messageContent = isUser ? content : displayContent;

  return (
    <div
      className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-lg ${
        isUser
          ? 'bg-white text-blue-600 ml-auto rounded-br-none transform transition-all duration-300 hover:shadow-lg'
          : 'bg-white/10 text-white shadow-sm rounded-bl-none transform transition-all duration-300 hover:shadow-lg'
      }`}
    >
      <div className={`prose prose-sm max-w-none ${isUser ? '' : 'prose-invert'}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className={`mb-2 last:mb-0 ${isUser ? 'text-blue-600' : 'text-white'}`}>
                {children}
              </p>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${isUser ? 'text-blue-600' : 'text-white'}`}
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="rounded-lg max-w-full h-auto my-2 shadow-sm"
                loading="lazy"
              />
            ),
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            h1: ({ children }) => (
              <h1 className={`text-xl font-bold mb-2 ${isUser ? 'text-blue-600' : 'text-white'}`}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className={`text-lg font-bold mb-2 ${isUser ? 'text-blue-600' : 'text-white'}`}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className={`text-base font-bold mb-2 ${isUser ? 'text-blue-600' : 'text-white'}`}>
                {children}
              </h3>
            ),
            code: ({ children }) => (
              <code
                className={`px-1 py-0.5 rounded ${
                  isUser ? 'bg-blue-100' : 'bg-white/10'
                }`}
              >
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre
                className={`p-3 rounded-lg mb-2 overflow-x-auto ${
                  isUser ? 'bg-blue-50' : 'bg-white/10'
                }`}
              >
                {children}
              </pre>
            ),
          }}
        >
          {messageContent}
        </ReactMarkdown>
      </div>
      {isTyping && (
        <div className="flex space-x-1 mt-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
        </div>
      )}
    </div>
  );
};