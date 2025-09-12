import React from 'react';
import { Search, ChevronRight, ChevronDown, BarChart3, Calculator, Target, TrendingUp, Database, Smartphone, ArrowLeft } from 'lucide-react';

function Sidebar({ selectedSection, expandedModules, onSectionClick, onToggleModule }) {
  return (
    <div className="h-full bg-white border-r border-gray-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          StatLearn
        </h1>
        <p className="text-sm text-gray-600 mt-1">Statistics & Probability</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Back Button */}
        <div className="mb-4">
          <button 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Workspace */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Workspace</h2>
          <div className="space-y-2">
            <div 
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedSection === 'dashboard' ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSectionClick('dashboard')}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Dashboard</span>
            </div>
            <div 
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedSection === 'favorites' ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSectionClick('favorites')}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Favorites</span>
            </div>
          </div>
        </div>

        {/* Fundamentals */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => onToggleModule('fundamentals')}
          >
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fundamentals</h2>
            {expandedModules.fundamentals ? 
              <ChevronDown className="h-4 w-4 text-gray-400" /> : 
              <ChevronRight className="h-4 w-4 text-gray-400" />
            }
          </div>
          {expandedModules.fundamentals && (
            <div className="space-y-1">
              <div 
                className={`text-sm p-2 rounded cursor-pointer transition-colors flex items-center gap-2 ${
                  selectedSection === 'intro-stats' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSectionClick('intro-stats')}
              >
                <BarChart3 className="h-4 w-4" />
                Introduction to Statistics
              </div>
              <div 
                className={`text-sm p-2 rounded cursor-pointer transition-colors flex items-center gap-2 ${
                  selectedSection === 'descriptive-stats' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSectionClick('descriptive-stats')}
              >
                <Calculator className="h-4 w-4" />
                Descriptive Statistics
              </div>
              <div 
                className={`text-sm p-2 rounded cursor-pointer transition-colors flex items-center gap-2 ${
                  selectedSection === 'probability-basics' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSectionClick('probability-basics')}
              >
                <Target className="h-4 w-4" />
                Probability Fundamentals
              </div>
              <div 
                className={`text-sm p-2 rounded cursor-pointer transition-colors flex items-center gap-2 ${
                  selectedSection === 'distributions' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSectionClick('distributions')}
              >
                <TrendingUp className="h-4 w-4" />
                Probability Distributions
              </div>
            </div>
          )}
        </div>

        {/* Advanced Topics */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => onToggleModule('advanced')}
          >
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Advanced Topics</h2>
            {expandedModules.advanced ? 
              <ChevronDown className="h-4 w-4 text-gray-400" /> : 
              <ChevronRight className="h-4 w-4 text-gray-400" />
            }
          </div>
          {expandedModules.advanced && (
            <div className="space-y-1">
              <div 
                className={`text-sm p-2 rounded cursor-pointer transition-colors flex items-center gap-2 ${
                  selectedSection === 'sampling' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSectionClick('sampling')}
              >
                <Database className="h-4 w-4" />
                Sampling Theory
              </div>
              <div 
                className={`text-sm p-2 rounded cursor-pointer transition-colors flex items-center gap-2 ${
                  selectedSection === 'hypothesis-testing' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSectionClick('hypothesis-testing')}
              >
                <Target className="h-4 w-4" />
                Hypothesis Testing
              </div>
            </div>
          )}
        </div>

        {/* Assessment */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Assessment</h2>
          <div className="space-y-1">
            <div 
              className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                selectedSection === 'quiz-basics' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => onSectionClick('quiz-basics')}
            >
              Statistics Basics Quiz
            </div>
            <div 
              className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                selectedSection === 'advanced-quiz' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => onSectionClick('advanced-quiz')}
            >
              Advanced Statistics Quiz
            </div>
            <div 
              className={`text-sm p-2 bg-purple-50 rounded cursor-pointer font-medium transition-colors ${
                selectedSection === 'final-project' ? 'bg-purple-100 text-purple-800' : 'text-purple-700 hover:bg-purple-100'
              }`}
              onClick={() => onSectionClick('final-project')}
            >
              Final Project
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;