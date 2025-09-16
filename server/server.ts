// FIX: The import syntax for Express was incorrect for an ES module target.
// Switched from `import express = require('express')` to the standard ES module import `import express from 'express'`.
// This resolves the "Import assignment cannot be used" error and subsequent type overload errors on `app.use`.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import { Buffer } from 'buffer';

// Load environment variables from .env file in the server directory
dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '50mb' })); // Increased limit for video uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- In-Memory Token Store ---
// In a production app, this would be a secure database (e.g., Redis, PostgreSQL).
// For this demo, we'll store the acquired Page Access Token in a variable.
let pageAccessToken: string | null = null;


// --- Meta OAuth 2.0 Endpoints ---

// 1. Kicks off the OAuth flow by redirecting the user to Facebook's login dialog.
app.get('/connect/meta', (req, res) => {
    const { META_APP_ID, META_REDIRECT_URI } = process.env;
    if (!META_APP_ID || !META_REDIRECT_URI) {
        return res.status(500).send('Server configuration error: Missing Meta App credentials.');
    }
    
    // These are the permissions required to manage and post content to a Facebook Page.
    const scope = 'pages_show_list,pages_manage_posts,pages_read_engagement';
    
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${META_REDIRECT_URI}&scope=${scope}&response_type=code`;
    
    console.log('Redirecting user to Meta for authorization...');
    res.redirect(authUrl);
});

// 2. Facebook redirects the user here after they approve/deny the request.
app.get('/connect/meta/callback', async (req, res) => {
    const { code } = req.query;
    const { META_APP_ID, META_APP_SECRET, META_REDIRECT_URI, META_PAGE_ID } = process.env;

    const sendAuthResultToClient = (status: 'success' | 'error', message?: string) => {
        const source = status === 'success' ? 'meta-oauth-success' : 'meta-oauth-error';
        res.send(`
            <script>
                window.opener.postMessage({ source: "${source}", message: "${message || ''}" }, "*");
                window.close();
            </script>
        `);
    };

    if (!code) {
        console.error('OAuth callback error: No code received.');
        return sendAuthResultToClient('error', 'Authorization was cancelled.');
    }

    try {
        console.log('OAuth callback received. Exchanging code for access token...');
        
        // --- Step 1: Exchange code for a short-lived User Access Token ---
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${META_REDIRECT_URI}&client_secret=${META_APP_SECRET}&code=${code}`;
        const tokenResponse = await axios.get(tokenUrl);
        const userAccessToken = tokenResponse.data.access_token;
        
        if (!userAccessToken) {
            throw new Error("Could not retrieve user access token.");
        }
        console.log('User access token received.');

        // --- Step 2: Use the User Token to get a permanent Page Access Token ---
        const accountsUrl = `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`;
        const accountsResponse = await axios.get(accountsUrl);

        // Find the specific page the user wants to connect to (from .env)
        const pageData = accountsResponse.data.data.find((page: any) => page.id === META_PAGE_ID);

        if (!pageData || !pageData.access_token) {
            throw new Error(`Could not find Page with ID ${META_PAGE_ID} or permission was not granted.`);
        }
        
        // This is the permanent token we need to publish content.
        pageAccessToken = pageData.access_token;
        
        console.log(`Successfully retrieved and stored Page Access Token for Page ID: ${META_PAGE_ID}`);
        sendAuthResultToClient('success');

    } catch (error: any) {
        console.error('--- Meta OAuth Callback Error ---');
        const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred.';
        console.error(errorMessage);
        sendAuthResultToClient('error', errorMessage);
    }
});

// 3. Endpoint to clear the stored access token.
app.post('/disconnect/meta', (req, res) => {
    pageAccessToken = null;
    console.log('User disconnected from Meta. Access token cleared.');
    res.status(200).json({ success: true, message: 'Successfully disconnected from Meta.' });
});


// --- Meta API Publishing Endpoint ---
app.post('/publish/meta', async (req, res) => {
    // This endpoint now uses the dynamically acquired `pageAccessToken`.
    const { message, photo_data, video_data, video_mime_type } = req.body;
    const pageId = process.env.META_PAGE_ID;

    // --- Validation ---
    if (!pageAccessToken) {
        return res.status(401).json({ error: 'Not authenticated with Meta. Please connect your account first.' });
    }
    if (!pageId) {
        return res.status(500).json({ error: 'Server configuration error: Missing META_PAGE_ID.' });
    }
    if (!message) {
        return res.status(400).json({ error: 'Missing required field: message' });
    }

    try {
        let response;
        if (video_data) {
            // --- VIDEO UPLOAD (multi-step resumable upload process) ---
            console.log("Attempting to publish a post with a video...");
            const videoBuffer = Buffer.from(video_data, 'base64');
            const graphApiUrl = `https://graph-video.facebook.com/v19.0/${pageId}/videos`;

            const initResponse = await axios.post(graphApiUrl, {
                access_token: pageAccessToken,
                upload_phase: 'start',
                file_size: videoBuffer.length,
            });
            const { video_id, upload_session_id } = initResponse.data;

            await axios.post(
                graphApiUrl,
                videoBuffer,
                {
                    headers: { 'Authorization': `OAuth ${pageAccessToken}`, 'Content-Type': video_mime_type || 'video/mp4' },
                    params: { upload_phase: 'transfer', upload_session_id: upload_session_id, start_offset: 0 },
                }
            );

            const finishResponse = await axios.post(graphApiUrl, {
                access_token: pageAccessToken,
                upload_phase: 'finish',
                upload_session_id: upload_session_id,
                description: message,
            });

            if (finishResponse.data.success) {
                return res.status(200).json({ success: true, id: video_id, message: `Video upload successful! It may take a few moments to process. Video ID: ${video_id}` });
            } else {
                throw new Error("Failed to finalize video upload.");
            }

        } else if (photo_data) {
            // --- PHOTO UPLOAD to /photos endpoint ---
            console.log("Attempting to publish a post with a photo...");
            const photoBuffer = Buffer.from(photo_data, 'base64');
            const graphApiUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;

            const form = new FormData();
            form.append('access_token', pageAccessToken);
            form.append('message', message);
            form.append('source', photoBuffer, { filename: 'upload.jpg', contentType: 'image/jpeg' });

            response = await axios.post(graphApiUrl, form, { headers: form.getHeaders() });
            const postId = response.data.post_id || response.data.id;
            return res.status(200).json({ success: true, id: postId, message: 'Image post published successfully!' });

        } else {
            // --- TEXT-ONLY POST to /feed endpoint ---
            console.log("Attempting to publish a text-only post...");
            const graphApiUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;

            response = await axios.post(graphApiUrl, {
                message: message,
                access_token: pageAccessToken,
            });
            return res.status(200).json({ success: true, id: response.data.id, message: 'Text post published successfully!' });
        }
        
    } catch (error: any) {
        console.error('--- Meta API Error ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            const apiError = error.response.data.error;
            const errorMessage = apiError ? `(${apiError.code}) ${apiError.message}` : 'An unknown API error occurred.';
            return res.status(500).json({ error: `Failed to publish to Meta: ${errorMessage}` });
        } else {
            console.error('Error:', error.message);
            return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
        }
    }
});


// Start the server
app.listen(port, () => {
    console.log(`🚀 Backend server is running at http://localhost:${port}`);
    console.log('Ensure you have a server/.env file with your Meta App credentials.');
    console.log('Waiting for requests from the frontend...');
});