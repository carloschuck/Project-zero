import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Type, AlignLeft, Calendar, CheckSquare, Upload, FileText } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'textarea', label: 'Text Area', icon: AlignLeft },
  { value: 'dropdown', label: 'Dropdown Selection', icon: FileText },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'file', label: 'Upload File', icon: Upload },
  { value: 'paragraph', label: 'Paragraph (Info Text)', icon: FileText },
];

const FormBuilder = ({ schema, onChange }) => {
  const [fields, setFields] = useState(schema || []);
  const [editingField, setEditingField] = useState(null);
  const [showAddField, setShowAddField] = useState(false);

  const handleAddField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: '',
      placeholder: '',
      required: false,
      options: type === 'dropdown' ? ['Option 1'] : [],
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onChange(updatedFields);
    setEditingField(newField.id);
    setShowAddField(false);
  };

  const handleUpdateField = (id, updates) => {
    const updatedFields = fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const handleDeleteField = (id) => {
    const updatedFields = fields.filter(field => field.id !== id);
    setFields(updatedFields);
    onChange(updatedFields);
    setEditingField(null);
  };

  const handleMoveField = (index, direction) => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
    onChange(newFields);
  };

  const handleAddOption = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    const updatedOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    handleUpdateField(fieldId, { options: updatedOptions });
  };

  const handleUpdateOption = (fieldId, optionIndex, value) => {
    const field = fields.find(f => f.id === fieldId);
    const updatedOptions = [...field.options];
    updatedOptions[optionIndex] = value;
    handleUpdateField(fieldId, { options: updatedOptions });
  };

  const handleDeleteOption = (fieldId, optionIndex) => {
    const field = fields.find(f => f.id === fieldId);
    const updatedOptions = field.options.filter((_, i) => i !== optionIndex);
    handleUpdateField(fieldId, { options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Form Fields
        </h3>
        <button
          type="button"
          onClick={() => setShowAddField(!showAddField)}
          className="btn-primary flex items-center text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Field
        </button>
      </div>

      {/* Add Field Type Selector */}
      {showAddField && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
          {FIELD_TYPES.map((fieldType) => {
            const Icon = fieldType.icon;
            return (
              <button
                key={fieldType.value}
                type="button"
                onClick={() => handleAddField(fieldType.value)}
                className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-500 transition-colors"
              >
                <Icon className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-center text-gray-700 dark:text-gray-300">
                  {fieldType.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Fields List */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">
              No fields added yet. Click "Add Field" to get started.
            </p>
          </div>
        ) : (
          fields.map((field, index) => {
            const fieldType = FIELD_TYPES.find(ft => ft.type === field.type);
            const Icon = fieldType?.icon || Type;
            const isEditing = editingField === field.id;

            return (
              <div
                key={field.id}
                className={`border rounded-lg p-4 ${
                  isEditing
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      type="button"
                      onClick={() => handleMoveField(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => handleMoveField(index, 'down')}
                      disabled={index === fields.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Field Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {fieldType?.label || field.type}
                      </span>
                      {!isEditing && field.label && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          - {field.label}
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        {/* Label */}
                        {field.type !== 'paragraph' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Label {field.type !== 'checkbox' && '*'}
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                              className="input text-sm"
                              placeholder="Enter field label"
                            />
                          </div>
                        )}

                        {/* Placeholder - for text inputs and textareas */}
                        {(field.type === 'text' || field.type === 'textarea') && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Placeholder Text
                            </label>
                            <input
                              type="text"
                              value={field.placeholder}
                              onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                              className="input text-sm"
                              placeholder="Enter placeholder text"
                            />
                          </div>
                        )}

                        {/* Paragraph Content */}
                        {field.type === 'paragraph' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Paragraph Text/Instructions
                            </label>
                            <textarea
                              value={field.label}
                              onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                              rows={3}
                              className="input text-sm"
                              placeholder="Enter informational text or instructions"
                            />
                          </div>
                        )}

                        {/* Dropdown Options */}
                        {field.type === 'dropdown' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Options
                            </label>
                            <div className="space-y-2">
                              {field.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleUpdateOption(field.id, optIndex, e.target.value)}
                                    className="input text-sm flex-1"
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOption(field.id, optIndex)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded"
                                    disabled={field.options.length <= 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleAddOption(field.id)}
                                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Required Checkbox */}
                        {field.type !== 'paragraph' && (
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Required field
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {field.label || '(No label set)'}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingField(isEditing ? null : field.id)}
                      className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded"
                    >
                      {isEditing ? 'Done' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded"
                      title="Delete field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FormBuilder;

