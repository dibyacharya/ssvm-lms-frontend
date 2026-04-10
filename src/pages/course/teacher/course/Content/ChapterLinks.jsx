import React, { useState } from 'react';
import { Plus, X, ExternalLink, FileText, Video, Link as LinkIcon } from 'lucide-react';

// Helper function to detect file type from URL
const getFileTypeFromUrl = (url) => {
  if (!url) return 'unknown';
  
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('youtube.com') || 
      lowercaseUrl.includes('youtu.be') || 
      lowercaseUrl.includes('vimeo.com') ||
      lowercaseUrl.match(/\.(mp4|avi|mov|wmv|flv|webm)(\?|$)/)) {
    return 'video';
  }
  
  if (lowercaseUrl.match(/\.(pdf)(\?|$)/)) {
    return 'pdf';
  }
  
  return 'link';
};

// Component to display individual link with ONLY icon and tooltip
const LinkItem = ({ link, onRemove, index }) => {
  const fileType = getFileTypeFromUrl(link);
  
  const getIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="text-red-600" />;
      case 'video':
        return <Video className=" text-blue-600" />;
      default:
        return <LinkIcon className=" text-gray-600" />;
    }
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const getFileTypeName = () => {
    switch (fileType) {
      case 'pdf': return 'PDF Document';
      case 'video': return 'Video';
      default: return 'Link';
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg p-2   h-10">
      
        <button
          onClick={handleLinkClick}
          className=" hover:bg-gray-200 rounded transition-colors"
         title={`${getFileTypeName()}: ${link}`}
        >
          {getIcon()}
        </button>
     
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove link"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Modal for adding/editing links
const AddLinksModal = ({ isOpen, onClose, links, onSave, chapterTitle }) => {
  const [localLinks, setLocalLinks] = useState(links || []);
  const [inputText, setInputText] = useState('');

  const addLinks = () => {
    if (!inputText.trim()) return;
    
    // Split by newlines or commas and process each link
    const linksToAdd = inputText
      .split(/[\n,]/)
      .map(link => link.trim())
      .filter(link => link.length > 0);

    const validLinks = [];
    const invalidLinks = [];

    linksToAdd.forEach(link => {
      try {
        new URL(link);
        validLinks.push(link);
      } catch {
        invalidLinks.push(link);
      }
    });

    if (invalidLinks.length > 0) {
      alert(`Invalid URLs found: ${invalidLinks.join(', ')}\n\nOnly valid URLs will be added.`);
    }

    if (validLinks.length > 0) {
      setLocalLinks([...localLinks, ...validLinks]);
      setInputText('');
    }
  };

  const removeLink = (index) => {
    setLocalLinks(localLinks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localLinks);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addLinks();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Manage Links for "{chapterTitle}"
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Links
          </label>
          <div className="space-y-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="4"
              placeholder="https://example.com/resource.pdf
https://youtube.com/watch?v=example
https://example.com/document

Enter multiple URLs (one per line or separated by commas)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
            <button
              onClick={addLinks}
              className="w-full px-4 py-2 bg-blue-600 text-gray-900 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Links</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Supports PDFs, videos (YouTube, Vimeo), and general links. Press Ctrl+Enter to add multiple links at once.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Current Links ({localLinks.length})
          </h3>
          {localLinks.length > 0 ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {localLinks.map((link, index) => (
                <LinkItem
                  key={`${link}-${index}`}
                  link={link}
                  onRemove={removeLink}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <LinkIcon className="w-12 h-12 mx-auto text-gray-600 mb-2" />
              <p>No links added yet</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-gray-900 rounded-md hover:bg-blue-700"
          >
            Save Links
          </button>
        </div>
      </div>
    </div>
  );
};

export { LinkItem, AddLinksModal, getFileTypeFromUrl };