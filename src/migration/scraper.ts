import axios from "axios";
import cheerio from "cheerio";
import nodeUrl from "url";

export interface IDownloadLink {
    title: string;
    url: string;
  }

export async function getDownloadLinksFromPage(pageUrl: string) {
  
    const response = await axios.get(pageUrl);
  const $ = cheerio.load(response.data);

  const downloadLinks: IDownloadLink[] = [];

  $('a').each((i, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href');

    if (text.includes("Click here to Download") && href) {
      
        const parent = $(el).closest('p').text().split("Download")[0].trim();
      downloadLinks.push({
        title: parent || `Sermon ${i + 1}`,
        url: nodeUrl.resolve(pageUrl, href),
      });
    }
  });

  if (!downloadLinks.length) throw new Error("No download links found");

  return downloadLinks;
}
