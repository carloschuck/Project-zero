import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { requestsApi, usersApi, categoriesApi } from '../services/api';
import { ArrowLeft, Send, User as UserIcon, Calendar, Tag, AlertCircle, Edit, Save, X, Lock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../components/StatusBadge';
import EventMetadataDisplay from '../components/EventMetadataDisplay';
import DynamicMetadataDisplay from '../components/DynamicMetadataDisplay';

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingInternalNote, setSubmittingInternalNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    subject: '',
    description: ''
  });
  
  // For admins/leads
  const [users, setUsers] = useState([]);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    assignedTo: '',
  });

  const canUpdate = user?.role === 'admin' || user?.role === 'department_lead' || user?.role === 'event_coordinator';
  const isAdmin = user?.role === 'admin';
  const canSeeInternalNotes = user?.role === 'admin' || user?.role === 'department_lead';

  useEffect(() => {
    fetchRequest();
    if (canUpdate) {
      fetchUsers();
    }
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await requestsApi.getById(id);
      setRequest(response.data.request);
      setComments(response.data.comments);
      setHistory(response.data.history);
      setUpdateData({
        status: response.data.request.status,
        priority: response.data.request.priority,
        assignedTo: response.data.request.assigned_to || '',
      });
      setEditData({
        subject: response.data.request.subject,
        description: response.data.request.description
      });
      
      // Fetch category to get form schema
      if (response.data.request.category_id) {
        const categoriesResponse = await categoriesApi.getAll();
        const requestCategory = categoriesResponse.data.categories.find(
          c => c.id === response.data.request.category_id
        );
        setCategory(requestCategory);
      }
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll({ limit: 100 });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await requestsApi.addComment(id, { comment: commentText, isInternal: false });
      setCommentText('');
      fetchRequest();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;

    setSubmittingInternalNote(true);
    try {
      await requestsApi.addComment(id, { comment: internalNoteText, isInternal: true });
      setInternalNoteText('');
      fetchRequest();
    } catch (error) {
      console.error('Failed to add internal note:', error);
    } finally {
      setSubmittingInternalNote(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updates = {};
      if (updateData.status !== request.status) updates.status = updateData.status;
      if (updateData.priority !== request.priority) updates.priority = updateData.priority;
      if (updateData.assignedTo !== (request.assigned_to || '')) {
        updates.assignedTo = updateData.assignedTo || null;
      }

      if (Object.keys(updates).length > 0) {
        await requestsApi.update(id, updates);
        fetchRequest();
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updates = {};
      if (editData.subject !== request.subject) updates.subject = editData.subject;
      if (editData.description !== request.description) updates.description = editData.description;

      if (Object.keys(updates).length > 0) {
        await requestsApi.update(id, updates);
        await fetchRequest();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save edits:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      subject: request.subject,
      description: request.description
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Request not found</p>
        </div>
      </Layout>
    );
  }

  // Separate internal notes and additional notes
  const internalNotes = comments.filter(c => c.is_internal);
  const additionalNotes = comments.filter(c => !c.is_internal);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/requests')}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Requests
          </button>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                  className="input text-3xl font-bold w-full"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {request.ticket_number}
                  </h1>
                  {isAdmin && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit request"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              {isEditing ? (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="btn-primary flex items-center text-sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xl text-gray-700 dark:text-gray-300">
                  {request.subject}
                </p>
              )}
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={8}
                  className="input w-full"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {request.description}
                </p>
              )}
            </div>

            {/* Dynamic Custom Form Data */}
            {category?.form_schema && category.form_schema.length > 0 ? (
              <DynamicMetadataDisplay 
                metadata={request.metadata} 
                schema={category.form_schema} 
              />
            ) : request.metadata && Object.keys(request.metadata).length > 0 && (
              /* Legacy Event Metadata */
              <EventMetadataDisplay metadata={request.metadata} />
            )}

            {/* Additional Notes */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Additional Notes
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {additionalNotes.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                    No additional notes yet
                  </p>
                ) : (
                  additionalNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {note.first_name} {note.last_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {note.role}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(note.created_at), 'PPp')}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        {note.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Additional Note Form */}
              <form onSubmit={handleAddComment} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add an additional note..."
                  rows={3}
                  className="input mb-3"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="btn-primary flex items-center disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submittingComment ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </form>
            </div>

            {/* Internal Notes (Admin & Department Lead Only) */}
            {canSeeInternalNotes && (
              <div className="card border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Internal Notes
                  </h2>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    (Admin & Department Lead Only)
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  {internalNotes.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No internal notes yet
                    </p>
                  ) : (
                    internalNotes.map((note) => (
                      <div key={note.id} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {note.first_name} {note.last_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {note.role}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(note.created_at), 'PPp')}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                          {note.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Internal Note Form */}
                <form onSubmit={handleAddInternalNote} className="border-t border-amber-200 dark:border-amber-800 pt-4">
                  <textarea
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    placeholder="Add an internal note (visible only to admins and department leads)..."
                    rows={3}
                    className="input mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingInternalNote || !internalNoteText.trim()}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {submittingInternalNote ? 'Adding...' : 'Add Internal Note'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Request Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {request.category_name}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={`badge ${
                      request.priority === 'urgent' ? 'badge-closed' :
                      request.priority === 'high' ? 'badge-in-progress' :
                      request.priority === 'medium' ? 'badge-open' :
                      'badge-resolved'
                    }`}>
                      {request.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted By</p>
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {request.user_first_name} {request.user_last_name}
                    </span>
                  </div>
                </div>

                {request.assigned_first_name && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned To</p>
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {request.assigned_first_name} {request.assigned_last_name}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(request.created_at), 'PPp')}
                    </span>
                  </div>
                </div>

                {request.updated_at && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(request.updated_at), 'PPp')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Update Controls (Admin/Department Lead) */}
            {canUpdate && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Update Status
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="input"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={updateData.priority}
                      onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assign To
                    </label>
                    <select
                      value={updateData.assignedTo}
                      onChange={(e) => setUpdateData({ ...updateData, assignedTo: e.target.value })}
                      className="input"
                    >
                      <option value="">Unassigned</option>
                      {users.filter(u => u.is_active).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleUpdate}
                    className="w-full btn-primary"
                  >
                    Update Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestDetail;
