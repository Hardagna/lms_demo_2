import axios from "axios";
import * as cheerio from "cheerio";
import Resource from "../models/Resource.js";
import Lecture from "../models/Lecture.js";
import dotenv from "dotenv";

dotenv.config();

// Main function to search web resources
export const searchResources = async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    let results = [];
    let databaseResults = [];
    
    // First, search for resources in the database that match the query
    const dbSearchRegex = new RegExp(query, 'i'); // Case-insensitive search
    const dbSearchQuery = {
      $or: [
        { title: { $regex: dbSearchRegex } },
        { description: { $regex: dbSearchRegex } }
      ]
    };
    
    // Filter by type if specified
    if (type && type !== 'all') {
      dbSearchQuery.type = type;
    }
    
    // Search the database for matching resources
    databaseResults = await Resource.find(dbSearchQuery)
      .populate('lecture', 'title') // Include lecture title for context
      .limit(10);
    
    // Format database results to match the structure of online results
    databaseResults = databaseResults.map(resource => {
      // Normalize the URL to prevent path issues
      let normalizedUrl = resource.url;
      if (normalizedUrl.startsWith('//')) {
        normalizedUrl = normalizedUrl.replace('//', '/');
      }
      
      return {
        title: resource.title,
        url: normalizedUrl,
        type: resource.type,
        description: resource.description || `${resource.type} resource for ${resource.lecture?.title || 'a lecture'}`,
        isLocalResource: true,
        lectureId: resource.lecture?._id?.toString(),  // Ensure it's a string
        lectureName: resource.lecture?.title,
        resourceId: resource._id.toString(),  // Ensure it's a string
        isUploadedFile: resource.isUploadedFile || false
      };
    });
    
    // Based on the requested resource type, call the appropriate online search function
    switch (type) {
      case "pdf":
        results = await searchPDFs(query);
        break;
      case "video":
        results = await searchVideos(query);
        break;
      case "webpage":
        results = await searchWebpages(query);
        break;
      case "wikipedia":
        results = await searchWikipedia(query);
        break;
      case "audio":
        results = await searchAudio(query);
        break;
      default:
        // Search all types and combine results
        const [pdfs, videos, webpages, wikipedia, audio] = await Promise.all([
          searchPDFs(query).catch(err => {
            console.error("PDF search error:", err);
            return [];
          }),
          searchVideos(query).catch(err => {
            console.error("Video search error:", err);
            return [];
          }),
          searchWebpages(query).catch(err => {
            console.error("Webpage search error:", err);
            return [];
          }),
          searchWikipedia(query).catch(err => {
            console.error("Wikipedia search error:", err);
            return [];
          }),
          searchAudio(query).catch(err => {
            console.error("Audio search error:", err);
            return [];
          })
        ]);
        
        results = [...pdfs, ...videos, ...webpages, ...wikipedia, ...audio];
    }
    
    // Combine database resources with online resources
    const combinedResults = [...databaseResults, ...results];
    
    // Even if all search functions fail, database results might still have content
    if (!combinedResults.length) {
      return res.status(200).json({ results: [] });
    }
    
    res.status(200).json({ results: combinedResults });
  } catch (error) {
    console.error("Error in searchResources:", error);
    res.status(500).json({ message: `Error fetching resources: ${error.message}` });
  }
};

// Other controller functions remain the same
export const addResource = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, type, url, description } = req.body;
    
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    
    const resource = await Resource.create({
      title,
      type,
      url,
      description,
      lecture: lectureId
    });
    
    res.status(201).json({ 
      message: "Resource added successfully", 
      resource 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

export const getLectureResources = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const resources = await Resource.find({ lecture: lectureId });
    res.status(200).json({ resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const resource = await Resource.findByIdAndDelete(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.status(200).json({ 
      message: "Resource deleted successfully", 
      resource 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// RESOURCE SEARCH IMPLEMENTATION FUNCTIONS

// Search for PDFs using Google Custom Search API
async function searchPDFs(query) {
  try {
    // Google Custom Search API requires API key and Custom Search Engine ID
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      console.warn("Google API key or Search Engine ID not configured. Using backup search method.");
      return searchPDFsBackup(query);
    }
    
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}+filetype:pdf`
    );
    
    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }
    
    return response.data.items.map(item => ({
      title: item.title,
      url: item.link,
      type: "pdf",
      description: item.snippet || `PDF document related to ${query}`
    }));
  } catch (error) {
    console.error("Error searching PDFs via Google API:", error.message);
    return searchPDFsBackup(query);
  }
}

// Backup PDF search using web scraping
async function searchPDFsBackup(query) {
  try {
    // Using a search engine that doesn't block scraping
    const response = await axios.get(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}+filetype:pdf`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results
    $('.result__body').each((i, element) => {
      if (i < 8) { // Limit results
        const titleElement = $(element).find('.result__title a');
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const description = $(element).find('.result__snippet').text().trim();
        
        if (url && url.toLowerCase().endsWith('.pdf')) {
          results.push({
            title,
            url,
            type: 'pdf',
            description
          });
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error("Error in backup PDF search:", error.message);
    return [];
  }
}

// Search for videos on YouTube
async function searchVideos(query) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.warn("YouTube API key not configured. Using backup search method.");
      return searchVideosBackup(query);
    }
    
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=8&type=video`
    );
    
    return response.data.items.map(item => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      type: "video",
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url
    }));
  } catch (error) {
    console.error("Error searching videos via YouTube API:", error.message);
    return searchVideosBackup(query);
  }
}

// Backup video search using web scraping
async function searchVideosBackup(query) {
  try {
    // Using Invidious API (alternative YouTube frontend) which doesn't require API key
    const response = await axios.get(
      `https://invidious.snopyta.org/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    
    return response.data.slice(0, 8).map(item => ({
      title: item.title,
      url: `https://www.youtube.com/watch?v=${item.videoId}`,
      type: "video",
      description: item.description || `Video about ${query}`,
      thumbnail: item.videoThumbnails?.[0]?.url
    }));
  } catch (error) {
    console.error("Error in backup video search:", error.message);
    // Return minimal results with common educational platforms
    return [
      {
        title: `${query} - YouTube Search Results`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        type: "video",
        description: `Search results for "${query}" on YouTube`
      },
      {
        title: `${query} - Khan Academy`,
        url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(query)}`,
        type: "video",
        description: `Khan Academy resources related to "${query}"`
      }
    ];
  }
}

// Search for webpages
async function searchWebpages(query) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      console.warn("Google API key or Search Engine ID not configured. Using backup search method.");
      return searchWebpagesBackup(query);
    }
    
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`
    );
    
    return response.data.items.map(item => ({
      title: item.title,
      url: item.link,
      type: "webpage",
      description: item.snippet || `Webpage about ${query}`
    }));
  } catch (error) {
    console.error("Error searching webpages via Google API:", error.message);
    return searchWebpagesBackup(query);
  }
}

// Backup webpage search
async function searchWebpagesBackup(query) {
  try {
    // Using a search engine that doesn't block scraping
    const response = await axios.get(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results
    $('.result__body').each((i, element) => {
      if (i < 8) { // Limit results
        const titleElement = $(element).find('.result__title a');
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const description = $(element).find('.result__snippet').text().trim();
        
        if (url && !url.toLowerCase().endsWith('.pdf')) { // Exclude PDFs
          results.push({
            title,
            url,
            type: 'webpage',
            description
          });
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error("Error in backup webpage search:", error.message);
    return [];
  }
}

// Search for Wikipedia articles
async function searchWikipedia(query) {
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&utf8=1`
    );
    
    if (!response.data.query || !response.data.query.search) {
      return [];
    }
    
    return response.data.query.search.map(item => ({
      title: item.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
      type: "wikipedia",
      description: item.snippet.replace(/<[^>]*>/g, '') || `Wikipedia article about ${item.title}`
    }));
  } catch (error) {
    console.error("Error searching Wikipedia:", error.message);
    return [
      {
        title: `${query} - Wikipedia Search`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        type: "wikipedia",
        description: `Search results for "${query}" on Wikipedia`
      }
    ];
  }
}

// Search for audio files
async function searchAudio(query) {
  try {
    const freesoundApiKey = process.env.FREESOUND_API_KEY;
    
    if (!freesoundApiKey) {
      console.warn("Freesound API key not configured. Using backup search method.");
      return searchAudioBackup(query);
    }
    
    const response = await axios.get(
      `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&token=${freesoundApiKey}&fields=id,name,description,previews&page_size=8`
    );
    
    if (!response.data.results || response.data.results.length === 0) {
      return searchAudioBackup(query);
    }
    
    return response.data.results.map(item => ({
      title: item.name,
      url: item.previews['preview-hq-mp3'],
      type: "audio",
      description: item.description || `Audio file related to ${query}`
    }));
  } catch (error) {
    console.error("Error searching audio via Freesound API:", error.message);
    return searchAudioBackup(query);
  }
}

// Backup audio search
async function searchAudioBackup(query) {
  // Return common audio educational platforms
  return [
    {
      title: `${query} - Podcasts on Spotify`,
      url: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
      type: "audio",
      description: `Spotify podcasts related to "${query}"`
    },
    {
      title: `${query} - Apple Podcasts`,
      url: `https://podcasts.apple.com/search?term=${encodeURIComponent(query)}`,
      type: "audio",
      description: `Apple podcasts related to "${query}"`
    },
    {
      title: `${query} - LibriVox Audiobooks`,
      url: `https://librivox.org/search?q=${encodeURIComponent(query)}&search_form=advanced`,
      type: "audio",
      description: `Free public domain audiobooks related to "${query}"`
    },
    {
      title: `${query} - SoundCloud`,
      url: `https://soundcloud.com/search?q=${encodeURIComponent(query)}`,
      type: "audio",
      description: `Audio tracks and podcasts related to "${query}" on SoundCloud`
    }
  ];
}

// Add this function to your existing resources.js controller

// Function to handle file uploads
export const uploadResourceFile = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, description, type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    
    // Create the resource with file information
    const resource = await Resource.create({
      title,
      type: type || determineResourceType(req.file.originalname),
      url: `/Uploads/${req.file.filename}`,
      description,
      lecture: lectureId,
      isUploadedFile: true
    });
    
    res.status(201).json({ 
      message: "Resource file uploaded successfully", 
      resource 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// Helper function to determine resource type based on file extension
function determineResourceType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  
  if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
    return 'pdf'; // Using 'pdf' category for documents
  } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
    return 'video';
  } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return 'image';
  } else {
    return 'document'; // Default
  }
}

// Add this function to enable copying resources between lectures

// Update the copyResource function for better error handling
export const copyResource = async (req, res) => {
  try {
    const { sourceResourceId, targetLectureId } = req.body;
    
    console.log("Copy resource request:", req.body);  // Debug log
    
    if (!sourceResourceId || !targetLectureId) {
      return res.status(400).json({ 
        message: "Source resource ID and target lecture ID are required" 
      });
    }
    
    // Find the source resource
    const sourceResource = await Resource.findById(sourceResourceId);
    
    if (!sourceResource) {
      console.log(`Resource with ID ${sourceResourceId} not found`);
      return res.status(404).json({ message: "Source resource not found" });
    }
    
    // Find the target lecture
    const targetLecture = await Lecture.findById(targetLectureId);
    
    if (!targetLecture) {
      console.log(`Lecture with ID ${targetLectureId} not found`);
      return res.status(404).json({ message: "Target lecture not found" });
    }
    
    console.log("Found source resource:", sourceResource);  // Debug log
    
    // Check if this resource already exists in the target lecture
    const existingResource = await Resource.findOne({
      title: sourceResource.title,
      lecture: targetLectureId
    });
    
    if (existingResource) {
      return res.status(400).json({ 
        message: "This resource already exists in the selected lecture" 
      });
    }
    
    // Create a new resource based on the source
    const newResource = new Resource({
      title: sourceResource.title,
      type: sourceResource.type,
      url: sourceResource.url,
      description: sourceResource.description || `Resource copied from another lecture`,
      lecture: targetLectureId,
      isUploadedFile: sourceResource.isUploadedFile
    });
    
    await newResource.save();
    
    res.status(201).json({
      message: "Resource copied successfully",
      resource: newResource
    });
  } catch (error) {
    console.error("Error copying resource:", error);
    res.status(500).json({ message: error.message });
  }
};