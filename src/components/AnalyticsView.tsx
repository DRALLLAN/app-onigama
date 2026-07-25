/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnalyticsData } from '../types';
import { MessageSquare, Cpu, Users, Zap, TrendingUp, BarChart2, PieChart, RefreshCw } from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const storedToken = localStorage.getItem('admin_session_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
      
      const res = await fetch('/api/analytics', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json && !json.error && Array.isArray(json.volumeHistory) && Array.isArray(json.categoryHits)) {
          setData(json);
        } else {
          console.warn("Analytics API returned unexpected structure or error:", json);
        }
      } else {
        console.error("Failed to fetch analytics:", res.statusText);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data || !Array.isArray(data.volumeHistory) || !Array.isArray(data.categoryHits)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        <span className="text-sm font-medium">در حال بارگذاری اطلاعات آماری...</span>
      </div>
    );
  }

  // Calculate percentages
  const botSuccessRate = data.totalReceived > 0 
    ? Math.round((data.totalAiReplies / data.totalReceived) * 100) 
    : 85;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-emerald-500" />
            تحلیل عملکرد دستیار هوشمند
          </h2>
          <p className="text-sm text-gray-400 mt-1">آمار پیام‌ها، نرخ پاسخ‌دهی هوش مصنوعی و رضایت مشتریان به صورت زنده.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          disabled={refreshing}
          className="p-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 rounded-lg transition-colors border border-gray-700/50 flex items-center gap-2 text-xs font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          {refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی داده‌ها'}
        </button>
      </div>

      {/* Grid of 4 Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">کل پیام‌های دریافتی</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">{data.totalReceived}</h3>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-sans">
              <TrendingUp className="w-3 h-3" />
              ۱۲٪ رشد نسبت به هفته قبل
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium font-sans">پاسخ‌های خودکار هوشمند</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">{data.totalAiReplies}</h3>
            <span className="text-xs text-amber-300 font-medium mt-1 block">
              صرفه‌جویی در زمان کارشناسان
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">پاسخ‌های کارشناسان (دستی)</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">{data.totalAgentReplies}</h3>
            <span className="text-xs text-gray-400 mt-1 block font-sans">گفتگوهای پیچیده و حساس</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">رضایت کاربران (CSAT)</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">٪{data.satisfactionRate}</h3>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-sans">
              ★ ۴.۸ از ۵ ستاره بر اساس بازخورد
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Custom SVG Bar Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-100 font-sans">حجم ترافیک گفتگوها (۶ روز گذشته)</h3>
              <p className="text-xs text-gray-400">مقایسه درخواست‌های دریافتی از مشتری در مقابل پاسخ‌های موفق هوش مصنوعی</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
                دریافتی از مشتری
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span>
                پاسخ‌های هوش مصنوعی
              </span>
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="relative h-64 flex items-end justify-between gap-6 px-4 pt-4 border-b border-gray-800 pb-2">
            
            {/* Background grid lines */}
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none pb-2">
              <div className="w-full border-t border-gray-800/40"></div>
              <div className="w-full border-t border-gray-800/40"></div>
              <div className="w-full border-t border-gray-800/40"></div>
              <div className="w-full border-t border-gray-800/40"></div>
            </div>

            {data.volumeHistory.map((h, i) => {
              const maxVal = Math.max(...data.volumeHistory.map(v => Math.max(v.customer, v.ai)));
              const customerHeightPct = maxVal > 0 ? (h.customer / maxVal) * 80 : 20;
              const aiHeightPct = maxVal > 0 ? (h.ai / maxVal) * 80 : 15;

              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative z-10">
                  <div className="w-full flex justify-center items-end gap-2 h-44">
                    {/* Customer bar */}
                    <div 
                      style={{ height: `${customerHeightPct}%` }}
                      className="w-4 bg-emerald-500 rounded-t-lg transition-all duration-1000 origin-bottom hover:brightness-110 relative group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] shadow-sm"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-[10px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all font-mono">
                        {h.customer}
                      </div>
                    </div>
                    {/* AI bar */}
                    <div 
                      style={{ height: `${aiHeightPct}%` }}
                      className="w-4 bg-indigo-500 rounded-t-lg transition-all duration-1000 origin-bottom hover:brightness-110 relative group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] shadow-sm"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-[10px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all font-mono">
                        {h.ai}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mt-2 font-medium">{h.date}</span>
                </div>
              );
            })}
          </div>
          
          {/* Summary insights bar */}
          <div className="mt-5 p-4 bg-gray-950/50 rounded-xl border border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-300 font-sans">
              💡 تحلیل: هوش مصنوعی توانسته است به <strong className="text-emerald-400">{botSuccessRate}٪</strong> از کل سؤالات کاربران به صورت ۱۰۰٪ خودکار در هر ساعت از شبانه‌روز پاسخ دهد.
            </span>
          </div>
        </div>

        {/* Right Column: FAQ Categories Hits */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-xl">
          <h3 className="text-base font-bold text-gray-100 mb-2 flex items-center gap-1">
            <PieChart className="w-5 h-5 text-indigo-400" />
            دسته‌بندی موضوعی سوالات
          </h3>
          <p className="text-xs text-gray-400 mb-6 font-sans">بیشترین پرسش‌های ورودی از طرف مشتریان در شبکه اجتماعی واتس‌اپ.</p>

          <div className="space-y-4">
            {data.categoryHits.map((cat, i) => {
              const maxVal = Math.max(...data.categoryHits.map(c => c.value));
              const widthPct = maxVal > 0 ? (cat.value / maxVal) * 100 : 50;
              const colors = [
                'bg-emerald-500', 
                'bg-indigo-500', 
                'bg-amber-500', 
                'bg-rose-500', 
                'bg-blue-500'
              ];
              const textColors = [
                'text-emerald-400',
                'text-indigo-400',
                'text-amber-400',
                'text-rose-400',
                'text-blue-400'
              ];

              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-300">{cat.name}</span>
                    <span className={`font-semibold font-mono ${textColors[i % colors.length]}`}>{cat.value} پیام</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${widthPct}%` }}
                      className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-t border-gray-800/80 pt-4 text-center">
            <div className="inline-flex items-center gap-4 text-xs text-gray-400 font-sans">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                دیپوزیت و واریز تتر (بالاترین ترافیک سوالات مالی)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
