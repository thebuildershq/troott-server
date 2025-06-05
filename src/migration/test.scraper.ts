import { PassThrough } from 'stream';
import axios from 'axios';
import { getDownloadLinksFromPage } from './scraper';
import UploadService  from '../services/upload.service';

export async function scrapeAndProcessSermons() {
  const uploadService = UploadService;
  const targetUrl = 'https://naijasermons.com.ng/apostle-joshua-selman-2020-messages/';

  try {
    // Step 1: Scrape download links
    const downloadLinks = await getDownloadLinksFromPage(targetUrl);
    console.log(`Found ${downloadLinks.length} sermons to process`);

    // Step 2: Process each link
    for (const link of downloadLinks) {
      try {
        console.log(`Processing sermon: ${link.title}`);

        // Download the audio stream
        const response = await axios({
          method: 'get',
          url: link.url,
          responseType: 'stream'
        });

        // Create two PassThrough streams
        const uploadStream = new PassThrough();
        const metadataStream = new PassThrough();

        // Pipe the response to both streams
        response.data.pipe(uploadStream);
        response.data.pipe(metadataStream);

        // Get content length from headers
        const contentLength = parseInt(response.headers['content-length'] || '0', 10);
        const contentType = response.headers['content-type'] || 'audio/mpeg';

        // Handle the upload
        const uploadResult = await uploadService.handleUpload({
          stream: uploadStream,
          streamForMetadata: metadataStream,
          info: {
            filename: `${link.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
            mimeType: contentType
          },
          mimeType: contentType,
          fileName: `${link.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
          size: contentLength
        });

        // Prepare sermon data
        const sermonData = await prepareSermonData(link, uploadResult, uploadResult.metadata);

        // Publish the sermon
        const publishedSermon = await uploadService.handleSermonPublish(sermonData);
        console.log(`Successfully processed sermon: ${publishedSermon.title}`);

      } catch (error) {
        console.error(`Error processing sermon ${link.title}:`, error);
        continue; // Continue with next sermon even if one fails
      }
    }

    console.log('Finished processing all sermons');

  } catch (error) {
    console.error('Error in sermon scraping process:', error);
    throw error;
  }
}