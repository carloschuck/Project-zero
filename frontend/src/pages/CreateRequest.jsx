import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { requestsApi, categoriesApi, attachmentsApi } from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';
import EventForm from '../components/EventForm';
import DynamicFormRenderer from '../components/DynamicFormRenderer';

const CreateRequest = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    subject: '',
    description: '',
    priority: 'medium',
    metadata: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Auto-generate subject for Events if not provided
      const submitData = { ...formData };
      if (isEventCategory() && !submitData.subject) {
        submitData.subject = formData.metadata?.eventName 
          ? `Event: ${formData.metadata.eventName}` 
          : 'New Event Request';
      }

      // Filter out file fields from metadata before sending to API
      // Files will be uploaded separately after request creation
      const fileFields = selectedCategory?.form_schema?.filter(field => field.type === 'file') || [];
      const metadataWithoutFiles = { ...submitData.metadata };
      
      for (const field of fileFields) {
        delete metadataWithoutFiles[field.id];
      }
      
      submitData.metadata = metadataWithoutFiles;

      const response = await requestsApi.create(submitData);
      
      // Handle file uploads if present in metadata
      const ticketId = response.data.request.id;
      
      for (const field of fileFields) {
        const files = formData.metadata?.[field.id];
        if (files && files.length > 0) {
          for (const file of files) {
            try {
              await attachmentsApi.upload(ticketId, file);
            } catch (uploadError) {
              console.error('Failed to upload file:', file.name, uploadError);
            }
          }
        }
      }

      navigate(`/requests/${ticketId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Update selected category when category changes
    if (name === 'categoryId') {
      const category = categories.find(c => c.id === value);
      setSelectedCategory(category);
      // Reset metadata when changing category
      setFormData(prev => ({ ...prev, metadata: {} }));
    }
  };

  // Helper to check if current category is Events (legacy)
  const isEventCategory = () => {
    return selectedCategory?.name?.toLowerCase() === 'events' && !hasCustomForm();
  };

  // Helper to check if category has custom form
  const hasCustomForm = () => {
    return selectedCategory?.form_schema && selectedCategory.form_schema.length > 0;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Request
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fill out the form below to submit a new support request
          </p>
        </div>

        {/* Form */}
        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Show Custom Form, Event Form, or Standard Form based on category */}
            {hasCustomForm() ? (
              <>
                {/* Subject for custom forms */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    maxLength={255}
                    value={formData.subject}
                    onChange={handleChange}
                    className="input"
                    placeholder="Brief description of your request"
                  />
                </div>

                {/* Dynamic custom form fields */}
                <DynamicFormRenderer 
                  schema={selectedCategory.form_schema} 
                  formData={formData} 
                  setFormData={setFormData} 
                />

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                    placeholder="Provide detailed information about your request..."
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please include as much detail as possible to help us assist you better.
                  </p>
                </div>
              </>
            ) : isEventCategory() ? (
              <>
                <EventForm formData={formData} setFormData={setFormData} />
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                    placeholder="Detailed description of your request/changes"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please include as much detail as possible to help us assist you better.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    maxLength={255}
                    value={formData.subject}
                    onChange={handleChange}
                    className="input"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={8}
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                    placeholder="Provide detailed information about your request..."
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please include as much detail as possible to help us assist you better.
                  </p>
                </div>
              </>
            )}

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRequest;


