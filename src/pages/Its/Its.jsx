import React, { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Sidebar from './Sidebar';
import Content from './Content';
import Chat from './Chat';

function ITS() {
  const [selectedContent, setSelectedContent] = useState('video');
  const [selectedSection, setSelectedSection] = useState('intro-stats');
  const [expandedModules, setExpandedModules] = useState({ 'fundamentals': true, 'advanced': false });
  const [draggedNodes, setDraggedNodes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'system', content: 'Hello! I\'m your Statistics & Probability Tutor. Ready to explore the world of data analysis?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chainOfThought, setChainOfThought] = useState('Ready to assist with statistics and probability concepts...');
  const dragAreaRef = useRef(null);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSectionClick = (sectionId) => {
    setSelectedSection(sectionId);
    setChainOfThought(`Loading content for: ${sectionId} → Retrieving materials → Updating display...`);
    
    if (sectionId === 'dashboard' || sectionId === 'favorites') {
      setSelectedContent('dashboard');
    } else if (sectionId.includes('quiz') || sectionId === 'final-project') {
      setSelectedContent('quiz');
    } else {
      setSelectedContent('video');
    }
    
    setTimeout(() => {
      setChainOfThought('Content loaded successfully. Ready for questions.');
    }, 1000);
  };

  const handleDragStart = (e, nodeData) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(nodeData));
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'scale(1.1)';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOverDropZone(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOverDropZone(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setIsOverDropZone(false);
    
    try {
      const nodeData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const exists = draggedNodes.some(node => node.id === nodeData.id);
      if (!exists) {
        setDraggedNodes(prev => [...prev, { ...nodeData, id: nodeData.id + '_' + Date.now() }]);
        setChainOfThought(`Added "${nodeData.name}" to learning path → Ready for study planning...`);
        setTimeout(() => {
          setChainOfThought('Learning path updated successfully. Ready for next topic.');
        }, 2000);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const removeNode = (nodeId) => {
    setDraggedNodes(prev => prev.filter(node => node.id !== nodeId));
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
      setChainOfThought('Analyzing statistics question → Accessing knowledge base → Formulating explanation...');
      
      setTimeout(() => {
        const responses = {
          'mean': 'The mean (arithmetic average) is calculated by summing all values and dividing by the count.',
          'median': 'The median is the middle value when data is arranged in order. It\'s less affected by outliers than the mean.',
          'probability': 'Probability is the likelihood of an event occurring, expressed as a number between 0 and 1.',
          'variance': 'Variance measures how spread out the data points are from the mean.',
          'default': `Great question about "${inputMessage}"! This concept helps us understand and analyze data patterns.`
        };
        
        const responseKey = inputMessage.toLowerCase().includes('mean') ? 'mean' :
                           inputMessage.toLowerCase().includes('median') ? 'median' :
                           inputMessage.toLowerCase().includes('probability') ? 'probability' :
                           inputMessage.toLowerCase().includes('variance') ? 'variance' : 'default';
        
        setChatMessages(prev => [...prev, { 
          type: 'assistant', 
          content: responses[responseKey]
        }]);
        setChainOfThought('Response generated. Ready for next question.');
      }, 1500);
      
      setInputMessage('');
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      <PanelGroup direction="horizontal">
        {/* Left Sidebar */}
        <Panel defaultSize={22} minSize={15} maxSize={40}>
          <Sidebar
            selectedSection={selectedSection}
            expandedModules={expandedModules}
            onSectionClick={handleSectionClick}
            onToggleModule={toggleModule}
          />
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
          </div>
        </PanelResizeHandle>

        {/* Main Content */}
        <Panel defaultSize={56} minSize={30}>
          <Content
            selectedContent={selectedContent}
            selectedSection={selectedSection}
            setSelectedContent={setSelectedContent}
            draggedNodes={draggedNodes}
            isDragging={isDragging}
            isOverDropZone={isOverDropZone}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveNode={removeNode}
            dragAreaRef={dragAreaRef}
          />
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
          </div>
        </PanelResizeHandle>

        {/* Right Chat */}
        <Panel defaultSize={22} minSize={15} maxSize={40}>
          <Chat
            chatMessages={chatMessages}
            inputMessage={inputMessage}
            chainOfThought={chainOfThought}
            onSendMessage={sendMessage}
            onInputChange={setInputMessage}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default ITS;