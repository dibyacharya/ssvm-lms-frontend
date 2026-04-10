import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Video, Search, Filter, PlayCircle, FileText, Download, Trash2
} from 'lucide-react';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { getVconfMeetings, deleteVconfRecording, getVconfRecordingStream } from '../../services/vconf.service';
import { useAuth } from '../../context/AuthContext';

function VconfRecordings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [, setLoading] = useState(true);

  // Fetch completed recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const allMeetings = await getVconfMeetings();
        // Filter for ended meetings which serve as our recordings
        const ended = allMeetings.filter((m) => m.status === 'ended');
        setRecordings(ended);
      } catch (e) {
        console.error("Failed to fetch recordings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  const filteredRecordings = recordings.filter(rec =>
    (filter === 'All' || rec.mode === filter.toLowerCase()) &&
    rec.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const mins = differenceInMinutes(endDate, startDate);
    const secs = differenceInSeconds(endDate, startDate) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recordings Library</h1>
          <p className="text-gray-500">Access past lectures and meeting archives.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search recordings..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white/40"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecordings.map((rec) => (
          <div key={rec.id} className="bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200 shadow-card-sm overflow-hidden hover:shadow-card-sm transition-shadow group">
            <div className="relative h-40 bg-white flex items-center justify-center group-hover:bg-white transition-colors">
              <PlayCircle size={48} className="text-gray-900 opacity-80 group-hover:scale-110 transition-transform cursor-pointer" onClick={() => navigate(`/vconf/recording/${rec.id}`)} />
              <div className="absolute top-3 right-3 px-2 py-1 bg-gray-50/20 backdrop-blur-sm rounded text-xs text-gray-900 font-medium">
                {getDuration(rec.started_at, rec.ended_at)}
              </div>
              <div className="absolute bottom-3 left-3 flex space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rec.mode === 'hybrid' ? 'bg-primary-600 text-gray-900' :
                  rec.mode === 'offline' ? 'bg-amber-500 text-gray-900' : 'bg-primary-500 text-gray-900'
                  }`}>
                  {rec.mode}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1" title={rec.title}>{rec.title}</h3>

              <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1.5" />
                  {format(new Date(rec.created_at), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center">
                  <Users size={14} className="mr-1.5" />
                  {rec.participants_count || 0}
                </div>
                <div className="flex items-center">
                  <Video size={14} className="mr-1.5" />
                  Recorded
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/vconf/recording/${rec.id}`)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View Transcript"
                  >
                    <FileText size={18} />
                  </button>
                  {user?.role === 'teacher' && (
                    <a
                      href={`${getVconfRecordingStream(rec.id)}&download=1`}
                      download={`recording-${rec.id}.webm`}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500" title="Transcript Ready"></div>
                  {user?.role === 'teacher' && (
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this recording?")) {
                          try {
                            await deleteVconfRecording(rec.id);
                            setRecordings(prev => prev.filter(r => r.id !== rec.id));
                          } catch (e) {
                            console.error("Failed to delete recording", e);
                            alert("Failed to delete recording");
                          }
                        }
                      }}
                      className="ml-2 p-1 text-red-600 hover:text-red-600 hover:bg-red-900/20 rounded transition-colors"
                      title="Delete Recording"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VconfRecordings;
