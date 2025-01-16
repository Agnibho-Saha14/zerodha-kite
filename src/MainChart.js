import React, { useRef, useEffect } from 'react';
import { createChart } from 'lightweight-charts';

const MainChart = ({ stockData, chartType, showIndicators }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Initialize the chart on first render
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

    chart.applyOptions({
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    return () => {
      chart.remove();
    };
  }, []);

  // Update the chart whenever stockData, chartType, or showIndicators changes
  useEffect(() => {
    if (!chartRef.current || !stockData || stockData.length === 0) {
      console.warn('No stock data available or chart not initialized.');
      return;
    }

    // Remove previous series if it exists
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    const getTimestamp = (dateStr) => {
      const [day, month, year] = dateStr.split('-').map(num => parseInt(num, 10));
      const date = new Date(year, month - 1, day, 12, 0, 0, 0);
      return Math.floor(date.getTime() / 1000);
    };

    // Process and deduplicate stock data
    const processedData = Object.values(
      stockData.reduce((acc, item) => {
        const timestamp = getTimestamp(item.Date);
        acc[timestamp] = {
          time: timestamp,
          value: parseFloat(item.Close),
          open: parseFloat(item.Open),
          high: parseFloat(item.High),
          low: parseFloat(item.Low),
          close: parseFloat(item.Close),
        };
        return acc;
      }, {})
    ).sort((a, b) => a.time - b.time);

    // Determine the series type and set data
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
          priceFormat: {
            type: 'price',
            precision: 2,
          },
        });
        break;
      case 'Histogram':
        series = chartRef.current.addHistogramSeries({
          color: '#93C5FD',
          priceFormat: {
            type: 'price',
            precision: 2,
          },
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

    // Set the data for the selected chart type
    series.setData(
      chartType === 'Candles' || chartType === 'Bar'
        ? processedData.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
        : processedData.map(item => ({
            time: item.time,
            value: item.close,
          }))
    );

    seriesRef.current = series;

    // Fit the chart to show all data points
    chartRef.current.timeScale().fitContent();

    // Add optional indicators if enabled
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

      highSeries.setData(processedData.map(item => ({ time: item.time, value: item.high })));
      lowSeries.setData(processedData.map(item => ({ time: item.time, value: item.low })));
    }
  }, [stockData, chartType, showIndicators]);

  // Handle chart resizing
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
