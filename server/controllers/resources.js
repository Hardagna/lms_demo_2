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
    
    // Based on the requested resource type, call the appropriate search function
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
        
        // Even if all search functions fail, return empty results instead of error
        if (!results.length) {
          return res.status(200).json({ results: [] });
        }
    }
    
    res.status(200).json({ results });
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