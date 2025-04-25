export default function ScheduleTable({
  scheduleData,
}: {
  scheduleData: ScheduleDay[];
}) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Prescription Schedule
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-3 px-4 text-left font-semibold text-blue-800">
                Date
              </th>
              <th className="py-3 px-4 text-left font-semibold text-blue-800">
                Dose (mL)
              </th>
              <th className="py-3 px-4 text-left font-semibold text-blue-800">
                Available For Pickup
              </th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((day) => (
              <tr
                key={day.index}
                className={`border-b hover:bg-gray-50 ${
                  day.pickup ? 'bg-green-50' : ''
                }`}
              >
                <td className="py-3 px-4 text-gray-700">
                  {formatDate(day.date)}
                </td>
                <td className="py-3 px-4 text-gray-700 font-semibold">
                  {day.dose} mL
                </td>
                <td className="py-3 px-4">
                  {day.pickup ? (
                    <div className="flex items-center text-green-600 font-medium">
                      <span>Yes</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
