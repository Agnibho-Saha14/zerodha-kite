import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import Plot from 'react-plotly.js';

const MainChart = ({ stockData, chartType = 'Line', showIndicators = false }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const priceSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef([]);
  
  // State for processed data and timeline slider
  const [processedData, setProcessedData] = useState({
    x: [],
    close: [],
    high: [],
    low: [],
    open: [],
    volume: []
  });

  const [sliderState, setSliderState] = useState({
    isDragging: false,
    activeHandle: null,
    startX: 0,
    range: { start: 60, end: 100 } // Show last 30% by default
  });

  // Process stock data
  useEffect(() => {
    if (!stockData?.length) return;

    const processedPoints = stockData.map(item => {
      const [day, month, year] = item.Date.split('-').map(num => parseInt(num, 10));
      const timestamp = new Date(year, month - 1, day);

      return {
        time: Math.floor(timestamp.getTime() / 1000),
        timestamp,
        open: parseFloat(item.Open),
        high: parseFloat(item.High),
        low: parseFloat(item.Low),
        close: parseFloat(item.Close),
        volume: parseFloat(item.Volume || 0)
      };
    }).sort((a, b) => a.time - b.time);

    setProcessedData({
      x: processedPoints.map(p => p.timestamp),
      close: processedPoints.map(p => p.close),
      high: processedPoints.map(p => p.high),
      low: processedPoints.map(p => p.low),
      open: processedPoints.map(p => p.open),
      volume: processedPoints.map(p => p.volume),
      points: processedPoints
    });
  }, [stockData]);

  // Initialize main chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: {
        borderVisible: false,
        autoScale: true,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 10,
      },
      crosshair: {
        vertLine: {
          color: '#758696',
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
        },
      },
    });

    chartRef.current = chart;

    return () => {
      chart.remove();
    };
  }, []);

  // Update chart series when data or type changes
  useEffect(() => {
    if (!chartRef.current || !processedData.points?.length) return;

    const chart = chartRef.current;

    // Clean up existing series
    if (priceSeriesRef.current) {
      chart.removeSeries(priceSeriesRef.current);
    }
    indicatorSeriesRef.current.forEach(series => {
      chart.removeSeries(series);
    });
    indicatorSeriesRef.current = [];

    // Create new series based on chart type
    let priceSeries;
    switch (chartType) {
      case 'Candles':
        priceSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        priceSeries.setData(processedData.points);
        break;

      case 'Bar':
        priceSeries = chart.addBarSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
        });
        priceSeries.setData(processedData.points);
        break;

      case 'Histogram':
        priceSeries = chart.addHistogramSeries({
          color: '#93C5FD',
        });
        priceSeries.setData(processedData.points.map(item => ({
          time: item.time,
          value: item.close,
        })));
        break;

      default: // Line
        priceSeries = chart.addLineSeries({
          color: '#2563eb',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
        });
        priceSeries.setData(processedData.points.map(item => ({
          time: item.time,
          value: item.close,
        })));
    }
    
    priceSeriesRef.current = priceSeries;

    // Add indicators if enabled
    if (showIndicators) {
      const highSeries = chart.addLineSeries({
        color: '#10B981',
        lineStyle: 2,
        lineWidth: 1,
      });
      
      const lowSeries = chart.addLineSeries({
        color: '#EF4444',
        lineStyle: 2,
        lineWidth: 1,
      });

      highSeries.setData(processedData.points.map(item => ({
        time: item.time,
        value: item.high,
      })));

      lowSeries.setData(processedData.points.map(item => ({
        time: item.time,
        value: item.low,
      })));

      indicatorSeriesRef.current = [highSeries, lowSeries];
    }

    // Set initial visible range
    const totalPoints = processedData.points.length;
    const visiblePoints = Math.floor(totalPoints * ((sliderState.range.end - sliderState.range.start) / 100));
    const firstVisibleIndex = Math.floor(totalPoints * (sliderState.range.start / 100));

    chart.timeScale().setVisibleLogicalRange({
      from: firstVisibleIndex,
      to: firstVisibleIndex + visiblePoints,
    });
  }, [processedData, chartType, showIndicators, sliderState.range]);

  // Timeline navigator drag handlers
  const handleDragStart = useCallback((e, handle) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSliderState(prev => ({
      ...prev,
      isDragging: true,
      activeHandle: handle,
      startX: clientX
    }));
  }, []);

  const handleDragMove = useCallback((e) => {
    if (!sliderState.isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const container = document.querySelector('.timeline-container');
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    const totalWidth = bounds.width;
    const newPercent = Math.max(0, Math.min(100, ((clientX - bounds.left) / totalWidth) * 100));

    setSliderState(prev => {
      const newRange = { ...prev.range };
      const rangeSize = prev.range.end - prev.range.start;
      const minRange = 5; // Minimum range size in percentage

      switch (prev.activeHandle) {
        case 'start':
          newRange.start = Math.max(0, Math.min(newRange.end - minRange, newPercent));
          break;
        case 'end':
          newRange.end = Math.min(100, Math.max(newRange.start + minRange, newPercent));
          break;
        case 'middle':
          const movement = newPercent - (prev.range.start + rangeSize / 2);
          newRange.start = Math.max(0, Math.min(100 - rangeSize, prev.range.start + movement));
          newRange.end = Math.min(100, newRange.start + rangeSize);
          break;
      }

      return { ...prev, range: newRange };
    });
  }, [sliderState.isDragging, sliderState.activeHandle]);

  const handleDragEnd = useCallback(() => {
    setSliderState(prev => ({
      ...prev,
      isDragging: false,
      activeHandle: null
    }));
  }, []);

  // Set up drag event listeners
  useEffect(() => {
    if (sliderState.isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [sliderState.isDragging, handleDragMove, handleDragEnd]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get timeline navigator chart data
  const getTimelineData = useCallback(() => {
    if (!processedData.x.length) return [];

    const traces = [];
    
    // Price trace
    switch (chartType) {
      case 'Candles':
        traces.push({
          type: 'candlestick',
          x: processedData.x,
          open: processedData.open,
          high: processedData.high,
          low: processedData.low,
          close: processedData.close,
          decreasing: { line: { color: '#ef4444' } },
          increasing: { line: { color: '#22c55e' } },
          name: 'Price',
          yaxis: 'y1'
        });
        break;
      default:
        traces.push({
          type: 'scatter',
          x: processedData.x,
          y: processedData.close,
          line: { color: '#93C5FD' },
          name: 'Price',
          yaxis: 'y1'
        });
    }

    // Volume trace
    traces.push({
      type: 'bar',
      x: processedData.x,
      y: processedData.volume,
      name: 'Volume',
      yaxis: 'y2',
      marker: {
        color: processedData.close.map((close, i) => 
          (i > 0 && close > processedData.close[i - 1]) ? '#22c55e40' : '#ef444440'
        )
      }
    });

    return traces;
  }, [processedData, chartType]);

  return (
    <div className="bg-white p-4 rounded-lg mb-4">
      {/* Main Chart */}
      <div ref={chartContainerRef} />
      
      {/* Timeline Navigator */}
      <div className="timeline-container relative bg-white rounded-lg shadow-sm p-4 mt-4" style={{ height: '140px' }}>
        <Plot
          data={getTimelineData()}
          layout={{
            height: 140,
            margin: { t: 0, r: 0, l: 0, b: 0 },
            xaxis: { 
              visible: false,
              rangeslider: { visible: false },
              type: 'date'
            },
            yaxis: { 
              visible: false, 
              fixedrange: true,
              domain: [0.3, 1]
            },
            yaxis2: {
              visible: false,
              fixedrange: true,
              domain: [0, 0.25]
            },
            showlegend: false,
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
            dragmode: false,
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Selection overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              to right,
              rgba(0, 0, 0, 0.3) 0%,
              rgba(0, 0, 0, 0.3) ${sliderState.range.start}%,
              transparent ${sliderState.range.start}%,
              transparent ${sliderState.range.end}%,
              rgba(0, 0, 0, 0.3) ${sliderState.range.end}%,
              rgba(0, 0, 0, 0.3) 100%
            )`
          }}
        />

        {/* Slider handles */}
        <div
          className="absolute top-0 bottom-0 cursor-ew-resize"
          style={{
            left: `${sliderState.range.start}%`,
            width: '4px',
            background: '#2563eb'
          }}
          onMouseDown={(e) => handleDragStart(e, 'start')}
          onTouchStart={(e) => handleDragStart(e, 'start')}
        />
        <div
          className="absolute top-0 bottom-0 cursor-move"
          style={{
            left: `${sliderState.range.start}%`,
            width: `${sliderState.range.end - sliderState.range.start}%`,
            background: 'transparent'
          }}
          onMouseDown={(e) => handleDragStart(e, 'middle')}
          onTouchStart={(e) => handleDragStart(e, 'middle')}
        />
        <div
          className="absolute top-0 bottom-0 cursor-ew-resize"
          style={{
            left: `${sliderState.range.end}%`,
            width: '4px',
            background: '#2563eb'
          }}
          onMouseDown={(e) => handleDragStart(e, 'end')}
          onTouchStart={(e) => handleDragStart(e, 'end')}
        />
      </div>
    </div>
  );
};

export default MainChart;   