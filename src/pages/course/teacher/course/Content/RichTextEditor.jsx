import React, { useState, useRef, useEffect } from 'react';
import {
  Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  ChevronRight, Code, Quote, AlertCircle, Columns2, Columns3,
  Image, Video, Link, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, MoreHorizontal, Trash2,
  Copy, Move, MessageSquare, Palette, Plus, Search, Hash, FileText
} from 'lucide-react';

// Block Types Configuration
const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING1: 'heading1',
  HEADING2: 'heading2', 
  HEADING3: 'heading3',
  BULLETED_LIST: 'bulleted_list',
  NUMBERED_LIST: 'numbered_list',
  TODO_LIST: 'todo_list',
  TOGGLE_LIST: 'toggle_list',
  CODE: 'code',
  QUOTE: 'quote',
  CALLOUT: 'callout',
  IMAGE: 'image',
  VIDEO: 'video',
  DIVIDER: 'divider',
  COLUMNS: 'columns'
};

// Block Type Configurations
const blockConfigs = {
  [BLOCK_TYPES.TEXT]: {
    icon: Type,
    label: 'Text',
    placeholder: 'Type something...',
    shortcut: 'Just start typing'
  },
  [BLOCK_TYPES.HEADING1]: {
    icon: Heading1,
    label: 'Heading 1',
    placeholder: 'Heading 1',
    shortcut: '# + space'
  },
  [BLOCK_TYPES.HEADING2]: {
    icon: Heading2,
    label: 'Heading 2',
    placeholder: 'Heading 2',
    shortcut: '## + space'
  },
  [BLOCK_TYPES.HEADING3]: {
    icon: Heading3,
    label: 'Heading 3',
    placeholder: 'Heading 3',
    shortcut: '### + space'
  },
  [BLOCK_TYPES.BULLETED_LIST]: {
    icon: List,
    label: 'Bulleted list',
    placeholder: 'List item',
    shortcut: '- + space'
  },
  [BLOCK_TYPES.NUMBERED_LIST]: {
    icon: ListOrdered,
    label: 'Numbered list',
    placeholder: 'List item',
    shortcut: '1. + space'
  },
  [BLOCK_TYPES.TODO_LIST]: {
    icon: CheckSquare,
    label: 'To-do list',
    placeholder: 'To-do',
    shortcut: '[] + space'
  },
  [BLOCK_TYPES.CODE]: {
    icon: Code,
    label: 'Code',
    placeholder: 'Type your code...',
    shortcut: '``` + space'
  },
  [BLOCK_TYPES.QUOTE]: {
    icon: Quote,
    label: 'Quote',
    placeholder: 'Quote',
    shortcut: '> + space'
  },
  [BLOCK_TYPES.CALLOUT]: {
    icon: AlertCircle,
    label: 'Callout',
    placeholder: 'Callout',
    shortcut: ''
  }
};

// Main Rich Text Editor Component
function RichTextEditor({ 
  initialContent = '', 
  onChange = () => {}, 
  placeholder = 'Start writing...',
  className = '' 
}) {
  const [blocks, setBlocks] = useState([
    { id: '1', type: BLOCK_TYPES.TEXT, content: initialContent, style: {} }
  ]);
  const [activeBlockId, setActiveBlockId] = useState('1');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [formatBarPosition, setFormatBarPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const editorRef = useRef(null);

  // Handle block content change
  const handleBlockChange = (blockId, content) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
    onChange(blocks);
  };

  // Handle block type change
  const handleBlockTypeChange = (blockId, newType) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, type: newType } : block
    ));
    setShowSlashMenu(false);
  };

  // Add new block
  const addBlock = (afterBlockId, type = BLOCK_TYPES.TEXT) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      style: {}
    };

    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === afterBlockId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });

    setActiveBlockId(newBlock.id);
    return newBlock.id;
  };

  // Delete block
  const deleteBlock = (blockId) => {
    if (blocks.length === 1) return;
    
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    setShowContextMenu(false);
  };

  // Duplicate block
  const duplicateBlock = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newBlock = {
      ...block,
      id: Date.now().toString()
    };

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });

    setShowContextMenu(false);
  };

  // Handle slash command
  const handleSlashCommand = (e, blockId) => {
    if (e.key === '/') {
      const rect = e.target.getBoundingClientRect();
      setSlashMenuPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
      setShowSlashMenu(true);
      setActiveBlockId(blockId);
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = addBlock(blockId);
      // Focus new block
      setTimeout(() => {
        const newBlockElement = document.querySelector(`[data-block-id="${newBlockId}"]`);
        if (newBlockElement) {
          newBlockElement.focus();
        }
      }, 0);
    }
  };

  // Handle text selection for formatting
  const handleTextSelection = (e) => {
    const selection = window.getSelection();
    const text = selection.toString();

    if (text.length > 0) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setFormatBarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowFormatBar(true);
    } else {
      setShowFormatBar(false);
    }
  };

  // Handle right click context menu
  const handleContextMenu = (e, blockId) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setActiveBlockId(blockId);
    setShowContextMenu(true);
  };

  // Apply text formatting
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    setShowFormatBar(false);
  };

  // Insert media
  const insertMedia = (type) => {
    const url = prompt(`Enter ${type} URL:`);
    if (url) {
      const newBlock = {
        id: Date.now().toString(),
        type: type === 'image' ? BLOCK_TYPES.IMAGE : BLOCK_TYPES.VIDEO,
        content: url,
        style: {}
      };

      setBlocks(prev => [...prev, newBlock]);
    }
    setShowSlashMenu(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.slash-menu')) {
        setShowSlashMenu(false);
      }
      if (!e.target.closest('.context-menu')) {
        setShowContextMenu(false);
      }
      if (!e.target.closest('.format-bar')) {
        setShowFormatBar(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`rich-text-editor relative ${className}`} ref={editorRef}>
      {/* Editor Content */}
      <div className="editor-content space-y-2 p-4">
        {blocks.map((block, index) => (
          <BlockRenderer
            key={block.id}
            block={block}
            isActive={activeBlockId === block.id}
            onChange={(content) => handleBlockChange(block.id, content)}
            onKeyDown={(e) => handleSlashCommand(e, block.id)}
            onSelect={handleTextSelection}
            onContextMenu={(e) => handleContextMenu(e, block.id)}
            placeholder={blockConfigs[block.type]?.placeholder || 'Type something...'}
          />
        ))}

        {/* Add Block Button */}
        <div className="flex items-center space-x-2 py-2 text-gray-400 hover:text-gray-600">
          <button
            onClick={() => addBlock(blocks[blocks.length - 1]?.id)}
            className="flex items-center space-x-2 hover:bg-gray-100 rounded p-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Click to add a block</span>
          </button>
        </div>
      </div>

      {/* Slash Menu */}
      {showSlashMenu && (
        <SlashMenu
          position={slashMenuPosition}
          searchQuery={searchQuery}
          onSelect={(type) => handleBlockTypeChange(activeBlockId, type)}
          onClose={() => setShowSlashMenu(false)}
          onSearch={setSearchQuery}
          onInsertMedia={insertMedia}
        />
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <ContextMenu
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
          onDelete={() => deleteBlock(activeBlockId)}
          onDuplicate={() => duplicateBlock(activeBlockId)}
          blockId={activeBlockId}
        />
      )}

      {/* Format Bar */}
      {showFormatBar && (
        <FormatBar
          position={formatBarPosition}
          onFormat={applyFormat}
          onClose={() => setShowFormatBar(false)}
        />
      )}
    </div>
  );
}

// Block Renderer Component
function BlockRenderer({ 
  block, 
  isActive, 
  onChange, 
  onKeyDown, 
  onSelect, 
  onContextMenu, 
  placeholder 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getBlockElement = () => {
    const commonProps = {
      'data-block-id': block.id,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e) => onChange(e.target.innerHTML),
      onKeyDown,
      onMouseUp: onSelect,
      onContextMenu,
      className: `block-content focus:outline-none ${isActive ? 'ring-2 ring-blue-200' : ''}`,
      dangerouslySetInnerHTML: { __html: block.content },
      placeholder
    };

    switch (block.type) {
      case BLOCK_TYPES.HEADING1:
        return <h1 {...commonProps} className={`${commonProps.className} text-3xl font-bold py-2`} />;
      
      case BLOCK_TYPES.HEADING2:
        return <h2 {...commonProps} className={`${commonProps.className} text-2xl font-bold py-2`} />;
      
      case BLOCK_TYPES.HEADING3:
        return <h3 {...commonProps} className={`${commonProps.className} text-xl font-bold py-2`} />;
      
      case BLOCK_TYPES.CODE:
        return (
          <pre className="bg-gray-100 rounded p-4 font-mono text-sm overflow-x-auto">
            <code {...commonProps} className={`${commonProps.className} bg-transparent`} />
          </pre>
        );
      
      case BLOCK_TYPES.QUOTE:
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
            <div {...commonProps} className={`${commonProps.className} italic`} />
          </blockquote>
        );
      
      case BLOCK_TYPES.CALLOUT:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div {...commonProps} className={`${commonProps.className} flex-1`} />
          </div>
        );
      
      case BLOCK_TYPES.BULLETED_LIST:
        return (
          <ul className="list-disc list-inside">
            <li>
              <span {...commonProps} className={`${commonProps.className} inline`} />
            </li>
          </ul>
        );
      
      case BLOCK_TYPES.NUMBERED_LIST:
        return (
          <ol className="list-decimal list-inside">
            <li>
              <span {...commonProps} className={`${commonProps.className} inline`} />
            </li>
          </ol>
        );
      
      case BLOCK_TYPES.TODO_LIST:
        return (
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
            <div {...commonProps} className={`${commonProps.className} flex-1`} />
          </div>
        );
      
      case BLOCK_TYPES.IMAGE:
        return (
          <div className="py-2">
            <img 
              src={block.content || '/api/placeholder/400/200'} 
              alt="Content" 
              className="max-w-full h-auto rounded border"
            />
          </div>
        );
      
      case BLOCK_TYPES.VIDEO:
        return (
          <div className="py-2">
            <video 
              src={block.content} 
              controls 
              className="max-w-full h-auto rounded border"
            />
          </div>
        );
      
      default:
        return <div {...commonProps} className={`${commonProps.className} py-2 min-h-[1.5rem]`} />;
    }
  };

  return (
    <div 
      className={`block-wrapper relative group ${isHovered ? 'bg-gray-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block Handle */}
      {isHovered && (
        <div className="absolute left-0 top-0 flex items-center space-x-1 -ml-8">
          <button className="block-handle w-4 h-4 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button className="add-block w-4 h-4 text-gray-400 hover:text-gray-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {getBlockElement()}
    </div>
  );
}

// Slash Menu Component
function SlashMenu({ position, searchQuery, onSelect, onClose, onSearch, onInsertMedia }) {
  const [filteredItems, setFilteredItems] = useState([]);

  const menuItems = [
    ...Object.entries(blockConfigs).map(([type, config]) => ({
      type,
      icon: config.icon,
      label: config.label,
      shortcut: config.shortcut,
      action: () => onSelect(type)
    })),
    {
      type: 'image',
      icon: Image,
      label: 'Image',
      shortcut: '',
      action: () => onInsertMedia('image')
    },
    {
      type: 'video',
      icon: Video,
      label: 'Video',
      shortcut: '',
      action: () => onInsertMedia('video')
    },
    {
      type: 'divider',
      icon: Hash,
      label: 'Divider',
      shortcut: '---',
      action: () => onSelect('divider')
    }
  ];

  useEffect(() => {
    const filtered = menuItems.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery]);

  return (
    <div 
      className="slash-menu absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-72"
      style={{ left: position.x, top: position.y }}
    >
      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a block type..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-h-64 overflow-y-auto">
        {filteredItems.map((item, index) => (
          <button
            key={item.type}
            onClick={item.action}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 transition-colors"
          >
            <item.icon className="w-4 h-4 text-gray-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              {item.shortcut && (
                <div className="text-xs text-gray-500">{item.shortcut}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Context Menu Component
function ContextMenu({ position, onClose, onDelete, onDuplicate, blockId }) {
  const menuItems = [
    {
      icon: FileText,
      label: 'Turn into',
      shortcut: '',
      action: () => {},
      hasSubmenu: true
    },
    {
      icon: Palette,
      label: 'Color',
      shortcut: '',
      action: () => {},
      hasSubmenu: true
    },
    {
      icon: Link,
      label: 'Copy link to block',
      shortcut: '⌘⇧L',
      action: () => {
        navigator.clipboard.writeText(`#block-${blockId}`);
        onClose();
      }
    },
    {
      icon: Copy,
      label: 'Duplicate',
      shortcut: '⌘D',
      action: onDuplicate
    },
    {
      icon: Move,
      label: 'Move to',
      shortcut: '⌘⇧P',
      action: () => {},
      hasSubmenu: true
    },
    {
      icon: Trash2,
      label: 'Delete',
      shortcut: 'Del',
      action: onDelete,
      className: 'text-red-600 hover:bg-red-50'
    },
    {
      icon: MessageSquare,
      label: 'Comment',
      shortcut: '⌘⇧M',
      action: () => {}
    }
  ];

  return (
    <div 
      className="context-menu absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-56"
      style={{ left: position.x, top: position.y }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between transition-colors ${item.className || ''}`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.shortcut && (
              <span className="text-xs text-gray-500">{item.shortcut}</span>
            )}
            {item.hasSubmenu && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// Format Bar Component
function FormatBar({ position, onFormat, onClose }) {
  const formatButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough' },
    { icon: Link, command: 'createLink', title: 'Link', needsValue: true },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' }
  ];

  const handleFormatClick = (button) => {
    if (button.needsValue) {
      const value = prompt(`Enter ${button.title.toLowerCase()}:`);
      if (value) {
        onFormat(button.command, value);
      }
    } else {
      onFormat(button.command);
    }
  };

  return (
    <div 
      className="format-bar absolute z-50 bg-gray-800 rounded-lg shadow-lg p-1 flex items-center space-x-1"
      style={{ 
        left: position.x - 150, 
        top: position.y - 50,
        transform: 'translateX(-50%)'
      }}
    >
      {formatButtons.map((button, index) => (
        <button
          key={index}
          onClick={() => handleFormatClick(button)}
          className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
          title={button.title}
        >
          <button.icon className="w-4 h-4" />
        </button>
      ))}
      
      <div className="w-px h-6 bg-gray-600 mx-1" />
      
      <button
        onClick={onClose}
        className="p-1 text-white hover:bg-gray-700 rounded text-xs transition-colors"
        title="Close"
      >
        ×
      </button>
    </div>
  );
}

export default RichTextEditor;