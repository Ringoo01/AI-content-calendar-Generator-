import type { PostIdea, ConnectionKey } from '../types';

/**
 * Simulates the OAuth 2.0 connection flow.
 * In a real application, this would redirect the user to the platform's
 * authorization screen. A backend server would then handle the callback,
 * exchange the authorization code for an access token, and store it securely.
 *
 * @param platform - The key of the platform to connect to.
 * @param isDisconnecting - Whether the user is disconnecting.
 * @returns A promise that resolves with a success or error message.
 */
export const handleConnection = (platform: ConnectionKey, isDisconnecting: boolean): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve, reject) => {
    console.log(`Simulating ${isDisconnecting ? 'disconnection from' : 'connection to'} ${platform}...`);

    // Simulate the OAuth pop-up window
    const authWindow = window.open('', '_blank', 'width=500,height=600');
    if (authWindow) {
        authWindow.document.write(`
            <html>
                <head><title>Connecting...</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background-color:#f0f4f8;}.container{text-align:center;padding:20px;background:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);}.spinner{border:4px solid rgba(0,0,0,0.1);width:36px;height:36px;border-radius:50%;border-left-color:#4f46e5;animation:spin 1s ease infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style></head>
                <body><div class="container"><h2>Connecting to ${platform}...</h2><p>Please wait while we redirect you. This is a simulation.</p><div class="spinner"></div></div></body>
            </html>
        `);
        setTimeout(() => {
            authWindow.close();
            console.log(`Simulation complete for ${platform}.`);
            const message = isDisconnecting
                ? `Successfully disconnected from ${platform}.`
                : `Successfully connected to ${platform}.`;
            resolve({ success: true, message });
        }, 2500); // Simulate user logging in and authorizing
    } else {
      reject({ success: false, message: 'Could not open authentication pop-up.' });
    }
  });
};


/**
 * Publishes a post to a social media platform.
 * For 'meta', it makes a real API call to a local Python backend server.
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
    const backendApiUrl = 'http://127.0.0.1:5000/publish/meta';
    console.log(`Making a REAL network request to: POST ${backendApiUrl}`);
    
    try {
      const payload: { message: string, link?: string, photo_url?: string } = {
        message: `${post.caption}\n\n${post.hashtags}`,
      };

      // If there's a visual, we decide whether to send it as a photo or a link.
      // The Graph API is picky about video uploads, so sending a link is more reliable for this example.
      if (visualUrl) {
        if (visualUrl.startsWith('data:image')) {
          // For simplicity, we won't upload the blob, we'll reference a placeholder.
          // A real implementation would upload the blob to a host and get a public URL.
          payload.photo_url = 'https://aistudio.google.com/assets/img/og_image.png'; // Placeholder URL
        } else {
          payload.link = visualUrl;
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
      return { success: true, message: `Post published successfully to Meta! Post ID: ${responseData.id}` };

    } catch (error) {
      console.error('--- REAL POST FAILED ---');
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Error during publishing:', errorMessage);
      // Provide a helpful error message if the server is not running.
      if (errorMessage.includes('Failed to fetch')) {
          throw new Error(`Could not connect to the local server. Is the Python backend running on http://127.0.0.1:5000?`);
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
