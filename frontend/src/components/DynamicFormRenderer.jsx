import { Upload } from 'lucide-react';

const DynamicFormRenderer = ({ schema, formData, setFormData }) => {
  const handleChange = (fieldId, value, type) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [fieldId]: type === 'checkbox' ? value : value
      }
    }));
  };

  const renderField = (field) => {
    const value = formData.metadata?.[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={field.id}
              type="text"
              required={field.required}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value, 'text')}
              className="input"
              placeholder={field.placeholder || ''}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={field.id}
              required={field.required}
              rows={4}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value, 'textarea')}
              className="input"
              placeholder={field.placeholder || ''}
            />
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={field.id}
              required={field.required}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value, 'dropdown')}
              className="input"
            >
              <option value="">Select an option</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'date':
        return (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={field.id}
              type="date"
              required={field.required}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value, 'date')}
              className="input"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id}>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleChange(field.id, e.target.checked, 'checkbox')}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
          </div>
        );

      case 'file':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <button
              type="button"
              onClick={() => alert('File upload feature coming soon!')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload {field.label}
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              File upload functionality will be added soon
            </p>
          </div>
        );

      case 'paragraph':
        return (
          <div key={field.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {field.label}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (!schema || schema.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Information
        </h3>
      </div>
      {schema.map(field => renderField(field))}
    </div>
  );
};

export default DynamicFormRenderer;

