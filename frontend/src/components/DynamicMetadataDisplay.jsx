import { CheckCircle, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';

const DynamicMetadataDisplay = ({ metadata, schema }) => {
  if (!metadata || Object.keys(metadata).length === 0 || !schema || schema.length === 0) {
    return null;
  }

  const renderFieldValue = (field) => {
    const value = metadata[field.id];
    
    if (value === undefined || value === null || value === '') {
      return null;
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <div key={field.id}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {field.label}
            </p>
            <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
              {value}
            </p>
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {field.label}
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {value}
            </span>
          </div>
        );

      case 'date':
        return (
          <div key={field.id}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {field.label}
            </p>
            <p className="text-base text-gray-900 dark:text-white">
              {(() => {
                try {
                  const date = new Date(value);
                  return isNaN(date.getTime()) ? value : format(date, 'MMMM d, yyyy');
                } catch (error) {
                  return value;
                }
              })()}
            </p>
          </div>
        );

      case 'checkbox':
        if (!value) return null;
        return (
          <div key={field.id} className="flex items-center space-x-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{field.label}</span>
          </div>
        );

      case 'file':
        return (
          <div key={field.id}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {field.label}
            </p>
            <p className="text-base text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
        );

      case 'paragraph':
        // Paragraphs are info text, not data to display
        return null;

      default:
        return null;
    }
  };

  const fieldsToDisplay = schema.filter(field => {
    const value = metadata[field.id];
    return value !== undefined && value !== null && value !== '' && field.type !== 'paragraph';
  });

  if (fieldsToDisplay.length === 0) {
    return null;
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Additional Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schema.map(field => renderFieldValue(field)).filter(Boolean)}
      </div>
    </div>
  );
};

export default DynamicMetadataDisplay;

