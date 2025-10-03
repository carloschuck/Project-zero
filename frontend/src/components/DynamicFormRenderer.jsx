import { Upload, X, Paperclip } from 'lucide-react';

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

  const handleFileChange = (fieldId, e) => {
    const selectedFiles = Array.from(e.target.files);
    const existingFiles = formData.metadata?.[fieldId] || [];
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [fieldId]: [...existingFiles, ...selectedFiles]
      }
    }));
  };

  const removeFile = (fieldId, fileIndex) => {
    const files = formData.metadata?.[fieldId] || [];
    const updatedFiles = files.filter((_, index) => index !== fileIndex);
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [fieldId]: updatedFiles
      }
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        const files = formData.metadata?.[field.id] || [];
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {field.placeholder || 'PDF, Word, Excel, Images, ZIP (Max 5MB)'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    required={field.required && files.length === 0}
                    onChange={(e) => handleFileChange(field.id, e)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.zip"
                  />
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(field.id, index)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

