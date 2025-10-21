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

interface SearchResults {
  weather?: WeatherData;
  news?: NewsArticle[];
  crypto?: CryptoData[];
  currency?: CurrencyData;
  stock?: { symbol: string; price: number; change: number; changePercent: number };
}

class ExternalAPIClient {
  private static baseUrl = '/api';

  static async getWeather(location: string): Promise<WeatherData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/weather?location=${encodeURIComponent(location)}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Weather API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  static async getNews(topic: string = 'technology', limit: number = 5): Promise<NewsArticle[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/news?topic=${encodeURIComponent(topic)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching news data:', error);
      return [];
    }
  }

  static async getCryptoPrices(coins: string[] = ['bitcoin', 'ethereum']): Promise<CryptoData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crypto?coins=${coins.join(',')}`
      );

      if (!response.ok) {
        throw new Error(`Crypto API error: ${response.status}`);
      }

      const data = await response.json();
      return data.cryptocurrencies || [];
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return [];
    }
  }

  static async getExchangeRate(from: string, to: string = 'USD'): Promise<CurrencyData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/exchange?from=${from.toUpperCase()}&to=${to.toUpperCase()}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }
  }

  static async searchData(query: string): Promise<SearchResults> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching external data:', error);
      return {};
    }
  }

  // Helper method to format search results for display
  static formatSearchResults(results: SearchResults): string {
    let output = '';

    if (results.weather) {
      const weather = results.weather;
      output += `🌤️ **Weather in ${weather.location}**: ${weather.temperature}°C, ${weather.condition}\n`;
      output += `💧 Humidity: ${weather.humidity}% | 💨 Wind: ${weather.windSpeed} m/s\n\n`;
    }

    if (results.news && results.news.length > 0) {
      output += `📰 **Latest News**:\n`;
      results.news.slice(0, 3).forEach((article, index) => {
        output += `${index + 1}. ${article.title}\n   ${article.source} - ${article.publishedAt}\n`;
        if (article.description) {
          output += `   ${article.description.substring(0, 100)}...\n`;
        }
        output += `   🔗 ${article.url}\n\n`;
      });
    }

    if (results.crypto && results.crypto.length > 0) {
      output += `💰 **Cryptocurrency Prices**:\n`;
      results.crypto.forEach(crypto => {
        const changeEmoji = crypto.priceChangePercentage24h >= 0 ? '📈' : '📉';
        output += `${changeEmoji} ${crypto.name} (${crypto.symbol}): $${crypto.currentPrice.toFixed(2)}\n`;
        output += `   24h Change: ${crypto.priceChangePercentage24h.toFixed(2)}%\n\n`;
      });
    }

    if (results.currency) {
      const currency = results.currency;
      output += `💱 **Exchange Rate**: 1 ${currency.from} = ${currency.rate.toFixed(4)} ${currency.to}\n`;
      output += `Last updated: ${currency.lastUpdated}\n\n`;
    }

    if (results.stock) {
      const stock = results.stock;
      const changeEmoji = stock.change >= 0 ? '📈' : '📉';
      output += `📊 **Stock Price**: ${stock.symbol} - $${stock.price.toFixed(2)}\n`;
      output += `${changeEmoji} ${stock.change >= 0 ? '+' : ''}$${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)\n\n`;
    }

    return output.trim();
  }
}

export { ExternalAPIClient, type WeatherData, type NewsArticle, type CryptoData, type CurrencyData, type SearchResults };
