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

const Lecture = ({ user }) => {
    // Existing state variables
    const [lectures, setLectures] = useState([]);
    const [lecture, setLecture] = useState({});
    const [loading, setLoading] = useState(true);
    const [lecLoading, setLecLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
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

    const params = useParams();
    const navigate = useNavigate();

    async function getLectures() {
        try {
            const { data } = await axios.get(`${server}/api/courses/course/lectures/${params.id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            setLectures(data.lectures);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function getLecture(id) {
        setLecLoading(true);
        try {
            const { data } = await axios.get(`${server}/api/courses/course/lecture/${id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            setLecture(data.lecture);
            console.log("Lecture data", data.lecture);
            setLecLoading(false);
        } catch (error) {
            console.log(error);
            setLecLoading(false);
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        setBtnLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("file", video);

        try {
            const { data } = await axios.post(`${server}/api/admin/course/add-lecture/${params.id}`, formData, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });

            toast.success(data.message);
            setBtnLoading(false);
            setShowAddForm(false);
            getLectures();
            setTitle('');
            setDescription('');
            setVideo('');
            setVideoPreview('');
        } catch (error) {
            toast.error(error.response.data.message);
            setBtnLoading(false);
        }
    };

    const deleteLectureHandler = async (id) => {
        try {
            const { data } = await axios.delete(`${server}/api/admin/course/delete-lecture/${id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            toast.success(data.message);
            getLectures();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const changeVideoHandler = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onloadend = () => {
            setVideo(file);
            setVideoPreview(reader.result);
        };
        reader.readAsDataURL(file);
        
    };

    async function getProgress() {
        try {
            const { data } = await axios.get(`${server}/api/user/progress?course=${params.id}`, {
                headers: { token: localStorage.getItem("token") }
            });
            setProgress(data);
            setCompleted(data.progressPercentage);
            setCompletedLecture(data.completedLectures);
            setLecLength(data.allLectures);
        } catch (error) {
            console.log(error);
        }
    };

    const addProgress = async (id) => {
        try {
            await axios.post(`${server}/api/user/progress?course=${params.id}&lectureId=${id}`, {}, {
                headers: { token: localStorage.getItem("token") }
            });
            getProgress();
        } catch (error) {
            console.log(error);
        }
    };

    // Function to search for resources
    const searchResourcesHandler = async (e) => {
        e.preventDefault();
        if (!resourceQuery) {
            toast.error('Please enter a search query');
            return;
        }
        
        setSearching(true);
        try {
            const { data } = await axios.get(
                `${server}/api/resources/search?query=${resourceQuery}&type=${resourceType}`,
                {
                    headers: {
                        token: localStorage.getItem("token"),
                    }
                }
            );
            
            setSearchResults(data.results);
            setSearching(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error searching resources');
            setSearching(false);
        }
    };

    // Function to add a resource to the selected lecture
    const addResourceHandler = async (resource) => {
        // Check if a lecture is selected for adding resources
        if (!selectedLectureForResource) {
            toast.error('Please select a lecture to add resources to');
            return;
        }
        
        try {
            const { data } = await axios.post(
                `${server}/api/resources/add/${selectedLectureForResource}`,
                {
                    title: resource.title,
                    type: resource.type,
                    url: resource.url,
                    description: resource.description || ''
                },
                {
                    headers: {
                        token: localStorage.getItem("token"),
                    }
                }
            );
            
            toast.success('Resource added successfully');
            
            // If the current active lecture is the same as the one resources are being added to,
            // refresh the resources list
            if (lecture._id === selectedLectureForResource) {
                getLectureResources();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding resource');
        }
    };

    // Function to get resources for the current lecture
    const getLectureResources = async () => {
        if (!lecture?._id) return;
        
        setLoadingResources(true);
        try {
            const { data } = await axios.get(
                `${server}/api/resources/lecture/${lecture._id}`,
                {
                    headers: {
                        token: localStorage.getItem("token"),
                    }
                }
            );
            
            setResources(data.resources);
            setLoadingResources(false);
        } catch (error) {
            console.log('Error fetching resources:', error);
            setLoadingResources(false);
        }
    };

    // Function to delete a resource
    const deleteResourceHandler = async (resourceId) => {
        try {
            const { data } = await axios.delete(
                `${server}/api/resources/${resourceId}`,
                {
                    headers: {
                        token: localStorage.getItem("token"),
                    }
                }
            );
            
            toast.success('Resource deleted successfully');
            getLectureResources();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting resource');
        }
    };

    // Function to render resource icon based on type
    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <FaFilePdf />;
            case 'video':
                return <FaYoutube />;
            case 'webpage':
                return <FaGlobe />;
            case 'wikipedia':
                return <FaWikipediaW />;
            case 'audio':
                return <FaHeadphones />;
            default:
                return <FaGlobe />;
        }
    };

    // Helper function to truncate URLs for display
    const truncateUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return `${urlObj.hostname}${urlObj.pathname.substring(0, 15)}${urlObj.pathname.length > 15 ? '...' : ''}`;
        } catch (e) {
            return url.substring(0, 30) + (url.length > 30 ? '...' : '');
        }
    }

    // Update useEffect to fetch resources when lecture changes
    useEffect(() => {
        getLectures();
        getProgress();
        
        if (lecture?._id) {
            getLectureResources();
            
            // If no lecture is selected for resources yet, select the current one
            if (!selectedLectureForResource) {
                setSelectedLectureForResource(lecture._id);
            }
        }
    }, [lecture]);

    return (
        <>
            <div className="progress">
                <p>Lecture completed {completedLecture} out of {lecLength}</p>
                <br />
                <progress value={completed} max={100}></progress> {progress.progressPercentage}%
            </div>

            <div className="lec-page">
                <div className="left">
                    {lecture?.video ? (
                        <>
                            <video
                                src={`${server}/${lecture.video}`}
                                width={"100%"}
                                controls
                                controlsList="nodownload noremoteplayback"
                                disablePictureInPicture
                                disableRemotePlayback
                                autoPlay
                                type="video/mp4"
                                onEnded={() => addProgress(lecture._id)}
                            />
                            <h1>{lecture.title}</h1>
                            <h3>{lecture.description}</h3>

                            {/* Resources display section - only shows resources, not search */}
                            <div className="resources-section">
                                <h2>Resources</h2>
                                
                                {/* Display added resources */}
                                <div className="added-resources">
                                    {loadingResources ? (
                                        <p>Loading resources...</p>
                                    ) : resources.length > 0 ? (
                                        <ul className="resources-list">
                                            {resources.map((resource) => (
                                                <li key={resource._id} className="resource-item">
                                                    <a 
                                                        href={resource.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="resource-link"
                                                    >
                                                        <span className={`resource-icon resource-icon-${resource.type}`}>
                                                            {getResourceIcon(resource.type)}
                                                        </span>
                                                        <div>
                                                            <h4>{resource.title}</h4>
                                                            <p>{resource.description}</p>
                                                        </div>
                                                    </a>
                                                    {user?.role === "admin" && (
                                                        <button 
                                                            className="delete-resource-btn" 
                                                            onClick={() => deleteResourceHandler(resource._id)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No resources available for this lecture.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <h1>Choose a lecture</h1>
                    )}
                </div>

                <div className="right">
                    {/* Admin controls section */}
                    {user?.role === "admin" && (
                        <div className="admin-controls">
                            {/* OPTION 1: Choose video from system */}
                            <button 
                                className={`commonBtn ${showAddForm ? 'active-btn' : ''}`} 
                                onClick={() => {
                                    setShowAddForm(!showAddForm);
                                    if (showResourceSearch) setShowResourceSearch(false);
                                }}
                            >
                                {showAddForm ? "Close Add Form" : "Add Lecture"}
                            </button>
                            
                            {/* OPTION 2: Search online resources */}
                            <button 
                                className={`commonBtn resource-btn ${showResourceSearch ? 'active-btn' : ''}`} 
                                onClick={() => {
                                    setShowResourceSearch(!showResourceSearch);
                                    if (showAddForm) setShowAddForm(false);
                                }}
                            >
                                {showResourceSearch ? "Hide Resource Search" : "Find Online Resources"}
                            </button>
                        </div>
                    )}

                    {/* Add lecture form - OPTION 1 */}
                    {showAddForm && (
                        <div className="lec-form">
                            <h3>Upload Video Lecture</h3>
                            <form onSubmit={submitHandler}>
                                <label htmlFor="title">Title</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

                                <label htmlFor="description">Description</label>
                                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />

                                <label htmlFor="video">Choose Video From System</label>
                                <input type="file" onChange={changeVideoHandler} required />

                                {videoPreview && <video src={videoPreview} width={300} controls />}

                                <button type="submit" className="commonBtn" disabled={btnLoading}>
                                    {btnLoading ? "Uploading..." : "Add"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Online Resource Search - OPTION 2 */}
                    {showResourceSearch && (
                        <div className="resource-search-form">
                            <h3>Find Online Resources</h3>
                            
                            {/* Lecture selector dropdown */}
                            <div className="lecture-selector">
                                <label htmlFor="lectureSelector">Add resources to:</label>
                                <select 
                                    id="lectureSelector"
                                    value={selectedLectureForResource} 
                                    onChange={(e) => setSelectedLectureForResource(e.target.value)}
                                >
                                    <option value="">Select a lecture</option>
                                    {lectures.map(lec => (
                                        <option key={lec._id} value={lec._id}>
                                            {lec.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <form onSubmit={searchResourcesHandler}>
                                <div className="search-input-container">
                                    <input 
                                        type="text" 
                                        placeholder="Search for resources..." 
                                        value={resourceQuery} 
                                        onChange={(e) => setResourceQuery(e.target.value)}
                                    />
                                    <select 
                                        value={resourceType} 
                                        onChange={(e) => setResourceType(e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="pdf">PDFs</option>
                                        <option value="video">Videos</option>
                                        <option value="webpage">Webpages</option>
                                        <option value="wikipedia">Wikipedia</option>
                                        <option value="audio">Audio</option>
                                    </select>
                                    <button type="submit" className="search-btn" disabled={searching}>
                                        <FaSearch /> {searching ? "Searching..." : "Search"}
                                    </button>
                                </div>
                            </form>

                            <div className="search-results">
                                {searching ? (
                                    <div className="searching-indicator">
                                        <div className="spinner"></div>
                                        <p>Searching the web for resources...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="resource-results-list">
                                        {searchResults.map((result, index) => (
                                            <li key={index} className="resource-result-item">
                                                <div className="resource-result-info">
                                                    <span className={`resource-icon resource-icon-${result.type}`}>
                                                        {getResourceIcon(result.type)}
                                                    </span>
                                                    <div className="resource-details">
                                                        <h4>{result.title}</h4>
                                                        <p dangerouslySetInnerHTML={{ __html: result.description }} />
                                                        <div className="resource-url">
                                                            <a 
                                                                href={result.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="preview-link"
                                                            >
                                                                Preview <FaExternalLinkAlt />
                                                            </a>
                                                            <small>{truncateUrl(result.url)}</small>
                                                        </div>
                                                        {result.thumbnail && (
                                                            <div className="resource-thumbnail">
                                                                <img src={result.thumbnail} alt={result.title} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="commonBtn add-resource-btn" 
                                                    onClick={() => addResourceHandler(result)}
                                                    disabled={!selectedLectureForResource}
                                                >
                                                    Add to Lecture
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : resourceQuery ? (
                                    <div className="no-results">
                                        <p>No resources found. Try a different search term or resource type.</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Lectures list - always visible */}
                    <div className="lectures-list">
                        <h3>Available Lectures</h3>
                        {lectures?.length > 0 ? (
                            lectures.map((e, i) => (
                                <div key={e._id} className="lecture-item">
                                    <div
                                        onClick={() => getLecture(e._id)}
                                        className={`lec-no ${lecture?._id === e._id ? "active" : ""}`}
                                    >
                                        {i + 1}. {e.title} {
                                            progress && progress[0]?.completedLectures?.includes(e._id) && <span style={{ color: "green" }}>
                                                <TiTick />
                                            </span>
                                        }
                                    </div>

                                    {user?.role === "admin" && (
                                        <button
                                            className="commonBtn delete-btn"
                                            onClick={() => deleteLectureHandler(e._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No lectures found</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Lecture;