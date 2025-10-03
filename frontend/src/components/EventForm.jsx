import { Upload } from 'lucide-react';

const EventForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        mediaEquipment: {
          ...(prev.metadata?.mediaEquipment || {}),
          [equipment]: !prev.metadata?.mediaEquipment?.[equipment]
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Event Details
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Name */}
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            id="eventName"
            name="eventName"
            type="text"
            required
            value={formData.metadata?.eventName || ''}
            onChange={handleChange}
            className="input"
            placeholder="Enter event name"
          />
        </div>

        {/* Ministry In Charge */}
        <div>
          <label htmlFor="ministryInCharge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ministry In charge <span className="text-red-500">*</span>
          </label>
          <input
            id="ministryInCharge"
            name="ministryInCharge"
            type="text"
            required
            value={formData.metadata?.ministryInCharge || ''}
            onChange={handleChange}
            className="input"
            placeholder="Enter ministry"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date */}
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            required
            value={formData.metadata?.eventDate || ''}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Online Registration Cost */}
        <div>
          <label htmlFor="registrationCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Online Registration cost: (If Applicable)
          </label>
          <input
            id="registrationCost"
            name="registrationCost"
            type="text"
            value={formData.metadata?.registrationCost || ''}
            onChange={handleChange}
            className="input"
            placeholder="Enter cost"
          />
        </div>
      </div>

      {/* Graphic Required */}
      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="graphicRequired"
            checked={formData.metadata?.graphicRequired || false}
            onChange={handleChange}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Graphic required
          </span>
        </label>
      </div>

      {/* Media Team Equipment Required */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Media team Equipment required?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['cameras', 'director', 'lyrics', 'sound'].map((equipment) => (
            <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.metadata?.mediaEquipment?.[equipment] || false}
                onChange={() => handleEquipmentChange(equipment)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {equipment}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Links/Documents after registration */}
      <div>
        <label htmlFor="linksDocuments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Links/documents after registration
        </label>
        <textarea
          id="linksDocuments"
          name="linksDocuments"
          rows={4}
          value={formData.metadata?.linksDocuments || ''}
          onChange={handleChange}
          className="input"
          placeholder="Enter any links or document references"
        />
      </div>

      {/* Upload Documents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload documents
        </label>
        <button
          type="button"
          onClick={() => alert('File upload feature coming soon!')}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Documents
        </button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          File upload functionality will be added soon
        </p>
      </div>
    </div>
  );
};

export default EventForm;

