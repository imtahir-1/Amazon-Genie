
import React from 'react';
import { ProductAnalysis } from '../types';

interface AnalysisViewProps {
  analysis: ProductAnalysis;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-in fade-in duration-700">
      <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Strategy Report</h2>
          <p className="text-gray-500 mt-1 font-medium">Data-driven analysis for {analysis.category}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Brand Aesthetic</h4>
            <p className="text-sm font-bold text-gray-900">{analysis.suggestedAesthetics}</p>
          </div>
          <div className="flex -space-x-2">
            {analysis.colorPalette.slice(0, 4).map((color, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-6">
          <section>
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Key Benefits</h4>
            <div className="space-y-2">
              {analysis.keyBenefits.map((benefit, i) => (
                <div key={i} className="flex items-center text-sm font-semibold text-gray-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                  <svg className="w-4 h-4 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>
          </section>

          {analysis.groundingSources && analysis.groundingSources.length > 0 && (
            <section className="mt-8">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Research Sources</h4>
              <div className="space-y-2">
                {analysis.groundingSources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-[11px] font-bold text-gray-500 hover:text-blue-600 bg-gray-50 p-2 rounded-lg border border-gray-100 transition-colors truncate"
                  >
                    <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    {source.title}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Market Context</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">Target Customer</p>
                <p className="text-sm font-bold text-gray-900">{analysis.targetCustomer}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">Tone & Voice</p>
                <p className="text-sm font-bold text-gray-900">{analysis.brandTone}</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Competitor Insights</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysis.competitorInsights}
            </p>
          </section>
          
          <div className="sm:col-span-2 mt-4 p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white">
            <div className="flex items-center mb-2">
              <span className="p-1 bg-blue-500 rounded mr-2">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </span>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Psychological Trigger Used</p>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">
              We've identified that your category relies heavily on <span className="text-blue-400 font-bold">visual proof of quality</span>. Your generated images will emphasize high-contrast closeups and material textures based on real-time competitor visual trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
