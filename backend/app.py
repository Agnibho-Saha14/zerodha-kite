from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://dgczzwpdvtfukltsbvjf.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_KEY or not SUPABASE_URL:
    raise ValueError("Supabase credentials are not properly set in the environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_timeframe_date(timeframe):
    end_date = datetime.now()
    timeframe_days = {
        '1D': 1,
        '5D': 5,
        '1M': 30,
        '3M': 90,
        '6M': 180,
        'YTD': (end_date - datetime(end_date.year, 1, 1)).days,
        '1Y': 365,
        '5Y': 1825
    }
    days = timeframe_days.get(timeframe, 30)  # Default to 30 days if timeframe is invalid
    start_date = end_date - timedelta(days=days)
    return start_date.date(), end_date.date()

@app.route('/api/stock-data', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('Symbol', '').strip().upper()
    timeframe = request.args.get('timeframe', '1M').strip()

    if not symbol:
        return jsonify({'error': 'Symbol parameter is required'}), 400

    if timeframe not in ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y']:
        return jsonify({'error': f"Invalid timeframe: {timeframe}. Valid options are 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y."}), 400

    start_date, end_date = get_timeframe_date(timeframe)

    try:
        # Log the query parameters
        print(f"Fetching data for symbol: {symbol}, timeframe: {timeframe}, start_date: {start_date}, end_date: {end_date}")

        response = supabase.table('CompaniesData') \
            .select('Date,Symbol,Open,High,Low,Close,Volume') \
            .eq('Symbol', symbol) \
            .gte('Date', start_date.isoformat()) \
            .lte('Date', end_date.isoformat()) \
            .order('Date') \
            .execute()

        if not response.data:
            return jsonify({'error': f'No data found for symbol {symbol}'}), 404

        formatted_data = []
        for row in response.data:
            try:
                formatted_data.append({
                    'date': row['Date'],
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume'])
                })
            except (ValueError, TypeError) as e:
                print(f"Error formatting row {row}: {str(e)}")
                continue

        return jsonify(formatted_data)

    except Exception as e:
        print(f"Error fetching stock data: {str(e)}")
        return jsonify({'error': 'Failed to fetch stock data'}), 500

@app.route('/api/available-symbols', methods=['GET'])
def get_available_symbols():
    try:
        # Fetch all symbols
        response = supabase.table('CompaniesData').select('Symbol').execute()

        print("Raw Response:", response.data)  # Debug: Log the response

        if not response.data:
            return jsonify({'error': 'No symbols found'}), 404

        # Extract distinct symbols and sort them
        symbols = sorted(list({item['Symbol'] for item in response.data}))
        return jsonify(symbols)

    except Exception as e:
        print(f"Error fetching available symbols: {str(e)}")
        return jsonify({'error': 'Failed to fetch available symbols'}), 500




@app.route('/api/stock-summary', methods=['GET'])
def get_stock_summary():
    symbol = request.args.get('Symbol', '').strip().upper()

    if not symbol:
        return jsonify({'error': 'Symbol parameter is required'}), 400

    try:
        print(f"Fetching summary for symbol: {symbol}")

        # Get the latest data
        latest_response = supabase.table('CompaniesData') \
            .select('Date,Open,High,Low,Close,Volume') \
            .eq('Symbol', symbol) \
            .order('Date', desc=True) \
            .limit(1) \
            .execute()

        if not latest_response.data:
            return jsonify({'error': f'No data found for symbol {symbol}'}), 404

        latest_data = latest_response.data[0]

        # Get the previous day's data
        prev_day_response = supabase.table('CompaniesData') \
            .select('Close') \
            .eq('Symbol', symbol) \
            .lt('Date', latest_data['Date']) \
            .order('Date', desc=True) \
            .limit(1) \
            .execute()

        prev_close = float(prev_day_response.data[0]['Close']) if prev_day_response.data else float(latest_data['Close'])
        latest_close = float(latest_data['Close'])

        daily_change = latest_close - prev_close
        daily_change_percent = (daily_change / prev_close) * 100 if prev_close != 0 else 0

        summary = {
            'symbol': symbol,
            'latest_price': latest_close,
            'daily_change': round(daily_change, 2),
            'daily_change_percent': round(daily_change_percent, 2),
            'day_high': float(latest_data['High']),
            'day_low': float(latest_data['Low']),
            'volume': int(latest_data['Volume'])
        }

        return jsonify(summary)

    except Exception as e:
        print(f"Error fetching stock summary: {str(e)}")
        return jsonify({'error': 'Failed to fetch stock summary'}), 500

if __name__ == '__main__':
    app.run(debug=True)
