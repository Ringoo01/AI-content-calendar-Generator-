  import type { PostIdea, ConnectionKey } from '../types';

  /**
   * Helper function to convert a blob URL to a base64 string.
   * This is necessary for sending video data to the backend.
   */
  const blobUrlToBase64 = (blobUrl: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          // result is "data:mime/type;base64,the-base64-string"
          // We want to return the base64 part and the mime type
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read blob as Data URL."));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * Opens an OAuth popup and listens for a message to complete the connection flow.
   * This is separated into a helper to keep the main logic clean.
   */
  const waitForMetaAuth = (): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve, reject) => {
        const authUrl = 'http://localhost:5000/connect/meta';
        const authWindow = window.open(authUrl, '_blank', 'width=600,height=700,noopener,noreferrer');
        
        const messageListener = (event: MessageEvent) => {
            // For local development, the backend serves the auth callback from this origin.
            // In production, this should be the actual domain of your backend.
            const expectedOrigin = 'http://localhost:5000';
            if (event.origin !== expectedOrigin) {
                console.warn(`Message from unexpected origin: ${event.origin}. Expected: ${expectedOrigin}`);
                return;
            }
            
            if (event.data?.source === 'meta-oauth-success') {
                window.removeEventListener('message', messageListener);
                if (authWindow) authWindow.close();
                resolve({ success: true, message: 'Successfully connected to Meta.' });
            } else if (event.data?.source === 'meta-oauth-error') {
                window.removeEventListener('message', messageListener);
                if (authWindow) authWindow.close();
                // Reject with an object to be consistent with how the caller handles errors
                reject({ success: false, message: event.data.message || 'Meta connection failed.' });
            }
        };
        
        window.addEventListener('message', messageListener);

        // Handle the case where the user closes the popup manually
        const checkWindowClosed = setInterval(() => {
            if (authWindow?.closed) {
                clearInterval(checkWindowClosed);
                window.removeEventListener('message', messageListener);
                // We don't know if it was a success or failure, but the user cancelled.
                // We can reject to ensure the loading spinner stops.
                reject({ success: false, message: 'Connection process cancelled.' });
            }
        }, 500);
    });
  };


  /**
   * Handles connecting to or disconnecting from a social media platform.
   * For 'meta', this function initiates a real OAuth 2.0 flow.
   * For other platforms, it simulates the connection.
   *
   * @param platform - The key of the platform to connect to.
   * @param isDisconnecting - Whether the user is disconnecting.
   * @returns A promise that resolves with a success or error message.
   */
  export const handleConnection = async (platform: ConnectionKey, isDisconnecting: boolean): Promise<{ success: boolean; message: string }> => {
    if (platform === 'meta') {
        if (isDisconnecting) {
            // --- Real Disconnect ---
            try {
                const response = await fetch('http://localhost:5000/disconnect/meta', { method: 'POST' });
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ message: 'Failed to disconnect from the server.' }));
                  throw new Error(errorData.message);
                }
                const data = await response.json();
                return { success: true, message: data.message };
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred during disconnect.';
                throw { success: false, message };
            }
        } else {
            // --- Real OAuth 2.0 Connect Flow ---
            return waitForMetaAuth();
        }
    } else {
        // --- Simulation for other platforms ---
        console.log(`Simulating ${isDisconnecting ? 'disconnection from' : 'connection to'} ${platform}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const message = isDisconnecting
            ? `Successfully disconnected from ${platform}.`
            : `Successfully connected to ${platform}.`;
        return { success: true, message: `${message} (Simulation)` };
    }
  };


  /**
   * Publishes a post to a social media platform.
   * For 'meta', it makes a real API call to a local backend server.
   * For other platforms, it simulates the API call.
   *
   * @param platform - The key of the platform to publish to.
   * @param post - The content of the post.
   * @param visualUrl - The URL of the generated image or video (if any).
   * @returns A promise that resolves with a success message from the API call.
   */
  export const publishPost = async (
    platform: ConnectionKey,
    post: PostIdea,
    visualUrl: string | null
  ): Promise<{ success: boolean, message: string }> => {
    console.log(`--- Preparing to publish to ${platform.toUpperCase()} ---`);

    // Use the real backend for Meta, simulate for others.
    if (platform === 'meta') {
      const backendApiUrl = 'http://localhost:5000/publish/meta';
      console.log(`Making a REAL network request to: POST ${backendApiUrl}`);
      
      try {
        // Define the payload structure for the backend
        const payload: { message: string; photo_data?: string; video_data?: string; video_mime_type?: string; } = {
          message: `${post.caption}\n\n${post.hashtags}`,
        };

        // If a visual is available, process it and add to payload
        if (visualUrl) {
            if (visualUrl.startsWith('data:image')) {
                // Handle image data URL (already base64)
                payload.photo_data = visualUrl.split(',')[1];
            } else if (visualUrl.startsWith('blob:')) {
                // Handle video blob URL
                const dataUrl = await blobUrlToBase64(visualUrl);
                const [header, base64data] = dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1];
                
                payload.video_data = base64data;
                payload.video_mime_type = mimeType || 'video/mp4';
            }
        }

        const apiResponse = await fetch(backendApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const responseData = await apiResponse.json();
        
        if (!apiResponse.ok) {
          throw new Error(responseData.error || `Failed to publish to ${platform}.`);
        }
        
        console.log('--- REAL POST SUCCEEDED ---');
        return { success: true, message: responseData.message || `Post published successfully to Meta! Post ID: ${responseData.id}` };

      } catch (error) {
        console.error('--- REAL POST FAILED ---');
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Error during publishing:', errorMessage);
        // Provide a helpful error message if the server is not running.
        if (errorMessage.includes('Failed to fetch')) {
            throw new Error(`Could not connect to the local server. Is the backend running on http://localhost:5000?`);
        }
        throw new Error(`Failed to publish to ${platform}: ${errorMessage}`);
      }

    } else {
      // --- Simulation for other platforms ---
      console.log(`Simulating publishing for ${platform.toUpperCase()}. In a real app, this would also call a backend.`);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const simulatedResponse = {
          success: true,
          message: `Post successfully published to ${platform}! (Simulation)`,
        };
        console.log(`--- SIMULATION SUCCEEDED ---`);
        return simulatedResponse;
      } catch (error) {
        console.error(`--- SIMULATION FAILED ---`);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        throw new Error(`Failed to publish to ${platform}: ${errorMessage}`);
      }
    }
  };