import { Calendar, DollarSign, Image, Video, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const EventMetadataDisplay = ({ metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  const equipmentList = metadata.mediaEquipment ? 
    Object.entries(metadata.mediaEquipment)
      .filter(([_, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
    : [];

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Event Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Event Name */}
        {metadata.eventName && (
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Event Name</p>
            <p className="text-base text-gray-900 dark:text-white font-semibold">{metadata.eventName}</p>
          </div>
        )}

        {/* Ministry In Charge */}
        {metadata.ministryInCharge && (
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ministry In Charge</p>
            <p className="text-base text-gray-900 dark:text-white">{metadata.ministryInCharge}</p>
          </div>
        )}

        {/* Event Date */}
        {metadata.eventDate && (
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Event Date</p>
            <p className="text-base text-gray-900 dark:text-white">
              {format(new Date(metadata.eventDate), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {/* Registration Cost */}
        {metadata.registrationCost && (
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Online Registration Cost
            </p>
            <p className="text-base text-gray-900 dark:text-white">{metadata.registrationCost}</p>
          </div>
        )}
      </div>

      {/* Graphic Required */}
      {metadata.graphicRequired && (
        <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
          <Image className="w-5 h-5" />
          <span className="font-medium">Graphic Required</span>
          <CheckCircle className="w-4 h-4" />
        </div>
      )}

      {/* Media Equipment */}
      {equipmentList.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center mb-2">
            <Video className="w-4 h-4 mr-1" />
            Media Team Equipment Required
          </p>
          <div className="flex flex-wrap gap-2">
            {equipmentList.map((equipment) => (
              <span
                key={equipment}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
              >
                {equipment}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links/Documents */}
      {metadata.linksDocuments && (
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Links/Documents After Registration
          </p>
          <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
            {metadata.linksDocuments}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventMetadataDisplay;

