import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Code, File } from 'lucide-react';

const FileIcon = ({ name }) => {
    const ext = name.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return <Code size={14} className="text-yellow-500" />;
        case 'css':
        case 'scss':
            return <FileText size={14} className="text-blue-500" />;
        case 'html':
            return <Code size={14} className="text-orange-500" />;
        case 'json':
            return <FileText size={14} className="text-green-500" />;
        case 'md':
            return <FileText size={14} className="text-gray-500" />;
        default:
            return <File size={14} className="text-gray-400" />;
    }
};

const TreeNode = ({ node, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand top levels
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div style={{ paddingLeft: level * 10 }}>
            {hasChildren ? (
                <div>
                    <div
                        className="flex items-center gap-1 py-1 cursor-pointer hover:bg-gray-100 rounded px-2 select-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                        <Folder size={14} className="text-blue-400 fill-blue-50" />
                        <span className="text-sm text-gray-700 font-medium">{node.name}</span>
                    </div>
                    {isOpen && (
                        <div className="border-l border-gray-200 ml-2.5 pl-1">
                            {node.children.map((child, i) => (
                                <TreeNode key={i} node={child} level={level + 1} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded">
                    <FileIcon name={node.name} />
                    <span className="text-sm text-gray-600">{node.name}</span>
                    {node.size && <span className="text-[10px] text-gray-400 ml-auto">{(node.size / 1024).toFixed(1)}kb</span>}
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
    const treeData = buildTree(files);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-full overflow-y-auto font-mono">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Project Structure</h3>
            {treeData.map((node, i) => (
                <TreeNode key={i} node={node} />
            ))}
        </div>
    );
}
