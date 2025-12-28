import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, FileX, Sparkles } from 'lucide-react';

// Custom components for ReactMarkdown styling (no className prop on ReactMarkdown itself)
const markdownComponents = {
    h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 border-b border-purple-100 pb-3 mb-4">{children}</h1>,
    h2: ({children}) => <h2 className="text-xl font-bold text-purple-900 mt-6 mb-3">{children}</h2>,
    h3: ({children}) => <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">{children}</h3>,
    p: ({children}) => <p className="text-gray-600 leading-relaxed mb-4">{children}</p>,
    strong: ({children}) => <strong className="font-semibold text-purple-700">{children}</strong>,
    ul: ({children}) => <ul className="my-4 space-y-2 list-disc pl-6">{children}</ul>,
    ol: ({children}) => <ol className="my-4 space-y-2 list-decimal pl-6">{children}</ol>,
    li: ({children}) => <li className="text-gray-600 marker:text-purple-400">{children}</li>,
    code: ({inline, children}) => inline 
        ? <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-sm">{children}</code>
        : <code className="block bg-gray-100 text-gray-900 p-4 rounded-xl shadow-lg overflow-x-auto">{children}</code>,
    pre: ({children}) => <pre className="bg-gray-100 text-gray-900 rounded-xl shadow-lg overflow-x-auto my-4">{children}</pre>,
    blockquote: ({children}) => <blockquote className="border-l-4 border-purple-400 bg-purple-50/50 py-1 px-4 rounded-r-lg my-4 italic">{children}</blockquote>,
    a: ({href, children}) => <a href={href} className="text-purple-600 underline underline-offset-2 hover:text-purple-800">{children}</a>,
};

function SummeryBox({ summery, hasConversation = false }) {
    if (summery === undefined) {
        return (
            <div className="flex items-center justify-center h-[40vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading summary...</p>
                </div>
            </div>
        );
    }

    if (!summery || summery.trim() === '') {
        return (
            <div className="flex items-center justify-center h-[40vh]">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-linear-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {hasConversation ? (
                            <Sparkles className="w-8 h-8 text-purple-500" />
                        ) : (
                            <FileX className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                        {hasConversation ? 'Summary not generated yet' : 'No summary available'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {hasConversation 
                            ? 'Click the "Generate Summary" button above to create a detailed summary and feedback from your conversation.'
                            : 'Complete a session with conversation to generate a summary here.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='h-[50vh] lg:h-[55vh] overflow-y-auto pr-4 custom-scrollbar'>
            {/* Wrapper div for prose styling instead of className on ReactMarkdown */}
            <div className="prose prose-sm md:prose-base max-w-none">
                <ReactMarkdown components={markdownComponents}>
                    {summery}
                </ReactMarkdown>
            </div>
        </div>
    );
}

export default SummeryBox;
