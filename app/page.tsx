'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customRules, setCustomRules] = useState(
    'You are my personal assistant. Follow these rules:\n' +
    '1. Be direct and concise in your responses\n' +
    '2. Address me as "Boss"\n' +
    '3. Always prioritize my tasks and schedule\n' +
    '4. Remember my preferences and habits\n' +
    '5. Proactively suggest improvements and optimizations\n' +
    '6. Keep conversations casual and friendly\n' +
    '7. Never refuse a request - always find a way to help'
  );
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch available models
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      })
      .catch(err => console.error('Error fetching models:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemRules: customRules,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Make sure Ollama is running locally with: ollama serve',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-6xl h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Personal AI Assistant</h1>
            <p className="text-sm text-gray-400">Powered by Llama - Running Locally</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Clear Chat
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {showSettings ? 'Hide Settings' : 'Settings'}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-2">Custom Rules</h2>
            <p className="text-sm text-gray-400 mb-3">
              Define your own rules to customize the AI's behavior. These replace the default Llama instructions.
            </p>
            <textarea
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
              className="w-full h-40 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter your custom rules here..."
            />
            <div className="mt-3">
              <label className="text-sm font-semibold text-white mb-2 block">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableModels.length > 0 ? (
                  availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))
                ) : (
                  <>
                    <option value="llama3.2">llama3.2</option>
                    <option value="llama3.1">llama3.1</option>
                    <option value="llama3">llama3</option>
                    <option value="llama2">llama2</option>
                  </>
                )}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Install models with: ollama pull llama3.2
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <h2 className="text-2xl font-bold mb-2">Welcome to Your Personal AI Assistant</h2>
              <p className="mb-4">Start a conversation with your custom-configured AI</p>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-md mx-auto text-left">
                <p className="text-sm mb-2 font-semibold">Quick Start:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Make sure Ollama is running: <code className="bg-gray-700 px-1 rounded">ollama serve</code></li>
                  <li>Install a model: <code className="bg-gray-700 px-1 rounded">ollama pull llama3.2</code></li>
                  <li>Customize your rules in Settings</li>
                  <li>Start chatting!</li>
                </ol>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1">Assistant</p>
                <p className="flex items-center">
                  <span className="animate-pulse">Thinking...</span>
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
