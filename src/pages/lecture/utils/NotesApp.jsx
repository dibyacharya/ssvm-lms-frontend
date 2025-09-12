import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Plus, Trash2, Search, Edit3, FileText } from "lucide-react";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

const CompactNotesApp = () => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      return JSON.parse(savedNotes);
    } else {
      return [
        {
          id: generateId(),
          title: "Welcome Note",
          content:
            "# Welcome to Your Note App\n\nThis is your first note. You can:\n- Edit this note\n- Create new notes\n- Format with markdown\n- Switch between notes",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState(() => {
    return notes[0]?.id || "";
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0];

  const handleAddNote = () => {
    const newNote = {
      id: generateId(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);

    if (activeNoteId === noteId) {
      setActiveNoteId(updatedNotes[0]?.id || "");
    }
  };

  const handleUpdateNote = (field, value) => {
    setNotes(
      notes.map((note) =>
        note.id === activeNoteId
          ? {
              ...note,
              [field]: value,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-64 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Compact Sidebar */}
      <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                Notes ({notes.length})
              </h2>
            </div>
            <button
              onClick={handleAddNote}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="New Note"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <div className="flex items-center relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search size={12} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1.5 pl-7 pr-3 text-xs rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                note.id === activeNoteId
                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow min-w-0">
                  <h3 className="font-medium text-xs text-gray-800 dark:text-gray-200 truncate">
                    {note.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatDate(note.updatedAt)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate leading-tight">
                    {note.content.replace(/[#*`[\]]/g, "").slice(0, 40)}
                    {note.content.length > 40 ? "..." : ""}
                  </p>
                </div>
                {note.id === activeNoteId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 opacity-70 hover:opacity-100"
                    title="Delete Note"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {activeNote ? (
        <div className="flex-grow flex flex-col bg-white dark:bg-gray-800">
          {/* Note Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote("title", e.target.value)}
                className="flex-grow text-sm font-semibold mr-2 p-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent text-gray-900 dark:text-white"
                placeholder="Note Title"
              />
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-1.5 rounded ${
                  isEditing 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={isEditing ? "Preview" : "Edit"}
              >
                <Edit3 size={14} />
              </button>
            </div>
          </div>

          {/* Note Content */}
          <div className="flex-grow overflow-hidden">
            <div className="h-full p-3">
              <MDEditor
                value={activeNote.content}
                onChange={(value) => handleUpdateNote("content", value || "")}
                height={120}
                preview={isEditing ? "edit" : "preview"}
                hideToolbar={true}
                visibleDragBar={false}
                textareaProps={{
                  placeholder: 'Start taking notes linked to video timestamps\n\nClick anywhere to begin...',
                  style: {
                    fontSize: 12,
                    lineHeight: '1.4'
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <FileText size={32} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-2">No notes available</h2>
            <button
              onClick={handleAddNote}
              className="px-3 py-1.5 text-xs bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none"
            >
              Create your first note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactNotesApp;