import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trash2, 
  BarChart3, 
  Camera, 
  ShoppingBag, 
  Settings, 
  AlertTriangle,
  Leaf,
  ChevronRight,
  Plus,
  Zap,
  BrainCircuit,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { analyzeWasteImage, WasteAnalysis, getOptimizationSuggestions } from "./lib/gemini";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock data for initial state
const INITIAL_WASTE_DATA = [
  { name: 'Mon', waste: 450 },
  { name: 'Tue', waste: 300 },
  { name: 'Wed', waste: 600 },
  { name: 'Thu', waste: 200 },
  { name: 'Fri', waste: 800 },
  { name: 'Sat', waste: 400 },
  { name: 'Sun', waste: 150 },
];

const CATEGORY_DATA = [
  { name: 'Produce', value: 45, color: '#22c55e' },
  { name: 'Dairy', value: 25, color: '#3b82f6' },
  { name: 'Meat', value: 15, color: '#ef4444' },
  { name: 'Bakery', value: 10, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wasteHistory, setWasteHistory] = useState<WasteAnalysis[]>([]);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Simulate initial load
  useEffect(() => {
    const mockHistory: WasteAnalysis[] = [
      {
        item: "Spinach",
        category: "Produce",
        estimatedWeight: "200g",
        reasonForWaste: "Expired",
        reductionTip: "Store with a paper towel to absorb moisture.",
        impactScore: 65
      },
      {
        item: "Milk",
        category: "Dairy",
        estimatedWeight: "500ml",
        reasonForWaste: "Soured",
        reductionTip: "Keep in the back of the fridge, not the door.",
        impactScore: 80
      }
    ];
    setWasteHistory(mockHistory);
    setOptimizations([
      "Reduce Spinach purchase by 50% for next week.",
      "Switch to long-life milk or smaller cartons.",
      "Check fridge temperature; currently 2°C too high."
    ]);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      setIsAnalyzing(true);
      
      try {
        const result = await analyzeWasteImage(base64.split(',')[1]);
        setWasteHistory(prev => [result, ...prev]);
        
        // Refresh optimizations after new data
        const newOpts = await getOptimizationSuggestions([result, ...wasteHistory]);
        setOptimizations(newOpts);
      } catch (error) {
        console.error("Analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-50 font-sans selection:bg-sky-500/30">
      {/* Sidebar / Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#0A0F1E] border-r border-white/10 flex flex-col z-50">
        <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="hidden md:block font-extrabold text-xl tracking-tighter">Scripto<span className="text-sky-500">Nourish</span></span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: "dashboard", icon: BarChart3, label: "Pipeline" },
            { id: "vision", icon: Camera, label: "Vision Hub" },
            { id: "analytics", icon: Database, label: "Neural Analytics" },
            { id: "shopping", icon: ShoppingBag, label: "Logistics" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden md:block font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hidden md:block">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Eco Efficiency</span>
            </div>
            <div className="text-3xl font-black mb-1 tracking-tighter">84%</div>
            <Progress value={84} className="h-1.5 bg-white/10" />
            <p className="text-[10px] text-slate-500 mt-3 font-medium">Saving every "bit" of data.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen flex flex-col">
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-10 sticky top-0 bg-[#0A0F1E]/80 backdrop-blur-2xl z-40">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">Neural Node: <span className="text-sky-500">Connected</span></h1>
            </div>
            <p className="text-xl font-extrabold tracking-tight">
              {activeTab === "dashboard" && "Central Command"}
              {activeTab === "vision" && "Neural Analysis Pipeline"}
              {activeTab === "analytics" && "Scripted Logic Engine"}
              {activeTab === "shopping" && "Optimized Inventory"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl h-10 px-5">
              <Settings className="w-4 h-4 mr-2" />
              System Config
            </Button>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="p-10 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <Badge className="bg-sky-500/15 text-sky-500 border-sky-500/50 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-6">GOOGLE PITCH DECK 2024</Badge>
                  <h2 className="text-6xl font-extrabold tracking-tighter leading-[0.9] mb-6 bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                    Save Every Bit <br /> of Food.
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed">
                    The first cloud-based AI pipeline merging Neural Analysis and Scripted Logic to eliminate industrial food waste before it happens.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Stats Grid */}
                  <Card className="bg-white/5 border-white/10 rounded-[32px] col-span-1 lg:col-span-2 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-sky-500/50">
                    <CardHeader className="px-8 pt-8">
                      <CardTitle className="text-slate-100 flex items-center gap-2 text-xl font-bold">
                        <BarChart3 className="w-5 h-5 text-sky-500" />
                        Waste Trajectory
                      </CardTitle>
                      <CardDescription className="text-slate-500 font-medium">Weekly food waste volume telemetry (grams)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px] px-4 pb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={INITIAL_WASTE_DATA}>
                          <defs>
                            <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: '#0ea5e9' }}
                          />
                          <Area type="monotone" dataKey="waste" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorWaste)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 rounded-[32px] relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-sky-500/50">
                    <CardHeader className="px-8 pt-8">
                      <CardTitle className="text-slate-100 flex items-center gap-2 text-xl font-bold">
                        <BrainCircuit className="w-5 h-5 text-sky-500" />
                        Neural Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-5">
                      {optimizations.map((opt, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start group hover:bg-white/10 transition-all duration-300">
                          <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <Zap className="w-4 h-4 text-sky-500 fill-current" />
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium">{opt}</p>
                        </div>
                      ))}
                      <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-sky-500/20 mt-4">
                        Apply All Optimizations
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="bg-white/5 border-white/10 rounded-[32px] col-span-1 lg:col-span-3 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-emerald-500/50">
                    <CardHeader className="px-10 pt-10 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-slate-100 text-2xl font-bold tracking-tight">Recent Neural Logs</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Processed waste items via Neural Analysis Pipeline</CardDescription>
                      </div>
                      <Button variant="ghost" className="text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-xl">
                        View Full History <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wasteHistory.slice(0, 4).map((item, i) => (
                          <div key={i} className="p-6 rounded-[24px] bg-white/5 border border-white/10 hover:border-sky-500/40 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                              <Badge className="bg-sky-500/10 text-sky-500 border-none px-3 py-1 text-[10px] font-bold tracking-wider uppercase">{item.category}</Badge>
                              <span className="text-[10px] text-slate-500 font-mono font-bold">{item.estimatedWeight}</span>
                            </div>
                            <h4 className="font-bold text-xl mb-2 tracking-tight">{item.item}</h4>
                            <p className="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed font-medium">{item.reductionTip}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <div className="flex -space-x-2">
                                {[1, 2, 3].map(n => (
                                  <div key={n} className="w-7 h-7 rounded-full border-2 border-[#0A0F1E] bg-slate-800 flex items-center justify-center text-[9px] font-bold">
                                    {n}
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs font-bold text-emerald-500">Impact: {item.impactScore}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Bar Footer */}
                <div className="h-[120px] bg-white/[0.02] border-t border-white/10 rounded-[32px] flex justify-around items-center px-10">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white tracking-tighter">42.8%</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px] mt-1">Waste Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-emerald-500 tracking-tighter">$1.2M</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px] mt-1">Avg. Annual Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-white tracking-tighter">99.9%</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px] mt-1">Vision Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-white tracking-tighter">2.4ms</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px] mt-1">Inference Latency</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "vision" && (
              <motion.div
                key="vision"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="max-w-5xl mx-auto"
              >
                <Card className="bg-white/5 border-white/10 rounded-[40px] overflow-hidden relative before:absolute before:top-0 before:left-0 before:w-full before:h-1.5 before:bg-sky-500">
                  <div className="aspect-video bg-slate-900/50 relative flex items-center justify-center border-b border-white/10">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mx-auto border-2 border-dashed border-white/10">
                          <Camera className="w-10 h-10 text-slate-600" />
                        </div>
                        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Initialize Neural Camera Feed</p>
                      </div>
                    )}
                    
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(14,165,233,0.3)]"></div>
                        <p className="text-sky-500 font-black tracking-[4px] text-sm animate-pulse">ANALYZING NEURAL PATTERNS...</p>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-12">
                    <div className="flex flex-col md:flex-row gap-10 items-center justify-between">
                      <div className="space-y-3 max-w-xl">
                        <h3 className="text-3xl font-extrabold tracking-tight">Waste Identification Pipeline</h3>
                        <p className="text-slate-400 font-medium leading-relaxed">Upload an image of food waste to trigger neural analysis. Our proprietary AI pipeline processes visual telemetry to detect spoilage 48 hours before human perception.</p>
                      </div>
                      <div className="flex gap-4 shrink-0">
                        <input
                          type="file"
                          id="waste-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button 
                          onClick={() => document.getElementById('waste-upload')?.click()}
                          className="bg-sky-500 hover:bg-sky-600 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-sky-500/20 text-lg"
                        >
                          <Camera className="w-6 h-6 mr-3" />
                          Capture Waste
                        </Button>
                      </div>
                    </div>

                    {wasteHistory.length > 0 && !isAnalyzing && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 p-8 rounded-[32px] bg-white/5 border border-white/10 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                            <BrainCircuit className="w-5 h-5 text-sky-500" />
                          </div>
                          <h4 className="font-bold uppercase tracking-[3px] text-[10px] text-slate-500">Latest Inference Result</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                          <div>
                            <p className="text-[10px] uppercase tracking-[2px] text-slate-500 mb-2 font-bold">Item</p>
                            <p className="font-extrabold text-2xl tracking-tight">{wasteHistory[0].item}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[2px] text-slate-500 mb-2 font-bold">Category</p>
                            <Badge className="bg-sky-500/10 text-sky-500 border-none px-4 py-1.5 rounded-full font-bold text-xs">{wasteHistory[0].category}</Badge>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[2px] text-slate-500 mb-2 font-bold">Impact</p>
                            <p className="font-black text-3xl text-emerald-500 tracking-tighter">{wasteHistory[0].impactScore}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[2px] text-slate-500 mb-2 font-bold">Action</p>
                            <p className="text-sm text-slate-300 font-medium leading-snug">{wasteHistory[0].reductionTip}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <Card className="bg-white/5 border-white/10 rounded-[32px] overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-sky-500/50">
                  <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-slate-100 text-xl font-bold">Waste Composition</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Neural classification distribution across inventory</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] flex items-center justify-center px-8 pb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CATEGORY_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {CATEGORY_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 ml-8 shrink-0">
                      {CATEGORY_DATA.map((cat, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: cat.color }} />
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{cat.name}</span>
                          <span className="text-xs font-black text-white">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 rounded-[32px] overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-emerald-500/50">
                  <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-slate-100 text-xl font-bold">Environmental Savings</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Calculated impact of scripted logic optimization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 px-8 pb-8">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">CO2 Emissions Saved</span>
                        <span className="text-emerald-500">12.4 kg</span>
                      </div>
                      <Progress value={65} className="h-2.5 bg-white/5" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">Water Usage Reduction</span>
                        <span className="text-sky-500">450 L</span>
                      </div>
                      <Progress value={42} className="h-2.5 bg-white/5" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">Financial Recovery</span>
                        <span className="text-yellow-500">$84.20</span>
                      </div>
                      <Progress value={88} className="h-2.5 bg-white/5" />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-12 h-12 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-emerald-500 fill-current" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[2px]">System Efficiency</span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">Your waste reduction is in the top 5% of all ScriptoNourish nodes. Scripted logic has successfully optimized 84% of your inventory friction points.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "shopping" && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="bg-white/5 border-white/10 rounded-[40px] overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1.5 before:bg-sky-500">
                  <CardHeader className="p-10 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-slate-100 text-3xl font-extrabold tracking-tight">Smart Shopping List</CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-1">Optimized by Scripted Logic Engine v4.2</CardDescription>
                      </div>
                      <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-sky-500/20">
                        <Plus className="w-5 h-5 mr-2" /> Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[450px]">
                      <div className="divide-y divide-white/5">
                        {[
                          { name: "Organic Spinach", qty: "100g", status: "Reduced", reason: "High waste pattern detected" },
                          { name: "Almond Milk", qty: "1L", status: "Optimized", reason: "Longer shelf life substitution" },
                          { name: "Sourdough Bread", qty: "1 Loaf", status: "Standard", reason: "Consistent usage pattern" },
                          { name: "Greek Yogurt", qty: "2 Units", status: "Reduced", reason: "Slow consumption rate" },
                          { name: "Avocados", qty: "3 Units", status: "Optimized", reason: "Staggered ripening logic" },
                          { name: "Chicken Breast", qty: "500g", status: "Standard", reason: "High protein utilization" },
                        ].map((item, i) => (
                          <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-300 group">
                            <div className="flex items-center gap-6">
                              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] ${item.status === 'Reduced' ? 'bg-emerald-500' : item.status === 'Optimized' ? 'bg-sky-500' : 'bg-slate-600'}`} />
                              <div>
                                <p className="font-extrabold text-xl tracking-tight group-hover:text-sky-400 transition-colors">{item.name}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{item.reason}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-lg font-bold text-white">{item.qty}</p>
                              <Badge variant="outline" className="text-[10px] font-black py-0.5 px-3 border-white/10 text-slate-400 mt-2 uppercase tracking-widest">{item.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <div className="p-10 border-t border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Total Optimized Items</span>
                      <span className="font-black text-2xl tracking-tighter">12</span>
                    </div>
                    <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black h-16 rounded-2xl text-xl shadow-2xl shadow-sky-500/30 tracking-tight">
                      Export to Smart Cart
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </div>
  );
}
