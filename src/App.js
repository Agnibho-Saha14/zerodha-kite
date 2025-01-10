import React, { useState, useEffect,useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Settings, Layout, ChevronDown, Search, Bell, User, Menu } from 'lucide-react';
import {ColorType,createChart} from "lightweight-charts";
import './index.css'
import MainChart from './MainChart';
import { generateMockData, getCompanyInfo,getBasePrice,getVolatility } from './mockData';





const TradingPlatform = () => {
  const [stockData, setStockData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [showIndicators, setShowIndicators] = useState(false);
  const [chartType, setChartType] = useState("Line");
  const [companyInfo, setCompanyInfo] = useState(null);
  
  useEffect(() => {
    const timeframeDays = {
      '1D': 1,
      '5D': 5,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      'YTD': Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24)),
      '1Y': 365,
      '5Y': 1825
    };
    
    const days = timeframeDays[selectedTimeframe] || 30;
    setStockData(generateMockData(selectedStock, days));
    setCompanyInfo(getCompanyInfo(selectedStock));
  }, [selectedTimeframe, selectedStock]);

  const WatchList = () => (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Watchlist</h2>
        <button className="text-blue-600">+ Add</button>
      </div>
      {['AAPL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'TCS', 'INFY', 'JPM', 'GOOGL'].map((stock) => {
        const price = (getBasePrice(stock) + (Math.random() - 0.5) * getVolatility(stock)).toFixed(2);
        const change = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5).toFixed(2);
        
        return (
          <div 
            key={stock}
            className={`flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer ${
              selectedStock === stock ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedStock(stock)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{stock}</span>
              <span className="text-xs text-gray-500">{getCompanyInfo(stock).name}</span>
            </div>
            <div className="flex items-end">
              <span className="font-medium">₹{price}</span>
              <span className={change > 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  
  const Navbar=()=>(
    
        <div className="navbar">
          <div className="indices">
            <span>NIFTY 50 <strong>0.00</strong></span>
            <span>SENSEX <strong>0.00</strong> </span>
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

  

  
  

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <WatchList />
      
          </div>
          <div className="col-span-3">
            <ChartControls />
            <MainChart 
              stockData={stockData}
              chartType={chartType}
              showIndicators={showIndicators}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


export default TradingPlatform;