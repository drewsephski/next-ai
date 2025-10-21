interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface CryptoData {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

interface CurrencyData {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

class ExternalAPIService {
  private static readonly OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
  private static readonly NEWS_API_KEY = process.env.NEWS_API_KEY;
  private static readonly EXCHANGERATE_API_KEY = process.env.EXCHANGERATE_API_KEY;

  // Weather API - OpenWeatherMap (Free tier)
  static async getWeather(location: string): Promise<WeatherData | null> {
    try {
      if (!this.OPENWEATHER_API_KEY) {
        console.warn('OpenWeatherMap API key not configured');
        return null;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${this.OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  // News API - NewsAPI.org (Free tier: 100 requests/day)
  static async getNews(topic: string = 'technology', limit: number = 5): Promise<NewsArticle[]> {
    try {
      if (!this.NEWS_API_KEY) {
        console.warn('News API key not configured');
        return [];
      }

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${this.NEWS_API_KEY}&pageSize=${limit}&sortBy=publishedAt`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data: {
        articles: Array<{
          title: string;
          description: string;
          url: string;
          source: { name: string };
          publishedAt: string;
        }>;
      } = await response.json();

      return data.articles.map((article) => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt).toLocaleDateString(),
      }));
    } catch (error) {
      console.error('Error fetching news data:', error);
      return [];
    }
  }

  // Cryptocurrency API - CoinGecko (Free, no API key required)
  static async getCryptoPrices(coins: string[] = ['bitcoin', 'ethereum']): Promise<CryptoData[]> {
    try {
      const coinsParam = coins.join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinsParam}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`Crypto API error: ${response.status}`);
      }

      const data = await response.json();
      const result: CryptoData[] = [];

      for (const [coinId, priceData] of Object.entries(data)) {
        const coin: {
          usd: number;
          usd_24h_change?: number;
        } = priceData as {
          usd: number;
          usd_24h_change?: number;
        };
        result.push({
          symbol: coinId.toUpperCase(),
          name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
          currentPrice: coin.usd,
          priceChange24h: coin.usd_24h_change || 0,
          priceChangePercentage24h: coin.usd_24h_change || 0,
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return [];
    }
  }

  // Currency Exchange API - ExchangeRate-API (Free tier)
  static async getExchangeRate(from: string, to: string = 'USD'): Promise<CurrencyData | null> {
    try {
      if (!this.EXCHANGERATE_API_KEY) {
        console.warn('ExchangeRate API key not configured');
        return null;
      }

      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${this.EXCHANGERATE_API_KEY}/pair/${from}/${to}`
      );

      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        from,
        to,
        rate: data.conversion_rate,
        lastUpdated: new Date(data.time_last_updated * 1000).toLocaleDateString(),
      };
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }
  }

  // Stock Market Data - Alpha Vantage (Free tier: 5 requests/min, 100/day)
  static async getStockPrice(symbol: string): Promise<{ symbol: string; price: number; change: number; changePercent: number } | null> {
    try {
      const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!alphaVantageKey) {
        console.warn('Alpha Vantage API key not configured');
        return null;
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
      );

      if (!response.ok) {
        throw new Error(`Stock API error: ${response.status}`);
      }

      const data = await response.json();

      if (data['Global Quote']) {
        const quote: {
          '01. symbol': string;
          '05. price': string;
          '09. change': string;
          '10. change percent': string;
        } = data['Global Quote'];
        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  }

  // Generic search function that determines which API to use based on query
  static async searchData(query: string): Promise<{
    weather?: WeatherData;
    news?: NewsArticle[];
    crypto?: CryptoData[];
    currency?: CurrencyData;
    stock?: { symbol: string; price: number; change: number; changePercent: number };
  }> {
    const result: {
      weather?: WeatherData;
      news?: NewsArticle[];
      crypto?: CryptoData[];
      currency?: CurrencyData;
      stock?: { symbol: string; price: number; change: number; changePercent: number };
    } = {};

    // Check if query is weather-related
    if (query.match(/\b(weather|temperature|forecast|rain|sunny|cloudy)\b/i)) {
      const locationMatch = query.match(/(?:weather|temperature)\s+(?:in|for|at)\s+([A-Za-z\s,]+)/i);
      if (locationMatch) {
        const weather = await this.getWeather(locationMatch[1].trim());
        if (weather) result.weather = weather;
      }
    }

    // Check if query is news-related
    if (query.match(/\b(news|latest|headlines|articles)\b/i)) {
      const topicMatch = query.match(/(?:news|latest)\s+(?:about|on)\s+([A-Za-z\s]+)/i);
      const news = await this.getNews(topicMatch ? topicMatch[1].trim() : 'technology');
      if (news.length > 0) result.news = news;
    }

    // Check if query is crypto-related
    if (query.match(/\b(bitcoin|ethereum|crypto|cryptocurrency|price|btc|eth)\b/i)) {
      const cryptoMatch = query.match(/\b(bitcoin|btc|ethereum|eth|crypto|cryptocurrency)\b/gi);
      if (cryptoMatch) {
        const coins = cryptoMatch.slice(0, 3); // Limit to 3 coins for free tier
        const crypto = await this.getCryptoPrices(coins);
        if (crypto.length > 0) result.crypto = crypto;
      }
    }

    // Check if query is currency-related
    if (query.match(/\b(exchange|rate|convert|currency)\s+\w+\s+to\s+\w+/i)) {
      const currencyMatch = query.match(/(\w+)\s+to\s+(\w+)/i);
      if (currencyMatch) {
        const currency = await this.getExchangeRate(currencyMatch[1].toUpperCase(), currencyMatch[2].toUpperCase());
        if (currency) result.currency = currency;
      }
    }

    // Check if query is stock-related
    if (query.match(/\b(stock|price|share)\s+([A-Z]{1,5})\b/i)) {
      const stockMatch = query.match(/\b(stock|price|share)\s+([A-Z]{1,5})\b/i);
      if (stockMatch) {
        const stock = await this.getStockPrice(stockMatch[2]);
        if (stock) result.stock = stock;
      }
    }

    return result;
  }
}

export { ExternalAPIService, type WeatherData, type NewsArticle, type CryptoData, type CurrencyData };
