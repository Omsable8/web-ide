'use client';

import React, { useState } from 'react';
import { X, BookOpen, Code, Zap, Keyboard, Settings } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: "Editor - Line Operations",
    items: [
      { keys: ["Alt", "Shift", "↓"], description: "Copy line down" },
      { keys: ["Alt", "Shift", "↑"], description: "Copy line up" },
      { keys: ["Alt", "↓"], description: "Move line down" },
      { keys: ["Alt", "↑"], description: "Move line up" },
      { keys: ["Ctrl", "Shift", "K"], description: "Delete line" },
    ],
  },
  {
    category: "Editor - Selection",
    items: [
      { keys: ["Ctrl", "Shift", "←"], description: "Select word left" },
      { keys: ["Ctrl", "Shift", "→"], description: "Select word right" },
      { keys: ["Shift", "←"], description: "Select left" },
      { keys: ["Ctrl", "Alt", "↓"], description: "Add cursor below" },
    ],
  },
  {
    category: "Editor - Text Manipulation",
    items: [
      { keys: ["Ctrl", "F"], description: "Find" },
      { keys: ["Ctrl", "H"], description: "Find & Replace" },
      { keys: ["Ctrl", "/"], description: "Toggle line comment" },
    ],
  },
];

export const DevPreferences: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'syntax' | 'complexity' | 'editor'>('editor');
  const [language, setLanguage] = useState<'python' | 'cpp' | 'java'>('python');
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('editorTheme') as 'light' | 'dark') || 'dark'
    }
    return 'dark'
  });
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('fontSize') || '14')
    }
    return 14
  });
  const [keyBindings, setKeyBindings] = useState<'vscode' | 'vim' | 'emacs'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('keyBindings') as 'vscode' | 'vim' | 'emacs') || 'vscode'
    }
    return 'vscode'
  });
  const handleKeyBindingsChange = (binding: 'vscode' | 'vim' | 'emacs') => {
      setKeyBindings(binding);
      localStorage.setItem('keyBindings', binding);
      // Dispatch event to update monaco editor
      window.dispatchEvent(new CustomEvent('editorKeybindingsChange', { detail: { binding } }));
   };
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setEditorTheme(theme);
    localStorage.setItem('editorTheme', theme);
    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    // Dispatch event to update monaco editor
    window.dispatchEvent(new CustomEvent('editorThemeChange', { detail: { theme } }));
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size.toString());
    // Dispatch event to update monaco editor
    window.dispatchEvent(new CustomEvent('editorFontSizeChange', { detail: { fontSize: size } }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[900px] h-[700px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
             <BookOpen size={20} className="text-accent" />
             <h2 className="text-lg font-bold text-foreground">Developer Preferences</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('editor')}
             className={clsx("py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'editor' ? "border-accent text-foreground bg-muted" : "border-transparent text-muted-foreground hover:bg-muted/50")}
           >
             <Settings size={16} /> Editor Settings
           </button>
           <button 
             onClick={() => setActiveTab('shortcuts')}
             className={clsx("py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'shortcuts' ? "border-accent text-foreground bg-muted" : "border-transparent text-muted-foreground hover:bg-muted/50")}
           >
             <Keyboard size={16} /> Shortcuts
           </button>
           <button 
             onClick={() => setActiveTab('syntax')}
             className={clsx("py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'syntax' ? "border-accent text-foreground bg-muted" : "border-transparent text-muted-foreground hover:bg-muted/50")}
           >
             <Code size={16} /> Language Syntax
           </button>
           <button 
             onClick={() => setActiveTab('complexity')}
             className={clsx("py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'complexity' ? "border-accent text-foreground bg-muted" : "border-transparent text-muted-foreground hover:bg-muted/50")}
           >
             <Zap size={16} /> Complexity Cheatsheet
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-card">
           {activeTab === 'editor' && (
              <div className="space-y-6">
                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-accent uppercase tracking-wide">Theme</h3>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => handleThemeChange('light')}
                         className={clsx("px-4 py-2 rounded border-2 font-medium transition-colors", editorTheme === 'light' ? "border-accent bg-accent/20 text-accent" : "border-border bg-muted text-muted-foreground hover:border-accent")}
                       >
                         Light
                       </button>
                       <button 
                         onClick={() => handleThemeChange('dark')}
                         className={clsx("px-4 py-2 rounded border-2 font-medium transition-colors", editorTheme === 'dark' ? "border-accent bg-accent/20 text-accent" : "border-border bg-muted text-muted-foreground hover:border-accent")}
                       >
                         Dark
                       </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-accent uppercase tracking-wide">Font Size</h3>
                    <div className="flex items-center gap-4">
                       <input 
                         type="range" 
                         min="10" 
                         max="20" 
                         value={fontSize}
                         onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                         className="flex-1 accent-accent cursor-pointer"
                       />
                       <span className="text-sm font-mono bg-muted px-3 py-1 rounded border border-border min-w-[3rem] text-center">{fontSize}px</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Preview: <span style={{ fontSize: `${fontSize}px` }} className="font-mono">Hello Code</span></p>
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-accent uppercase tracking-wide">Key Bindings</h3>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => handleKeyBindingsChange('vscode')}
                         className={clsx("px-4 py-2 rounded border-2 font-medium transition-colors", keyBindings === 'vscode' ? "border-accent bg-accent/20 text-accent" : "border-border bg-muted text-muted-foreground hover:border-accent")}
                       >
                         VS Code
                       </button>
                       <button 
                         onClick={() => handleKeyBindingsChange('vim')}
                         className={clsx("px-4 py-2 rounded border-2 font-medium transition-colors", keyBindings === 'vim' ? "border-accent bg-accent/20 text-accent" : "border-border bg-muted text-muted-foreground hover:border-accent")}
                       >
                         Vim
                       </button>
                       <button 
                         onClick={() => setKeyBindings('emacs')}
                         className={clsx("px-4 py-2 rounded border-2 font-medium transition-colors", keyBindings === 'emacs' ? "border-accent bg-accent/20 text-accent" : "border-border bg-muted text-muted-foreground hover:border-accent")}
                       >
                         Emacs
                       </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Current: <span className="font-semibold text-foreground">{keyBindings.charAt(0).toUpperCase() + keyBindings.slice(1)}</span></p>
                 </div>
              </div>
           )}
           {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                 {shortcuts.map((section) => (
                    <div key={section.category}>
                       <h3 className="text-sm font-semibold text-accent mb-2 uppercase tracking-wide">{section.category}</h3>
                       <div className="space-y-1">
                          {section.items.map((shortcut, i) => (
                             <div key={i} className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted transition-colors">
                                <span className="text-sm text-foreground">{shortcut.description}</span>
                                <div className="flex items-center gap-1">
                                   {shortcut.keys.map((key, j) => (
                                      <span key={j} className="flex items-center gap-1">
                                         <kbd className="px-2 py-1 text-xs font-mono bg-secondary text-secondary-foreground rounded border border-border shadow-sm min-w-[2rem] text-center">
                                            {key}
                                         </kbd>
                                         {j < shortcut.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                                      </span>
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           )}
           {activeTab === 'syntax' && (
              <div className="space-y-6">
                 <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setLanguage('python')} className={clsx("px-3 py-1 rounded text-xs font-bold border", language === 'python' ? "bg-accent/20 border-accent text-accent" : "bg-muted border-border text-muted-foreground")}>Python</button>
                    <button onClick={() => setLanguage('cpp')} className={clsx("px-3 py-1 rounded text-xs font-bold border", language === 'cpp' ? "bg-accent/20 border-accent text-accent" : "bg-muted border-border text-muted-foreground")}>C++</button>
                    <button onClick={() => setLanguage('java')} className={clsx("px-3 py-1 rounded text-xs font-bold border", language === 'java' ? "bg-accent/20 border-accent text-accent" : "bg-muted border-border text-muted-foreground")}>Java</button>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                       <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Code size={14}/> Arrays / Lists</h3>
                       <pre className="bg-background p-3 rounded text-xs font-mono text-muted-foreground overflow-x-auto">
{language === 'python' ? `# Initialize
arr = [1, 2, 3]

# Access
first = arr[0]
last = arr[-1]

# Methods
arr.append(4)       # Add to end
arr.pop()           # Remove from end
arr.insert(0, 0)    # Add to start
arr[1:3]            # Slice
arr.sort()          # Sort` 
: language === 'cpp' ?
`// Initialize
vector<int> arr = {1, 2, 3};

// Access
int first = arr[0];
int last = arr.back();

// Methods
arr.push_back(4);   // Add to end
arr.pop_back();     // Remove from end
arr.insert(arr.begin(), 0); // Add to start
sort(arr.begin(), arr.end());`
:
`// Initialize
int[] arr = {1, 2, 3};
List<Integer> list = new ArrayList<>(Arrays.asList(arr));

// Access
int first = arr[0];
int last = arr[arr.length - 1];

// Methods
list.add(4);        // Add to end
list.remove(list.size() - 1); // Remove from end
list.add(0, 0);     // Add to start
Collections.sort(list);`}
                       </pre>
                    </div>

                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                       <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Code size={14}/> Hash Maps / Dictionaries</h3>
                       <pre className="bg-background p-3 rounded text-xs font-mono text-muted-foreground overflow-x-auto">
{language === 'python' ? `# Initialize
d = {}

# Operations
d['key'] = 'val'
val = d.get('key')
exists = 'key' in d
del d['key']

# Iteration
for k, v in d.items():
    print(k, v)`
: language === 'cpp' ?
`// Initialize
unordered_map<string, int> map;

// Operations
map['key'] = 10;
int val = map['key'];
bool exists = map.count('key') > 0;
map.erase('key');

// Iteration
for (auto& p : map) {
  cout << p.first << " " << p.second;
}`
:
`// Initialize
Map<String, Integer> map = new HashMap<>();

// Operations
map.put("key", 10);
int val = map.get("key");
boolean exists = map.containsKey("key");
map.remove("key");

// Iteration
for (Map.Entry<String, Integer> entry : map.entrySet()) {
  System.out.println(entry.getKey() + " " + entry.getValue());
}`}
                       </pre>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'complexity' && (
              <div className="space-y-6">
                 <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Zap size={14}/> Common Data Structures</h3>
                    <table className="w-full text-left text-xs border-collapse">
                       <thead>
                          <tr className="border-b border-border text-muted-foreground">
                             <th className="p-2">Data Structure</th>
                             <th className="p-2">Access</th>
                             <th className="p-2">Search</th>
                             <th className="p-2">Insertion</th>
                             <th className="p-2">Deletion</th>
                          </tr>
                       </thead>
                       <tbody className="font-mono text-foreground">
                          <tr className="border-b border-border/30">
                             <td className="p-2">Array</td>
                             <td className="p-2 text-green-500">O(1)</td>
                             <td className="p-2 text-yellow-500">O(n)</td>
                             <td className="p-2 text-yellow-500">O(n)</td>
                             <td className="p-2 text-yellow-500">O(n)</td>
                          </tr>
                          <tr className="border-b border-border/30">
                             <td className="p-2">Stack/Queue</td>
                             <td className="p-2 text-yellow-500">O(n)</td>
                             <td className="p-2 text-yellow-500">O(n)</td>
                             <td className="p-2 text-green-500">O(1)</td>
                             <td className="p-2 text-green-500">O(1)</td>
                          </tr>
                          <tr className="border-b border-border/30">
                             <td className="p-2">Hash Table</td>
                             <td className="p-2 text-muted-foreground">-</td>
                             <td className="p-2 text-green-500">O(1)</td>
                             <td className="p-2 text-green-500">O(1)</td>
                             <td className="p-2 text-green-500">O(1)</td>
                          </tr>
                          <tr className="border-b border-border/30">
                             <td className="p-2">Binary Search Tree</td>
                             <td className="p-2 text-green-400">O(log n)</td>
                             <td className="p-2 text-green-400">O(log n)</td>
                             <td className="p-2 text-green-400">O(log n)</td>
                             <td className="p-2 text-green-400">O(log n)</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>

                 <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Zap size={14}/> Sorting Algorithms</h3>
                    <table className="w-full text-left text-xs border-collapse">
                       <thead>
                          <tr className="border-b border-border text-muted-foreground">
                             <th className="p-2">Algorithm</th>
                             <th className="p-2">Best</th>
                             <th className="p-2">Average</th>
                             <th className="p-2">Worst</th>
                             <th className="p-2">Space</th>
                          </tr>
                       </thead>
                       <tbody className="font-mono text-foreground">
                          <tr className="border-b border-border/30">
                             <td className="p-2">Quicksort</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-red-500">O(n²)</td>
                             <td className="p-2 text-green-400">O(log n)</td>
                          </tr>
                          <tr className="border-b border-border/30">
                             <td className="p-2">Mergesort</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-yellow-500">O(n)</td>
                          </tr>
                          <tr className="border-b border-border/30">
                             <td className="p-2">Heapsort</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-green-400">O(n log n)</td>
                             <td className="p-2 text-green-500">O(1)</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
