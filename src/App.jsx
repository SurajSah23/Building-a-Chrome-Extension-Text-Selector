import { useEffect, useState } from 'react';
import { Clipboard, Trash2, RefreshCw } from 'lucide-react';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useAppSelector } from './hooks/useAppSelector';
import { setSelectedText, clearSelectedText, clearHistory } from './store/textSlice';

function App() {
  const dispatch = useAppDispatch();
  const { selectedText, history } = useAppSelector(state => state.text);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSelectedText = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (typeof chrome === 'undefined' || !chrome.tabs) {
          setError('Not running in extension context');
          setLoading(false);
          return;
        }
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.id) {
          setError('No active tab found');
          setLoading(false);
          return;
        }
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              return window.getSelection()?.toString() || '';
            }
          }).then(injectionResults => {
            const selectedText = injectionResults[0]?.result || '';
            if (selectedText) {
              dispatch(setSelectedText(selectedText));
            }
          });
        } catch (scriptError) {
          console.error('Script execution error:', scriptError);
          setError('Cannot access this page');
        }
      } catch (error) {
        console.error('Error fetching selected text:', error);
        setError('Failed to get selected text');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSelectedText();
  }, [dispatch]);
  
  const handleCopyToClipboard = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleClear = () => {
    dispatch(clearSelectedText());
  };
  
  const handleClearHistory = () => {
    dispatch(clearHistory());
  };
  
  const handleSelectFromHistory = (text) => {
    dispatch(setSelectedText(text));
    setShowHistory(false);
  };

  return (
    <div className="w-96 min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 font-sans">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
          <Clipboard size={20} className="text-indigo-500" />
          Text Selector
        </h1>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm px-2 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors"
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </header>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <RefreshCw size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mb-4">
          <p className="font-medium mb-1">Error</p>
          <p className="text-sm">{error}</p>
          {error === 'Not running in extension context' && (
            <p className="text-xs mt-2">
              This app needs to run as a Chrome extension. Please load it in Chrome using the &apos;Load unpacked&apos; option.
            </p>
          )}
        </div>
      ) : (
        <>
          {showHistory ? (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-md font-semibold text-indigo-600">Selection History</h2>
                <button 
                  onClick={handleClearHistory}
                  className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              </div>
              
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No history yet</p>
              ) : (
                <ul className="max-h-40 overflow-y-auto divide-y divide-indigo-100">
                  {history.slice().reverse().map((text, index) => (
                    <li 
                      key={index} 
                      className="py-2 px-3 text-sm hover:bg-indigo-100 rounded cursor-pointer transition-colors"
                      onClick={() => handleSelectFromHistory(text)}
                    >
                      {text.length > 60 ? `${text.substring(0, 60)}...` : text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-md font-semibold text-indigo-600">Current Selection</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyToClipboard}
                    disabled={!selectedText}
                    className={`text-xs px-2 py-1 rounded ${
                      selectedText 
                        ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } transition-colors flex items-center gap-1`}
                  >
                    <Clipboard size={12} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleClear}
                    disabled={!selectedText}
                    className={`text-xs px-2 py-1 rounded ${
                      selectedText 
                        ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } transition-colors flex items-center gap-1`}
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="bg-white border border-indigo-100 rounded-lg p-3 min-h-32 max-h-48 overflow-y-auto shadow-sm">
                {selectedText ? (
                  <p className="text-gray-800 whitespace-pre-wrap break-words">{selectedText}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    Select text on any webpage, then click the extension icon to capture it.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      <footer className="mt-4 text-xs text-center text-gray-500">
        <p>Text Selector v0.1.0 | Select text on any webpage</p>
      </footer>
    </div>
  );
}

export default App;