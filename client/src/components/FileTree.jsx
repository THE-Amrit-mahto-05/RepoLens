import React, { useState, useMemo } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    FileText,
    Code,
    File,
    Search,
    Star,
    Activity
} from 'lucide-react';

const FileIcon = ({ name }) => {
    const ext = name.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
            return <Code size={13} className="text-yellow-500" />;
        case 'ts':
        case 'tsx':
            return <Code size={13} className="text-blue-500" />;
        case 'css':
        case 'scss':
            return <FileText size={13} className="text-pink-400" />;
        case 'html':
            return <Code size={13} className="text-orange-500" />;
        case 'json':
            return <FileText size={13} className="text-green-500" />;
        case 'md':
            return <FileText size={13} className="text-gray-400" />;
        case 'py':
            return <Code size={13} className="text-sky-400" />;
        case 'java':
            return <Code size={13} className="text-red-400" />;
        case 'go':
            return <Code size={13} className="text-cyan-500" />;
        default:
            return <File size={13} className="text-gray-300" />;
    }
};

const TreeNode = ({ node, level = 0, filter = '' }) => {
    const [isOpen, setIsOpen] = useState(level < 1 || (filter && true));
    const hasChildren = node.children && node.children.length > 0;

    const matchesFilter = !filter || node.name.toLowerCase().includes(filter.toLowerCase());
    const hasMatchingDescendant = (n) => {
        if (!filter) return true;
        if (n.name.toLowerCase().includes(filter.toLowerCase())) return true;
        return (n.children || []).some(hasMatchingDescendant);
    };

    if (filter && !hasMatchingDescendant(node)) return null;

    const relevanceColor = node.relevanceScore > 100 ? 'bg-blue-500' :
        node.relevanceScore > 50 ? 'bg-blue-300' :
            'bg-gray-200';

    return (
        <div style={{ paddingLeft: level * 10 }}>
            {hasChildren ? (
                <div>
                    <div
                        className="flex items-center gap-1.5 py-1 cursor-pointer hover:bg-gray-50 rounded px-1.5 select-none group transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="w-4 flex justify-center">
                            {isOpen
                                ? <ChevronDown size={11} className="text-gray-400" />
                                : <ChevronRight size={11} className="text-gray-400" />}
                        </div>
                        {isOpen
                            ? <FolderOpen size={13} className="text-blue-400 fill-blue-50" />
                            : <Folder size={13} className="text-blue-400 fill-blue-50" />}
                        <span className={`text-[13px] font-medium leading-none ${matchesFilter && filter ? 'text-blue-600' : 'text-gray-700'}`}>
                            {node.name}
                        </span>
                        <span className="ml-auto text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                            {node.children.length}
                        </span>
                    </div>
                    {isOpen && (
                        <div className="border-l border-gray-100 ml-3.5 mt-0.5">
                            {node.children.map((child, i) => (
                                <TreeNode key={i} node={child} level={level + 1} filter={filter} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-default group transition-colors ${matchesFilter && filter ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <div className="w-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {node.relevanceScore > 70 && <Star size={10} className="text-blue-500 fill-blue-500" />}
                    </div>
                    <FileIcon name={node.name} />
                    <span className={`text-[13px] truncate flex-1 leading-none ${matchesFilter && filter ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {node.name}
                    </span>
                    {node.relevanceScore > 0 && (
                        <div className={`w-1 h-3 rounded-full ${relevanceColor} opacity-40 group-hover:opacity-100 transition-all`} title={`Relevance: ${node.relevanceScore}`} />
                    )}
                </div>
            )}
        </div>
    );
};

const buildTree = (paths) => {
    const root = { name: 'root', children: [] };
    paths.forEach(file => {
        const parts = file.path.split('/');
        let current = root;
        parts.forEach((part, i) => {
            let existing = current.children.find(c => c.name === part);
            if (!existing) {
                existing = { name: part, children: [], ...((i === parts.length - 1) ? file : {}) };
                current.children.push(existing);
            }
            current = existing;
        });
    });
    return root.children;
};

export default function FileTree({ files }) {
    const [filter, setFilter] = useState('');
    const treeData = useMemo(() => buildTree(files), [files]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-white rounded border border-gray-100">
                            <Activity size={12} className="text-blue-500" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            Explorer
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full border border-gray-200">
                        {files.length}
                    </span>
                </div>
                {/* Search */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                    <Search size={12} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="text-xs outline-none bg-transparent w-full text-gray-700 placeholder-gray-400"
                    />
                    {filter && (
                        <button
                            onClick={() => setFilter('')}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>
            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {treeData.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center mt-12 italic">No files found.</p>
                ) : (
                    treeData.map((node, i) => (
                        <TreeNode key={i} node={node} filter={filter} />
                    ))
                )}
            </div>

            {/* Footer Tip */}
            {!filter && (
                <div className="p-2 border-t border-gray-50 bg-gray-50/30 text-[10px] text-gray-400 text-center">
                    Use tabs to switch visualizations
                </div>
            )}
        </div>
    );
}

const X = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
