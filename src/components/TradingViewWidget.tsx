import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  interval: string; // "1" | "5" | "15" | "60" | "240" | "D"
}

export const TradingViewWidget = memo(function TradingViewWidget({ symbol, interval }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous widget elements
    containerRef.current.innerHTML = '';

    // Create a unique widget container
    const widgetDiv = document.createElement('div');
    const uniqueId = `tv-advanced-widget-${Math.random().toString(36).substring(2, 9)}`;
    widgetDiv.id = uniqueId;
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    containerRef.current.appendChild(widgetDiv);

    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    // Configuration payload
    const widgetConfig = {
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1', // Candlesticks
      locale: 'en',
      enable_publishing: false,
      hide_side_toolbar: false, // Let them draw support/resistance lines!
      allow_symbol_change: false, // Keep locked to selected asset in page
      calendar: false,
      studies: [],
      support_host: 'https://www.tradingview.com'
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    widgetDiv.appendChild(script);

    return () => {
      // Cleanup on unmount or prop change
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '340px' }}>
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-2xl overflow-hidden border border-white/5 bg-slate-950/40"
        style={{ height: '340px' }} 
      />
    </div>
  );
});
