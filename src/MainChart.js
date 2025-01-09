import React, { useRef, useEffect } from 'react';
import { createChart } from 'lightweight-charts';

const MainChart = ({ stockData, chartType, showIndicators }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

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
      height: 500,
    });

    // Add margin for better visibility
    chart.applyOptions({
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    
    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !stockData.length) return;

  
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    
    const formattedData = stockData.map(item => ({
      time: item.date,
      value: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    // Create appropriate series based on chart type
    let series;
    switch (chartType) {
      case 'Candles':
        series = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        break;
      case 'Bar':
        series = chartRef.current.addBarSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
        });
        break;
      case 'Coloured Bar':
        series = chartRef.current.addHistogramSeries({
          color: '#2563eb',
        });
        break;
      case 'Histogram':
        series = chartRef.current.addHistogramSeries({
          color: '#93C5FD',
        });
        break;
      case 'Vertex Line':
        series = chartRef.current.addLineSeries({
          color: '#2563eb',
          lineStyle: 1,
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
        });
        break;
      default: // Line
        series = chartRef.current.addLineSeries({
          color: '#2563eb',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
        });
    }

    
    series.setData(formattedData);
    seriesRef.current = series;

    
    chartRef.current.timeScale().fitContent();

    
    if (showIndicators) {
      const highSeries = chartRef.current.addLineSeries({
        color: '#10B981',
        lineStyle: 2,
        lineWidth: 1,
      });
      
      const lowSeries = chartRef.current.addLineSeries({
        color: '#EF4444',
        lineStyle: 2,
        lineWidth: 1,
      });

      highSeries.setData(formattedData.map(item => ({
        time: item.time,
        value: item.high,
      })));

      lowSeries.setData(formattedData.map(item => ({
        time: item.time,
        value: item.low,
      })));
    }
  }, [stockData, chartType, showIndicators]);


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

  return (
    <div className="bg-white p-4 rounded-lg mb-4">
      <div ref={chartContainerRef} />
    </div>
  );
};

export default MainChart;