import React, { useState, useEffect,useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Settings, Layout, ChevronDown, Search, Bell, User, Menu } from 'lucide-react';
import {ColorType,createChart} from "lightweight-charts";
import './index.css'

// Mock data generation
const generateMockData = (days = 30) => {
  const data = [];
  let price = 100;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    const open = price + (Math.random() - 0.5) * 2;
    const high = open + Math.random() * 2;
    const low = open - Math.random() * 2;
    const close = (open + high + low) / 3;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000),
    });
    
    price = close;
  }
  return data;
};


const TradingPlatform = () => {
  const [stockData, setStockData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [showIndicators, setShowIndicators] = useState(false);
  const [chartType,setChartType]=useState("");
  
  useEffect(() => {
    setStockData(generateMockData(30));
  }, [selectedTimeframe]);

  const WatchList = () => (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Watchlist</h2>
        <button className="text-blue-600">+ Add</button>
      </div>
      {['AAPL', 'MSFT', 'AMZN','TSLA','META','NVDA', 'TCS', 'INFY','JPM','GOOGL'].map((stock) => (
        <div 
          key={stock}
          className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => setSelectedStock(stock)}
        >
          <span className="font-medium">{stock}</span>
          <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
            ₹{(Math.random() * 1000).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );

  const Header = () => (
    <div className="bg-white p-4 flex justify-between items-center mb-4">
      <div className="flex items-center space-x-4">
        <Menu className="w-6 h-6" />
        <h1 className="text-xl font-bold">TradeUp</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search stocks..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Bell className="w-6 h-6" />
        <User className="w-6 h-6" />
      </div>
    </div>
  );
  const Navbar=()=>(
    
        <div className="navbar">
          <div className="indices">
            <span>NIFTY 50 <strong></strong></span>
            <span>SENSEX <strong></strong> </span>
          </div>
          <div className="menu">
            <a href="#">Dashboard</a>
            <a href="#">Orders</a>
            <a href="#">Holdings</a>
            <a href="#">Positions</a>
            <a href="#">Bids</a>
            <a href="#">Funds</a>
          </div>
          <div className="profile">USER</div>
        </div>
    );

    
    
    
    

  const ChartControls = () => (
    <div className="bg-white p-4 mb-4 flex justify-between items-center">
      <div className="flex space-x-4">
        <select 
          className="border rounded-lg px-3 py-2"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
        >
          <option value="" disabled>Views</option>
          {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'].map((tf) => (
            <option key={tf} value={tf}>{tf}</option>
          ))}
        </select>
        
        <select 
          className="border rounded-lg px-3 py-2"
          value={chartType}
          onChange={(e)=>setChartType(e.target.value)}
        >
          <option value="" disabled>Chart Types</option>
          {['Line','Candles' ,'Vertex Line', 'Bar', 'Coloured Bar', 'Histogram'].map((charttype) => (
            <option key={charttype} value={charttype}>{charttype}</option>
          ))}
        </select>
        <button 
          className="px-4 py-2 border rounded-lg flex items-center space-x-2"
          onClick={() => setShowIndicators(!showIndicators)}
        >
          <Settings className="w-4 h-4" />
          <span>Indicators</span>
        </button>
      </div>
      
    </div>
  );

  const MainChart = () => (
    <div className="bg-white p-4 rounded-lg mb-4" style={{ height: '500px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={stockData}>
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#2563eb" 
            dot={false}
          />
          {showIndicators && (
            <>
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#10B981" 
                dot={false} 
                strokeDasharray="3 3"
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#EF4444" 
                dot={false} 
                strokeDasharray="3 3"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const VolumeChart = () => (
    <div className="bg-white p-4 rounded-lg" style={{ height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stockData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="volume" fill="#93C5FD" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const MarketDepth = () => (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Market Depth</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-green-500 font-medium mb-2">Bids</h3>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span>{(Math.random() * 1000).toFixed(2)}</span>
              <span>{Math.floor(Math.random() * 1000)}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-red-500 font-medium mb-2">Asks</h3>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span>{(Math.random() * 1000).toFixed(2)}</span>
              <span>{Math.floor(Math.random() * 1000)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <WatchList />
            <MarketDepth />
          </div>
          <div className="col-span-3">
            <ChartControls />
            <MainChart />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPlatform;