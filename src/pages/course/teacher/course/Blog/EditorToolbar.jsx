import React from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Type,
  ListOrdered,
  List,
  Image,
  Film,
  Link,
  Quote,
  Code,
  Palette,
} from "lucide-react";

const EditorToolbar = ({
  execCommand,
  selectedColor,
  setSelectedColor,
  selectedFontSize,
  setSelectedFontSize,
}) => {
  // Format text based on command
  const formatText = (command) => {
    switch (command) {
      case "bold":
        execCommand("bold");
        break;
      case "italic":
        execCommand("italic");
        break;
      case "underline":
        execCommand("underline");
        break;
      case "align-left":
        execCommand("justifyLeft");
        break;
      case "align-center":
        execCommand("justifyCenter");
        break;
      case "align-right":
        execCommand("justifyRight");
        break;
      case "align-justify":
        execCommand("justifyFull");
        break;
      case "h1":
        execCommand("formatBlock", "<h1>");
        break;
      case "h2":
        execCommand("formatBlock", "<h2>");
        break;
      case "p":
        execCommand("formatBlock", "<p>");
        break;
      case "ordered-list":
        execCommand("insertOrderedList");
        break;
      case "unordered-list":
        execCommand("insertUnorderedList");
        break;
      case "blockquote":
        execCommand("formatBlock", "<blockquote>");
        break;
      default:
        break;
    }
  };

  // Handle color change
  const handleColorChange = (e) => {
    const color = e.target.value;
    setSelectedColor(color);
    execCommand("foreColor", color);
  };

  // Handle font size change
  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    setSelectedFontSize(size);
    execCommand("fontSize", getSizeValue(size));
  };

  // Convert font size to execCommand size value (1-7)
  const getSizeValue = (px) => {
    const sizes = {
      "10px": 1,
      "13px": 2,
      "16px": 3,
      "18px": 4,
      "24px": 5,
      "32px": 6,
      "48px": 7,
    };
    return sizes[px] || 3;
  };

  // Insert code block
  const insertCodeBlock = () => {
    execCommand(
      "insertHTML",
      '<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;"><code></code></pre>'
    );
  };

  // Handle inline image upload
  const handleInlineImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        execCommand(
          "insertHTML",
          `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert video link into content
  const insertVideoLink = () => {
    const videoUrl = prompt("Enter YouTube or Vimeo video URL:");
    if (videoUrl) {
      let embedUrl = videoUrl;
      // Convert YouTube watch URL to embed URL
      if (videoUrl.includes("youtube.com/watch?v=")) {
        embedUrl = videoUrl.replace("watch?v=", "embed/");
      } else if (videoUrl.includes("youtu.be/")) {
        const videoId = videoUrl.split("/").pop();
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (
        videoUrl.includes("vimeo.com/") &&
        !videoUrl.includes("player.vimeo.com")
      ) {
        const videoId = videoUrl.split("/").pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      execCommand(
        "insertHTML",
        `
        <div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
          <iframe 
            src="${embedUrl}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      `
      );
    }
  };

  // Insert link into content
  const insertLink = () => {
    const url = prompt("Enter URL:");
    const text = prompt("Enter link text:");
    if (url && text) {
      execCommand("insertHTML", `<a href="${url}" target="_blank">${text}</a>`);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-300 border-b-0 rounded-t-md p-2 flex flex-wrap gap-1">
      {/* Text Style */}
      <button
        onClick={() => formatText("bold")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("italic")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("underline")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Text Alignment */}
      <button
        onClick={() => formatText("align-left")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("align-center")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("align-right")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("align-justify")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Headings */}
      <button
        onClick={() => formatText("h1")}
        className="p-1.5 hover:bg-gray-200 rounded flex items-center"
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("h2")}
        className="p-1.5 hover:bg-gray-200 rounded flex items-center"
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("p")}
        className="p-1.5 hover:bg-gray-200 rounded flex items-center"
        title="Paragraph"
      >
        <Type className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Lists */}
      <button
        onClick={() => formatText("ordered-list")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => formatText("unordered-list")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Unordered List"
      >
        <List className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Media */}
      <label
        className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"
        title="Insert Image"
      >
        <Image className="w-4 h-4" />
        <input
          type="file"
          accept="image/*"
          onChange={handleInlineImageUpload}
          className="hidden"
        />
      </label>
      <button
        onClick={insertVideoLink}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Insert Video"
      >
        <Film className="w-4 h-4" />
      </button>
      <button
        onClick={insertLink}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Insert Link"
      >
        <Link className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Special formatting */}
      <button
        onClick={() => formatText("blockquote")}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Quote Block"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={insertCodeBlock}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Color and font size */}
      <div className="flex items-center" title="Text Color">
        <Palette className="w-4 h-4 mr-1" />
        <input
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          className="w-6 h-6 border-none cursor-pointer"
        />
      </div>

      <select
        value={selectedFontSize}
        onChange={handleFontSizeChange}
        className="ml-1 text-sm border border-gray-300 rounded"
        title="Font Size"
      >
        <option value="10px">Small</option>
        <option value="13px">Normal</option>
        <option value="16px">Medium</option>
        <option value="18px">Large</option>
        <option value="24px">X-Large</option>
        <option value="32px">XX-Large</option>
        <option value="48px">Huge</option>
      </select>
    </div>
  );
};

export default EditorToolbar;
