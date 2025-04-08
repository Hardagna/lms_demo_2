import React, { useEffect, useState } from 'react';
import './lecture.css';
import axios from 'axios';
// import { server } from '../../redux/store';
import { server } from '../../main';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { TiTick } from "react-icons/ti";
import { FaSearch, FaFilePdf, FaYoutube, FaGlobe, FaWikipediaW, FaHeadphones, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { FaFileUpload, FaFile, FaFileImage, FaFileAudio, FaFileVideo, FaFileAlt } from 'react-icons/fa';
import { CourseData } from '../../context/CourseContext';
import TeachingAssistantsList from '../../components/TeachingAssistantsList';
import LectureChatbot from '../../components/chatbot/LectureChatbot';

const Lecture = ({ user }) => {
    const { teachingAssistants, fetchTeachingAssistants } = CourseData();
    // Existing state variables
    const [lectures, setLectures] = useState([]);
    const [lecture, setLecture] = useState({});
    const [loading, setLoading] = useState(true);
    const [lecLoading, setLecLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    // Make video optional
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    const [completed, setCompleted] = useState("");
    const [completedLecture, setCompletedLecture] = useState([]);
    const [lecLength, setLecLength] = useState("");
    const [progress, setProgress] = useState([]);

    // Resource state variables
    const [showResourceSearch, setShowResourceSearch] = useState(false);
    const [resourceQuery, setResourceQuery] = useState('');
    const [resourceType, setResourceType] = useState('all');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [resources, setResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [selectedLectureForResource, setSelectedLectureForResource] = useState('');

    // Add new state variables for resource upload
    const [showUploadResource, setShowUploadResource] = useState(false);
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceDescription, setResourceDescription] = useState('');
    const [resourceFile, setResourceFile] = useState(null);
    const [resourceFilePreview, setResourceFilePreview] = useState('');
    const [uploadingResource, setUploadingResource] = useState(false);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const params = useParams();
    const navigate = useNavigate();

    // Add new state variables after existing state variables
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');
    const [filteredResults, setFilteredResults] = useState([]);

    async function getLectures() {
        try {
            setLoading(true);
            const { data } = await axios.get(`${server}/api/courses/course/lectures/${params.id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            setLectures(data.lectures);
            if (data.lectures.length > 0) {
                setLecture(data.lectures[0]);
                // Get resources for the first lecture
                getLectureResources(data.lectures[0]._id);
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function getLecture(id) {
        try {
            setLecLoading(true);
            const { data } = await axios.get(`${server}/api/courses/course/lecture/${id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            setLecture(data.lecture);
            // Get resources for the selected lecture and display them
            setResources([]); // Clear previous resources first
            getLectureResources(id);
            setLecLoading(false);
        } catch (error) {
            console.log(error);
            setLecLoading(false);
        }
    }

    // Modified submitHandler to make video optional
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setBtnLoading(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (video) {
                formData.append('image', video);
            }

            await axios.post(`${server}/api/admin/course/add-lecture/${params.id}`, formData, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            // Reset form and refresh lectures
            setTitle('');
            setDescription('');
            setVideo(null);
            setVideoPreview('');
            setShowAddForm(false);
            getLectures();
            setBtnLoading(false);
        } catch (error) {
            console.log(error);
            setBtnLoading(false);
        }
    };

    const deleteLectureHandler = async (id) => {
        try {
            setBtnLoading(true);
            await axios.delete(`${server}/api/admin/course/delete-lecture/${id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            getLectures();
            setBtnLoading(false);
        } catch (error) {
            console.log(error);
            setBtnLoading(false);
        }
    };

    // Existing changeVideoHandler can remain the same
    const changeVideoHandler = (e) => {
        const file = e.target.files[0];
        setVideo(file);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setVideoPreview(reader.result);
        };
    };

    async function getProgress() {
        try {
            const { data } = await axios.get(`${server}/api/courses/course/progress?course=${params.id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            setCompleted(data.completedLectures);
            setLecLength(data.allLectures);
            setProgress(data.progressPercentage);
        } catch (error) {
            console.log(error);
        }
    }

    const addProgress = async (id) => {
        try {
            await axios.post(`${server}/api/courses/course/progress?course=${params.id}&lectureId=${id}`, {}, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            getProgress();
        } catch (error) {
            console.log(error);
        }
    };

    // Function to search for resources
    const searchResourcesHandler = async (e) => {
        e.preventDefault();
        try {
            setSearching(true);
            setSearchResults([]);

            const searchParams = new URLSearchParams({
                query: resourceQuery,
                type: resourceType,
                date: dateFilter,
                sort: sortBy
            });

            const response = await axios.get(
                `${server}/api/resources/search?${searchParams.toString()}`,
                {
                    headers: {
                        token: localStorage.getItem('token'),
                    },
                }
            );

            if (response.data && Array.isArray(response.data.results)) {
                const filtered = applyFilters(response.data.results);
                setSearchResults(filtered);
                setFilteredResults(filtered);
                
                if (filtered.length === 0) {
                    toast.info('No resources found for your query');
                }
            } else {
                setSearchResults([]);
                setFilteredResults([]);
                toast.error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error searching resources:', error);
            toast.error(error.response?.data?.message || 'Failed to search resources');
            setSearchResults([]);
            setFilteredResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Function to add a resource to the selected lecture
    const addResourceHandler = async (resource) => {
        try {
            const lectureId = selectedLectureForResource || lecture._id;

            await axios.post(`${server}/api/resources/add/${lectureId}`, {
                title: resource.title,
                type: resource.type,
                url: resource.url,
                description: resource.description
            }, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            // Refresh resources
            getLectureResources(lectureId);

            // Close search panel
            setShowResourceSearch(false);
        } catch (error) {
            console.log(error);
        }
    };

    // Function to get resources for the current lecture
    const getLectureResources = async (lectureId) => {
        try {
            setLoadingResources(true);
            const { data } = await axios.get(`${server}/api/resources/lecture/${lectureId}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            setResources(data.resources);
            setLoadingResources(false);
        } catch (error) {
            console.log(error);
            setLoadingResources(false);
            setResources([]);
        }
    };

    // Function to delete a resource
    const deleteResourceHandler = async (resourceId) => {
        try {
            setBtnLoading(true);
            await axios.delete(`${server}/api/resources/${resourceId}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            // Refresh resources
            getLectureResources(lecture._id);
            setBtnLoading(false);
        } catch (error) {
            console.log(error);
            setBtnLoading(false);
        }
    };

    // Function to render resource icon based on type
    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <i className="fa fa-file-pdf-o" aria-hidden="true"></i>;
            case 'video':
                return <i className="fa fa-video-camera" aria-hidden="true"></i>;
            case 'webpage':
                return <i className="fa fa-globe" aria-hidden="true"></i>;
            case 'wikipedia':
                return <i className="fa fa-wikipedia-w" aria-hidden="true"></i>;
            case 'audio':
                return <i className="fa fa-volume-up" aria-hidden="true"></i>;
            case 'document':
                return <i className="fa fa-file-text-o" aria-hidden="true"></i>;
            case 'image':
                return <i className="fa fa-file-image-o" aria-hidden="true"></i>;
            default:
                return <i className="fa fa-file" aria-hidden="true"></i>;
        }
    };

    // Helper function to truncate URLs for display
    const truncateUrl = (url) => {
        if (!url) return '';
        if (url.length > 40) {
            return url.substring(0, 37) + '...';
        }
        return url;
    };

    // Handle resource file change
    const handleResourceFileChange = (e) => {
        const file = e.target.files[0];
        setResourceFile(file);

        // Create preview for certain file types
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setResourceFilePreview(reader.result);
            };
        } else {
            setResourceFilePreview('');
        }
    };

    // Update the uploadResourceHandler function
    const uploadResourceHandler = async (e) => {
        e.preventDefault();

        if (!resourceTitle || !resourceFile) {
            toast.error('Please provide a title and file');
            return;
        }

        try {
            setUploadingResource(true);

            const formData = new FormData();
            formData.append('file', resourceFile);
            formData.append('title', resourceTitle);
            formData.append('description', resourceDescription);

            // Use server variable and correct header format
            const { data } = await axios.post(
                `${server}/api/resources/upload/${selectedLectureForResource || lecture._id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        token: localStorage.getItem('token')
                    }
                }
            );

            toast.success('Resource uploaded successfully');
            setResourceTitle('');
            setResourceDescription('');
            setResourceFile(null);
            setResourceFilePreview('');
            setShowUploadResource(false);

            // Refresh resources list
            getLectureResources(selectedLectureForResource || lecture._id);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload resource');
        } finally {
            setUploadingResource(false);
        }
    };

    // Render resource link appropriately (external URL vs local file)
    const renderResourceLink = (resource) => {
        if (resource.isLocalResource) {
            // Fix URL path issues with uploaded resources
            let fullUrl = resource.url;

            // If URL is relative and not correctly formatted, fix it
            if (!fullUrl.startsWith('http') && !fullUrl.startsWith('/')) {
                fullUrl = `/${fullUrl}`;
            } else if (fullUrl.startsWith('//')) {
                // Fix double slash issue
                fullUrl = fullUrl.replace('//', '/');
            }

            // Make sure it points to the server
            if (!fullUrl.startsWith('http')) {
                fullUrl = `${server}${fullUrl}`;
            }

            return (
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                >
                    View Resource
                </a>
            );
        } else {
            return (
                <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                >
                    {truncateUrl(resource.url)}
                </a>
            );
        }
    };

    const fetchComments = async () => {
        try {
            const { data } = await axios.get(`${server}/api/comments/${params.id}`, {
                headers: {
                    token: localStorage.getItem('token'),
                },
            });
            setComments(data.comments);
        } catch (error) {
            console.log(error);
        }
    };

    const addCommentHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${server}/api/comments/${params.id}`, { content: newComment }, {
                headers: {
                    token: localStorage.getItem('token'),
                },
            });
            setComments([...comments, data.comment]);
            setNewComment('');
        } catch (error) {
            console.log(error);
        }
    };

    const deleteCommentHandler = async (commentId) => {
        try {
            await axios.delete(`${server}/api/comments/${commentId}`, {
                headers: {
                    token: localStorage.getItem('token'),
                },
            });
            setComments(comments.filter(comment => comment._id !== commentId));
        } catch (error) {
            console.log(error);
        }
    };

    // Add a function to check if user is admin or teaching assistant for this course
    const canManageCourse = () => {
        // Admin can manage all courses
        if (user?.role === 'admin') return true;

        // Check if user is a teaching assistant for this course
        if (user?.teachingAssistantFor && Array.isArray(user.teachingAssistantFor)) {
            // Get courseId from the URL parameters
            const courseId = params.id; // This might be lecture ID
            // Extract course ID if this is a lecture page
            return user.teachingAssistantFor.includes(courseId);
        }
        return false;
    };

    // Fetch lectures when component mounts
    useEffect(() => {
        getLectures();
        if (canManageCourse()) {
            // Maybe load additional teaching assistant features here
        }
    }, [params.id, user?.role, user?.teachingAssistantFor]);

    // Fetch the course teaching assistants when component mounts
    useEffect(() => {
        if (params.id) {
            fetchTeachingAssistants(params.id);
        }
    }, [params.id]);

    useEffect(() => {
        fetchComments();
    }, [params.id]);

    // Add this filter function before the searchResourcesHandler
    const applyFilters = (results) => {
        let filtered = [...results];

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(result => {
                if (!result.publishedDate) return true;
                const date = new Date(result.publishedDate);
                switch (dateFilter) {
                    case 'day':
                        return now - date <= 86400000;
                    case 'week':
                        return now - date <= 604800000;
                    case 'month':
                        return now - date <= 2592000000;
                    case 'year':
                        return now - date <= 31536000000;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
                case 'relevance':
                    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Update the renderResource function to handle local resources differently
    const renderResource = (resource, index) => {
        const formattedDate = resource.publishedDate 
            ? new Date(resource.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : null;

        return (
            <div key={index} className="resource-result-item">
                <div className="resource-info">
                    <span className="resource-icon">{getResourceIcon(resource.type)}</span>
                    <div className="resource-details">
                        <h4>{resource.title}</h4>
                        <div className="resource-metadata">
                            {formattedDate && (
                                <span className="resource-date">
                                    <i className="far fa-calendar-alt"></i> {formattedDate}
                                </span>
                            )}
                            {resource.language && (
                                <span className="resource-language">
                                    <i className="fas fa-globe"></i> {resource.language.toUpperCase()}
                                </span>
                            )}
                            {resource.fileSize && (
                                <span className="resource-size">
                                    <i className="fas fa-file"></i> {resource.fileSize}
                                </span>
                            )}
                            {resource.domain && (
                                <span className="resource-domain">
                                    <i className="fas fa-link"></i> {resource.domain}
                                </span>
                            )}
                        </div>
                        <p>{resource.description}</p>
                        {renderResourceLink(resource)}
                    </div>
                </div>
                <div className="resource-actions">
                    {resource.isLocalResource ? (
                        <>
                            {/* Don't show add button if it's already in the current lecture */}
                            {selectedLectureForResource &&
                                resource.lectureId !== selectedLectureForResource && (
                                    <button
                                        onClick={() => copyLocalResourceHandler(resource)}
                                        className="btn btn-sm btn-primary"
                                        disabled={btnLoading}
                                    >
                                        Add to Current Lecture
                                    </button>
                                )}
                        </>
                    ) : (
                        <button
                            onClick={() => addResourceHandler(resource)}
                            className="btn btn-sm btn-primary"
                            disabled={!selectedLectureForResource || btnLoading}
                        >
                            Add to Lecture
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Add a function to copy resources between lectures
    const copyLocalResourceHandler = async (resource) => {
        try {
            setBtnLoading(true);
            console.log("Resource object:", resource); // Debug log

            // Check if we have the required fields
            if (!resource.resourceId || !selectedLectureForResource) {
                console.error("Missing resource data:", {
                    resourceId: resource.resourceId,
                    targetLecture: selectedLectureForResource
                });
                toast.error('Missing resource information or target lecture');
                setBtnLoading(false);
                return;
            }

            // Make API call to copy the resource to the selected lecture
            const response = await axios.post(
                `${server}/api/resources/copy`,
                {
                    sourceResourceId: resource.resourceId,
                    targetLectureId: selectedLectureForResource
                },
                {
                    headers: {
                        token: localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    },
                }
            );

            console.log("Copy response:", response.data); // Debug log
            toast.success('Resource added to lecture successfully');

            // Refresh the resources for the current lecture
            await getLectureResources(selectedLectureForResource);

            setBtnLoading(false);
        } catch (error) {
            console.error('Error copying resource:', error);
            // More detailed error logging
            if (error.response) {
                console.error('Server response:', error.response.data);
            }

            // More specific error message based on the response
            const errorMessage = error.response?.data?.message || 'Failed to add resource to lecture';
            toast.error(errorMessage);
            setBtnLoading(false);
        }
    };

    // Helper function to normalize file URLs
    const normalizeFileUrl = (url) => {
        if (!url) return '';

        // Fix double slash issues
        if (url.startsWith('//')) {
            url = url.replace('//', '/');
        }

        // If URL is relative and not correctly formatted, fix it
        if (!url.startsWith('http') && !url.startsWith('/')) {
            url = `/${url}`;
        }

        // If it's a relative URL, add the server base
        if (!url.startsWith('http')) {
            url = `${server}${url}`;
        }

        return url;
    };

    // Replace the existing resource search form with this enhanced version
    const renderResourceSearchForm = () => (
        <div className="resource-search-container">
            <h4>Search Resources</h4>
            <form onSubmit={searchResourcesHandler} className="resource-search-form">
                {/* Existing query and type inputs */}
                <div className="form-group mb-3">
                    <label htmlFor="resourceQuery">Search Query</label>
                    <input
                        type="text"
                        className="form-control"
                        id="resourceQuery"
                        value={resourceQuery}
                        onChange={(e) => setResourceQuery(e.target.value)}
                        placeholder="Enter search terms"
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="resourceType">Resource Type</label>
                    <select
                        className="form-control"
                        id="resourceType"
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="pdf">PDF/Documents</option>
                        <option value="video">Videos</option>
                        <option value="webpage">Webpages</option>
                        <option value="wikipedia">Wikipedia</option>
                        <option value="audio">Audio</option>
                        <option value="image">Images</option>
                    </select>
                </div>

                {/* New filter controls */}
                <div className="filters-section">
                    <div className="form-group mb-3">
                        <label htmlFor="dateFilter">Date</label>
                        <select
                            className="form-control"
                            id="dateFilter"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="all">Any time</option>
                            <option value="day">Past 24 hours</option>
                            <option value="week">Past week</option>
                            <option value="month">Past month</option>
                            <option value="year">Past year</option>
                        </select>
                    </div>

                    <div className="form-group mb-3">
                        <label htmlFor="sortBy">Sort by</label>
                        <select
                            className="form-control"
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="relevance">Relevance</option>
                            <option value="date">Date</option>
                        </select>
                    </div>
                    {/* Remove language filter select element */}
                </div>

                {/* Existing buttons */}
                <div className="form-group mb-3">
                    <label htmlFor="selectedLecture">Add to Lecture</label>
                    <select
                        className="form-control"
                        id="selectedLecture"
                        value={selectedLectureForResource}
                        onChange={(e) => setSelectedLectureForResource(e.target.value)}
                        required
                    >
                        <option value="">Select a Lecture</option>
                        {lectures.map((lec) => (
                            <option key={lec._id} value={lec._id}>
                                {lec.title}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={searching || !resourceQuery || !selectedLectureForResource}
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="search-results-container mt-4">
                <h5>Search Results</h5>
                {searching ? (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="search-results-list">
                        {searchResults.map((resource, index) => renderResource(resource, index))}
                    </div>
                ) : (
                    <p className="text-muted">No results found</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="lec-page">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="lec-content">
                    {/* Lecture List */}
                    <div className="left">
                        <h3>Lectures</h3>
                        {lectures.length > 0 ? (
                            <div className="lectures-list">
                                {lectures.map((item) => (
                                    <div
                                        key={item._id}
                                        className={`lecture-item ${lecture._id === item._id ? 'active' : ''}`}
                                    >
                                        <div
                                            className="lec-no"
                                            onClick={() => getLecture(item._id)}
                                        >
                                            {item.title}
                                        </div>
                                        {user?.role === 'admin' && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteLectureHandler(item._id)}
                                                disabled={btnLoading}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No lectures available</p>
                        )}

                        {/* Admin Controls */}
                        {canManageCourse() && (
                            <div className="admin-controls">
                                <button
                                    className={`commonBtn ${showAddForm ? 'active-btn' : ''}`}
                                    onClick={() => {
                                        setShowAddForm(!showAddForm);
                                        setShowDeleteForm(false);
                                        setShowResourceSearch(false);
                                        setShowUploadResource(false);
                                    }}
                                >
                                    Add Lecture
                                </button>
                                <button
                                    className={`commonBtn ${showResourceSearch ? 'active-btn' : ''}`}
                                    onClick={() => {
                                        setShowResourceSearch(!showResourceSearch);
                                        setShowAddForm(false);
                                        setShowDeleteForm(false);
                                        setShowUploadResource(false);
                                    }}
                                >
                                    Online Resources
                                </button>
                                <button
                                    className={`commonBtn ${showUploadResource ? 'active-btn' : ''}`}
                                    onClick={() => {
                                        setShowUploadResource(!showUploadResource);
                                        setShowAddForm(false);
                                        setShowDeleteForm(false);
                                        setShowResourceSearch(false);
                                    }}
                                >
                                    Upload Resource
                                </button>
                                <button onClick={() => navigate(`/admin/quiz/create/${lecture._id}`)}>Create Quiz</button>
                                <button onClick={() => navigate(`/admin/quiz/${lecture._id}`)}>View Quizzes</button>
                            </div>
                        )}

                        {/* Add Lecture Form */}
                        {showAddForm && (
                            <div className="lec-form">
                                <h3>Add New Lecture</h3>
                                <form onSubmit={submitHandler}>
                                    <label htmlFor="title">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />

                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    ></textarea>

                                    <label htmlFor="video">Video (Optional)</label>
                                    <input
                                        type="file"
                                        id="video"
                                        accept="video/*"
                                        onChange={changeVideoHandler}
                                    />

                                    {videoPreview && (
                                        <video
                                            src={videoPreview}
                                            controls
                                            style={{ maxWidth: '100%', marginTop: '10px' }}
                                        ></video>
                                    )}

                                    <button
                                        type="submit"
                                        className="commonBtn"
                                        disabled={btnLoading}
                                    >
                                        {btnLoading ? 'Adding...' : 'Add Lecture'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Search Resources Form */}
                        {showResourceSearch && renderResourceSearchForm()}

                        {/* Upload Resource Form */}
                        {showUploadResource && (
                            <div className="resource-upload-form">
                                <h3>Upload Resource File</h3>

                                <div className="lecture-selector">
                                    <label htmlFor="uploadLectureSelect">Select Lecture</label>
                                    <select
                                        id="uploadLectureSelect"
                                        value={selectedLectureForResource || lecture._id || ''}
                                        onChange={(e) => setSelectedLectureForResource(e.target.value)}
                                    >
                                        {lectures.map((lec) => (
                                            <option key={lec._id} value={lec._id}>
                                                {lec.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <form onSubmit={uploadResourceHandler} className="resource-upload-container">
                                    <label htmlFor="resourceTitle">Title</label>
                                    <input
                                        type="text"
                                        id="resourceTitle"
                                        value={resourceTitle}
                                        onChange={(e) => setResourceTitle(e.target.value)}
                                        required
                                    />

                                    <label htmlFor="resourceDescription">Description</label>
                                    <textarea
                                        id="resourceDescription"
                                        value={resourceDescription}
                                        onChange={(e) => setResourceDescription(e.target.value)}
                                    ></textarea>

                                    <label htmlFor="resourceFile">File</label>
                                    <input
                                        type="file"
                                        id="resourceFile"
                                        onChange={handleResourceFileChange}
                                        required
                                    />

                                    {resourceFile && (
                                        <div className="selected-file-info">
                                            <div className="file-icon">
                                                <i className="fas fa-file"></i>
                                            </div>
                                            <div className="file-details">
                                                <p><strong>{resourceFile.name}</strong></p>
                                                <p>Size: {Math.round(resourceFile.size / 1024)} KB</p>
                                                <p>Type: {resourceFile.type || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {resourceFilePreview && resourceFile?.type.startsWith('image/') && (
                                        <div className="file-preview">
                                            <img src={resourceFilePreview} alt="Preview" />
                                        </div>
                                    )}

                                    {resourceFilePreview && resourceFile?.type.startsWith('video/') && (
                                        <div className="file-preview">
                                            <video src={resourceFilePreview} controls></video>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="upload-btn upload-resource-btn"
                                        disabled={uploadingResource || !resourceFile}
                                    >
                                        {uploadingResource ? (
                                            <>
                                                <i className="fas fa-circle-notch fa-spin"></i>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-upload"></i>
                                                Upload Resource
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Lecture Content */}
                    <div className="right">
                        {lecLoading ? (
                            <div>Loading lecture...</div>
                        ) : (
                            <>
                                {lecture?.title ? (
                                    <div className="lecture-container">
                                        <h2>{lecture.title}</h2>

                                        {user?.role !== 'admin' && (
                                            <div className="progress" style={{ width: '100%', height: '5px', backgroundColor: '#f5f5f5', borderRadius: '3px', marginBottom: '20px' }}>
                                                <div
                                                    style={{
                                                        width: `${progress}%`,
                                                        backgroundColor: '#4caf50',
                                                        height: '100%',
                                                        borderRadius: '3px'
                                                    }}
                                                ></div>
                                            </div>
                                        )}

                                        {lecture.video && (
                                            <video
                                                src={`${server}/${lecture.video}`}
                                                controls
                                                style={{ maxWidth: '100%', marginBottom: '15px' }}
                                            ></video>
                                        )}

                                        <p>{lecture.description}</p>

                                        {/* Add chatbot for admins and TAs */}
                                        {canManageCourse() && (
                                            <LectureChatbot lecture={lecture} user={user} />
                                        )}

                                        {/* Lecture Resources Section */}
                                        <div className="resources-section">
                                            <div className="resources-header">
                                                <h3>Resources</h3>
                                            </div>

                                            {loadingResources ? (
                                                <div className="searching-indicator">
                                                    <div className="spinner"></div>
                                                    <p>Loading resources...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {resources.length > 0 ? (
                                                        <ul className="resources-list">
                                                            {resources.map((resource) => (
                                                                <li key={resource._id} className="resource-item">
                                                                    <a
                                                                        href={resource.isUploadedFile ? normalizeFileUrl(resource.url) : resource.url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="resource-link"
                                                                    >
                                                                        <div className={`resource-icon resource-icon-${resource.type}`}>
                                                                            {getResourceIcon(resource.type)}
                                                                        </div>

                                                                        <div className="resource-details">
                                                                            <h4>{resource.title}</h4>
                                                                            <p>{resource.description}</p>
                                                                            <div className="resource-url">
                                                                                {resource.isUploadedFile ? (
                                                                                    <span className="uploaded-file-label">Uploaded File</span>
                                                                                ) : (
                                                                                    <span>{truncateUrl(resource.url)}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </a>

                                                                    {user?.role === 'admin' && (
                                                                        <button
                                                                            className="delete-resource-btn"
                                                                            onClick={() => deleteResourceHandler(resource._id)}
                                                                            disabled={btnLoading}
                                                                        >
                                                                            <i className="fas fa-trash-alt"></i>
                                                                        </button>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>No resources available for this lecture</p>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {user?.role !== 'admin' && (
                                            <button
                                                className="commonBtn"
                                                onClick={() => addProgress(lecture._id)}
                                            >
                                                Mark as Complete
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p>No lecture selected</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* Add Teaching Assistants list */}
            <div className="resources-section">
                <TeachingAssistantsList teachingAssistants={teachingAssistants} />
            </div>
            <div className="comments-section">
                <h3>Comments</h3>
                <form onSubmit={addCommentHandler}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment"
                        required
                    />
                    <button type="submit">Post Comment</button>
                </form>
                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment._id} className="comment">
                            <p><strong>{comment.user.username}</strong></p>
                            <p>{comment.content}</p>
                            {(comment.user._id === user._id || user.role === 'admin') && (
                                <button onClick={() => deleteCommentHandler(comment._id)}>Delete</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Lecture;