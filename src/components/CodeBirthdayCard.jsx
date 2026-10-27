import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, FileCode2 } from 'lucide-react';
import { codeSnippet } from '../data/birthdayContent';

// Very small JS syntax highlighter tailored to the snippet.
function highlight(code) {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>')
    .replace(/(&quot;[^&]*?&quot;|"[^"]*?"|💜)/g, '<span class="tok-str">$1</span>')
    .replace(/\b(const|console)\b/g, '<span class="tok-key">$1</span>')
    .replace(/\b(log)\b/g, '<span class="tok-fn">$1</span>')
    .replace(/([{}[\]():;,])/g, '<span class="tok-pun">$1</span>');
}

export default function CodeBirthdayCard() {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => codeSnippet.split('\n'), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="px-4 py-24 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-3xl"
      >
        <div className="overflow-hidden rounded-2xl border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.2)] bg-slate-950/90 backdrop-blur-md">
          {/* VS Code style title bar */}
          <div className="flex items-center justify-between border-b border-purple-500/20 bg-slate-900/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 flex items-center gap-1.5 font-mono text-xs text-purple-300/70">
                <FileCode2 size={13} className="text-purple-400" />
                birthdayCard.js
              </span>
            </div>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 font-mono text-xs text-purple-200 transition-colors hover:bg-purple-500/20 cursor-pointer"
              aria-label="Copy code to clipboard"
            >
              {copied ? <Check size={13} className="text-yellow-300" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* code body with line numbers */}
          <div className="flex bg-slate-950/80 font-mono text-[13px] leading-7 sm:text-sm">
            <div className="select-none border-r border-purple-500/10 px-3 py-4 text-right text-purple-400/30">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="overflow-x-auto px-4 py-4 text-purple-100/90">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: highlight(line) || '&nbsp;' }}
                />
              ))}
              <div className="mt-1 flex items-center">
                <span className="text-purple-400">&gt;</span>
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-purple-400" />
              </div>
            </pre>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-center text-purple-200/70 sm:text-lg font-sans"
        >
          Some people teach you how to write code. Others inspire you to believe in what
          you can create. Thank you for being both.
        </motion.p>
      </motion.div>
    </section>
  );
}
