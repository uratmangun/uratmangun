interface ImagenRequest {
  model: string;
  prompt: string;
  sessionToken?: string;
  parameters?: any[];
}

interface ImagenResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class ImagenAPIClient {
  private baseUrl = 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateImage';
  private apiKey: string;
  private cookies: string;
  private authToken: string;

  constructor(apiKey: string, cookies: string, authToken: string) {
    this.apiKey = apiKey;
    this.cookies = cookies;
    this.authToken = authToken;
  }

  async generateImage(prompt: string, model: string = 'models/imagen-4.0-ultra-generate-preview-06-06'): Promise<ImagenResponse> {
    try {
      // Default session token (you may need to extract this dynamically)
      const sessionToken = "!eHuleyPNAAaJMyVRqTNCExqCYhkjU9Q7ADQBEArZ1Ig_ZSQtLWGX7MrpVA3pD9f2aXztptazJ2A2G8ogCb6nb0ooAI7wCzWaO7TV-W9hAgAAAFtSAAAACGgBB34AQRc4DQeVjixnbvt2QA0qw9GxxfFaV8oSK2MgLnzv0-2sB8ySHxAbn2zQoED9R5htQR80i-UOWg3BaQz7JVqBabN_mQNuKEKBni2eaCnUVGZH-zDy7vdU30dOlrU8peWSL8oxbjP2h62reo1S5HfOL8cPLMbPciU41WUfTVS4o3BNEH6gtQZFHWENL2RT3lzP4UAaYu8cZfzlfPErF-nrPXCPt9bPXYt1GfXlXc7c42Kznboxoo_6SGQGrBTOq_TbKBI5i35VRTWI1xHGjVah4iJkRFWkaFxzvx8VVdvRrxETkXHGhBtK7xGWsOqlRWGByh-jkyhoxHtNpUXh1U6eZ7B82BxUaaefSJSqlChyG77tSpxQm_Cdc-f8Umhj7PakRioj0lMkKJbHKQr43SBj1X7xh-yjAqCPVuVVjtuw41XCENkVvwCkQZo1fdhiVZV7PGsR7eG2_-l6ctOsmLnQ1qtWcD1PuBdtMtzECVhsFYypLPEGi7ZFp-6npiKWtJw8GYcLbTRfQHdEmBVf6vhbN7ggiqfjHplUm2EO0tleRkR8rf9phgiPco4O3TEPidMbyRku37RlpDHMGEIZJ17p5EaJaH19vCiAfhWqJnae_aHy4kCGbRrgz6HCL_QSa7Txl2xpPJj-prlmJduqQQj6QQCv0-Oegz8ZEbd5ctAjMy1I_XzU27rR3I0wCXWR0EOkzfkeJ902Gv-87tZGm4M3H93H81pSfejnVxcxqFltZTXw-f2O9djiGePtSn8mru136xDHmWo-yAFnb2neTy4rZy6_ddZ3wacpOhT4Ia4AykXkpH3I8MFld4suPf3Uuu9NYtqbwRw4UaLEC1YfiCS33WuRZ3pBq0WrEAYke4Ujnqjf9RUyf46edfhrKsoEcKUSAuNggX7ZjxcN2A4l5BXUBPuEiZiTDkLM1o2rNFUSHq9nrX97By9Tw97ssPml1r1B6g25LAWvVRTjueS4vmPH0ACROjaNQmIFbx0HA7MBq7PX4tTw31EaoMhpGD3zBTXgitGTzYFytp6_S8F4C2pdr8LBkKgy8lXTpEClO4dyKq-o0CIQsm0FY_N6G4qPihRclDnN0WjzrTbLNeoy30rPLs_11C2cDUNtAcTJ1ofOhOD8F6A6-BzCMnof_nq6eMgK404egvql_ZRSXkJLWhst4xGNyIXmp53mQ7VvOqbR7MzqBQcJPZanUfdRLkO6R3N0_qlSfW2i-ArnUYu6PqwOXXsqw7tA5ZcGNmRkxpNiSUWra_w";
      
      const requestBody = [
        model,
        prompt,
        sessionToken,
        [1, null, "1:1"]
      ];

      const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': this.authToken,
        'Content-Type': 'application/json+protobuf',
        'Cookie': this.cookies,
        'Origin': 'https://aistudio.google.com',
        'Referer': 'https://aistudio.google.com/',
        'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Linux"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-Authuser': '0',
        'X-Goog-Ext-519733851-Bin': 'CAESAUwwATgEQAA=',
        'X-User-Agent': 'grpc-web-javascript/0.1'
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Error generating image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Example usage function
async function generateImageExample() {
  // You'll need to extract these from your browser session
  const apiKey = 'AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs';
  const cookies = 'YOUR_COOKIES_HERE'; // Extract from browser
  const authToken = 'YOUR_AUTH_TOKEN_HERE'; // Extract from browser
  
  const client = new ImagenAPIClient(apiKey, cookies, authToken);
  
  const result = await client.generateImage('a funny cat playing with yarn');
  
  if (result.success) {
    console.log('Image generated successfully:', result.data);
  } else {
    console.error('Failed to generate image:', result.error);
  }
}

// Export for use in other modules
export { ImagenAPIClient, type ImagenRequest, type ImagenResponse };

// Uncomment to run the example
// generateImageExample();
