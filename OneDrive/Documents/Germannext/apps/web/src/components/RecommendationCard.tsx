import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecommendationItem } from '@educaro/shared';
import { AlertCircle, CheckCircle2, ChevronRight, Info, MessageSquare, ShieldCheck } from 'lucide-react';

interface Props {
  recommendation: RecommendationItem;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export const RecommendationCard: React.FC<Props> = ({ recommendation, onStatusChange }) => {
  const navigate = useNavigate();
  const [showWhy, setShowWhy] = useState(false);

  const isRequired = recommendation.priority === 'REQUIRED';
  const isImportant = recommendation.priority === 'IMPORTANT';

  const priorityColors = isRequired 
    ? 'border-l-red-500 bg-red-50 text-red-800' 
    : isImportant 
      ? 'border-l-yellow-400 bg-yellow-50 text-yellow-800' 
      : 'border-l-blue-400 bg-blue-50 text-blue-800';

  const handleAction = () => {
    if (recommendation.actionRoute) {
      navigate(recommendation.actionRoute);
    }
  };

  const handleAskAI = () => {
    navigate(`/journey/chat?context=${encodeURIComponent(recommendation.title)}&recId=${recommendation.id}`);
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-shadow hover:shadow-md border-l-4 ${priorityColors.split(' ')[0]}`}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors.split(' ').slice(1).join(' ')}`}>
              {recommendation.priority}
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              {recommendation.type.replace('_', ' ')}
            </span>
          </div>
          {recommendation.status === 'completed' && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 mb-1">{recommendation.title}</h4>
        <p className="text-sm text-gray-600 mb-4">{recommendation.description}</p>

        {showWhy && recommendation.whyExplanation && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900 flex items-start">
            <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-indigo-600" />
            <p>{recommendation.whyExplanation}</p>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowWhy(!showWhy)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <Info className="w-4 h-4 mr-1" />
            {showWhy ? 'Hide explanation' : 'Why this recommendation?'}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleAskAI}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
          Ask AI
        </button>
        
        <button
          onClick={handleAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {recommendation.actionLabel || 'Take Action'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
