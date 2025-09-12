import React from 'react';
import { Brain, MessageCircle, Send } from 'lucide-react';

function Chat({ chatMessages, inputMessage, chainOfThought, onSendMessage, onInputChange }) {
  return (
    <div className="h-full bg-white border-l border-gray-300 flex flex-col">
      {/* Chain of Thought */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 p-4">
        <h3 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Processing
        </h3>
        <p className="text-xs text-purple-700 bg-white bg-opacity-70 p-2 rounded border-l-2 border-purple-300">
          {chainOfThought}
        </p>
      </div>

      {/* Chat Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Stats Tutor
        </h3>
        <p className="text-sm text-gray-600">Ask about statistics & probability</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-full ${
              message.type === 'user'
                ? 'bg-blue-600 text-white ml-4'
                : message.type === 'system'
                ? 'bg-green-100 text-green-800 mr-4 border border-green-200'
                : 'bg-gray-100 text-gray-800 mr-4'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
      </div>

      {/* Quick Questions */}
      <div className="border-t border-gray-100 p-3">
        <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-1">
          <button 
            onClick={() => onInputChange('What is mean?')}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            Mean?
          </button>
          <button 
            onClick={() => onInputChange('Explain probability')}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            Probability?
          </button>
          <button 
            onClick={() => onInputChange('What is variance?')}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            Variance?
          </button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask about statistics..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={onSendMessage}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;