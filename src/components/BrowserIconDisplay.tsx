import type React from 'react';
import { useState } from 'react';

interface BrowserIconDisplayProps {
  iconDataUrl?: string;
  browserName: string;
}

export const BrowserIconDisplay: React.FC<BrowserIconDisplayProps> = ({ iconDataUrl, browserName }) => {
  const [loadError, setLoadError] = useState(false);

  // Generate a simple placeholder based on the first letter
  const placeholder = browserName?.charAt(0)?.toUpperCase() || '?';

  const handleError = () => {
    setLoadError(true);
    console.warn(`Failed to load icon for ${browserName}, using text fallback.`);
  };

  if (iconDataUrl && !loadError) {
    return (
      <img
        src={iconDataUrl}
        alt={`${browserName} icon`}
        className="h-6 w-6 object-contain flex-shrink-0"
        onError={handleError}
      />
    );
  }
  // Removed the redundant `else` 
  const bgColor = 'bg-gray-200 dark:bg-gray-600'; // Simple gray fallback
  const textColor = 'text-gray-700 dark:text-gray-200';
  return (
    <div 
      className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center ${bgColor} ${textColor}`}
      title={browserName} // Show full name on hover
     >
      <span className="text-xs font-medium">{placeholder}</span>
    </div>
  );
}; 