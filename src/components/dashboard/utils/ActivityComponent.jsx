import {
  ClipboardListIcon,
  ChatAltIcon,
  BookOpenIcon,
  PencilAltIcon,
  StarIcon,
} from "@heroicons/react/solid"; // Adjust imports based on your needs

const activities = [
  {
    title: "Quick Eval",
    course: "Sample Course",
    badgeCount: 7,
    icon: <ClipboardListIcon className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Bonus Quiz",
    course: "Sample Course",
    badgeCount: 1,
    icon: <ChatAltIcon className="w-6 h-6 text-green-500" />,
  },
  {
    title: "Poem Draft Feedback Opportunity",
    course: "Sample Course",
    badgeCount: 1,
    icon: <BookOpenIcon className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "Poetry Assignment",
    course: "Sample Course",
    badgeCount: 1,
    icon: <PencilAltIcon className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Poetry Terms Quiz",
    course: "Sample Course",
    badgeCount: 1,
    icon: <StarIcon className="w-6 h-6 text-red-500" />,
  },
  {
    title: "Write Your First Review",
    course: "Sample Course",
    badgeCount: 0,
    icon: <PencilAltIcon className="w-6 h-6 text-yellow-500" />,
  },
];

const ActivitiesList = () => {
  return (
    <div className="bg-white p-4 shadow rounded-lg mt-6">
      <h2 className="font-semibold text-lg">Activities</h2>
      <ul className="mt-2  grid grid-cols-2 items-centers  gap-3">
        {activities.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-2 bg-gray-100 p-3 rounded-md shadow-sm h-fit"
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <div>
                <span className="text-gray-700 font-medium">{item.title}</span>
                <span className="block text-sm text-gray-500">
                  {item.course}
                </span>
              </div>
            </div>
            {item.badgeCount > 0 && (
              <span className="inline-block text-xs font-semibold text-white bg-blue-500 py-1 px-2 rounded-full">
                {item.badgeCount}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivitiesList;
