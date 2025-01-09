
export const generateMockData = (symbol, days = 30) => {
    const data = [];
    const basePrice = getBasePrice(symbol);
    const volatility = getVolatility(symbol);
    let price = basePrice;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const open = price + (Math.random() - 0.5) * volatility;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
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
  
  
  const getBasePrice = (symbol) => {
    const prices = {
      'AAPL': 180,
      'MSFT': 320,
      'AMZN': 130,
      'TSLA': 250,
      'META': 290,
      'NVDA': 420,
      'TCS': 3500,
      'INFY': 1500,
      'JPM': 140,
      'GOOGL': 140
    };
    return prices[symbol] || 100;
  };
  
  const getVolatility = (symbol) => {
    const volatility = {
      'TSLA': 8,  
      'NVDA': 6,
      'META': 5,
      'AAPL': 3,
      'MSFT': 3,
      'AMZN': 4,
      'TCS': 40,
      'INFY': 20,
      'JPM': 2,
      'GOOGL': 3
    };
    return volatility[symbol] || 2;
  };
  
  
  export const getCompanyInfo = (symbol) => {
    const companyInfo = {
      'AAPL': { name: 'Apple Inc.', sector: 'Technology' },
      'MSFT': { name: 'Microsoft Corporation', sector: 'Technology' },
      'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
      'TSLA': { name: 'Tesla, Inc.', sector: 'Automotive' },
      'META': { name: 'Meta Platforms Inc.', sector: 'Technology' },
      'NVDA': { name: 'NVIDIA Corporation', sector: 'Technology' },
      'TCS': { name: 'Tata Consultancy Services', sector: 'Technology' },
      'INFY': { name: 'Infosys Limited', sector: 'Technology' },
      'JPM': { name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
      'GOOGL': { name: 'Alphabet Inc.', sector: 'Technology' }
    };
    return companyInfo[symbol] || { name: symbol, sector: 'Unknown' };
  };
  
export {  getBasePrice, getVolatility };