import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Paper } from '../types';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, Search, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { geminiService } from '../services/gemini';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: 'paper' | 'author';
  isAdded: boolean;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export default function PaperGraph({ papers, onAddPaper }: { papers: Paper[], onAddPaper: (paper: Paper) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<Paper>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [visiblePapers, setVisiblePapers] = useState<Paper[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await geminiService.semanticSearch(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  // Initialize visible papers with those in knowledge base
  useEffect(() => {
    setVisiblePapers(prev => {
      const kbIds = new Set(papers.map(p => p.id));
      const existingIds = new Set(prev.map(p => p.id));
      
      // Keep existing ones, but update their status if they were added to KB
      const updated = prev.map(p => {
        const kbPaper = papers.find(kp => kp.id === p.id);
        return kbPaper ? { ...kbPaper, isAdded: true } : p;
      });

      // Add new KB papers that aren't in visiblePapers yet
      const toAdd = papers.filter(p => !existingIds.has(p.id));
      
      return [...updated, ...toAdd];
    });
  }, [papers]);

  const handleExpand = async (paper: Paper) => {
    if (isExpanding) return;
    setIsExpanding(true);
    
    try {
      const { citations, citedBy } = await geminiService.findCitations(paper);
      
      const newPapers: Paper[] = [];
      const allTitles = new Set(visiblePapers.map(p => p.title.toLowerCase()));
      const kbTitles = new Set(papers.map(p => p.title.toLowerCase()));

      const processResults = (results: Partial<Paper>[], isCitation: boolean) => {
        results.forEach(res => {
          const title = res.title || "";
          if (!title) return;
          
          if (!allTitles.has(title.toLowerCase()) && !kbTitles.has(title.toLowerCase())) {
            const newId = `ext-${Math.random().toString(36).substr(2, 9)}`;
            const newPaper: Paper = {
              id: newId,
              title: res.title || "Untitled",
              authors: res.authors || ["Unknown"],
              year: res.year || new Date().getFullYear(),
              abstract: res.abstract || "No abstract available.",
              isAdded: false,
              citations: isCitation ? [] : [paper.id],
              citedBy: isCitation ? [paper.id] : [],
              doi: res.doi
            };
            newPapers.push(newPaper);
            
            // Link back to source
            if (isCitation) {
              paper.citations.push(newId);
            } else {
              paper.citedBy.push(newId);
            }
          } else {
            // If it exists in visiblePapers or KB, just link it
            const existing = visiblePapers.find(p => p.title.toLowerCase() === title.toLowerCase()) 
                          || papers.find(p => p.title.toLowerCase() === title.toLowerCase());
            if (existing && existing.id !== paper.id) {
              if (isCitation) {
                if (!paper.citations.includes(existing.id)) paper.citations.push(existing.id);
                if (!existing.citedBy.includes(paper.id)) existing.citedBy.push(paper.id);
              } else {
                if (!paper.citedBy.includes(existing.id)) paper.citedBy.push(existing.id);
                if (!existing.citations.includes(paper.id)) existing.citations.push(paper.id);
              }
            }
          }
        });
      };

      processResults(citations, true);
      processResults(citedBy, false);

      if (newPapers.length > 0) {
        setVisiblePapers(prev => [...prev, ...newPapers]);
      } else {
        // Trigger re-render to show new links
        setVisiblePapers(prev => [...prev]);
      }
    } catch (error) {
      console.error("Expansion failed", error);
    } finally {
      setIsExpanding(false);
    }
  };

  useEffect(() => {
    if (!svgRef.current || visiblePapers.length === 0) return;

    const width = 800;
    const height = 600;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");

    // Add arrow marker definition
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20) // Position arrowhead at the end of the line
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#3f3f46")
      .style("stroke", "none");

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom)
      .on("dblclick.zoom", null); // Disable double-click to zoom to allow node dblclick

    // Prepare data
    const nodes: Node[] = visiblePapers.map(p => ({ 
      id: p.id, 
      title: p.title, 
      type: 'paper',
      isAdded: p.isAdded
    }));
    
    const links: Link[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    visiblePapers.forEach(p => {
      p.citations.forEach(citeId => {
        if (nodeMap.has(citeId)) {
          links.push({ source: p.id, target: citeId });
        }
      });
    });

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const link = g.append("g")
      .attr("stroke", "#3f3f46")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Outer circle for sub-color (KB status)
    node.append("circle")
      .attr("r", 12)
      .attr("fill", "transparent")
      .attr("stroke", d => d.isAdded ? "#10b981" : "#6366f1")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => d.isAdded ? "none" : "3,3");

    // Inner circle
    node.append("circle")
      .attr("r", 8)
      .attr("fill", d => d.isAdded ? "#10b981" : "#6366f1")
      .attr("class", "cursor-pointer transition-all duration-300 hover:r-10")
      .on("click", (event, d) => {
        const paper = visiblePapers.find(p => p.id === d.id);
        if (paper) {
          setSelectedPaper(paper);
        }
      })
      .on("dblclick", (event, d) => {
        event.stopPropagation();
        const paper = visiblePapers.find(p => p.id === d.id);
        if (paper) {
          handleExpand(paper);
        }
      });

    node.append("text")
      .attr("x", 16)
      .attr("y", 4)
      .text(d => d.title.length > 25 ? d.title.substring(0, 22) + "..." : d.title)
      .attr("fill", "#a1a1aa")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .attr("class", "pointer-events-none select-none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [visiblePapers]);

  return (
    <div className="flex h-full bg-zinc-950 overflow-hidden">
      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors ${showSearch ? 'text-emerald-500 border-emerald-500/50' : ''}`}
          >
            <Search className="w-5 h-5" />
          </button>
          <button className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {showSearch && (
          <div className="absolute top-6 left-20 z-20 w-80 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
            <form onSubmit={handleSearch} className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search online papers..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </form>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {isSearching ? (
                <div className="p-8 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className="text-xs text-zinc-500">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((paper, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group">
                    <h4 className="text-xs font-bold text-white line-clamp-2 mb-1 group-hover:text-emerald-400">{paper.title}</h4>
                    <p className="text-[10px] text-zinc-500 mb-2">{paper.authors?.join(', ')}</p>
                    <button
                      onClick={() => onAddPaper(paper as Paper)}
                      disabled={papers.some(p => p.title === paper.title)}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        papers.some(p => p.title === paper.title)
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {papers.some(p => p.title === paper.title) ? (
                        <><CheckCircle2 className="w-3 h-3" /> Added</>
                      ) : (
                        <><Plus className="w-3 h-3" /> Add to Base</>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Search for papers to add them to your graph.
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="absolute top-6 right-6 z-10 bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-xl max-w-xs">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Graph Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span>In Knowledge Base</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <div className="w-3 h-3 bg-indigo-500 rounded-full border border-indigo-500 border-dashed" />
              <span>External Paper</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-zinc-500 leading-relaxed">
            <span className="text-emerald-400 font-bold">Single-click</span> to view details. <br />
            <span className="text-indigo-400 font-bold">Double-click</span> to expand citation network online.
          </div>
        </div>

        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {selectedPaper && (
        <div className="w-96 border-l border-zinc-800 bg-zinc-950 p-8 overflow-y-auto relative">
          {isExpanding && (
            <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Searching Citations...</p>
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">{selectedPaper.title}</h2>
            <button onClick={() => setSelectedPaper(null)} className="text-zinc-500 hover:text-white">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Authors</span>
              <p className="text-sm text-zinc-300 mt-1">{selectedPaper.authors.join(', ')}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Abstract</span>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{selectedPaper.abstract}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Citations</span>
                <p className="text-xl font-bold text-emerald-500 mt-1">{selectedPaper.citations.length}</p>
              </div>
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Cited By</span>
                <p className="text-xl font-bold text-emerald-500 mt-1">{selectedPaper.citedBy.length}</p>
              </div>
            </div>

            {!selectedPaper.isAdded && (
              <button
                onClick={() => {
                  onAddPaper(selectedPaper);
                  setSelectedPaper({ ...selectedPaper, isAdded: true });
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Add to Knowledge Base
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
