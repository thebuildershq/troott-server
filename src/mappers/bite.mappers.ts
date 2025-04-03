import { EditSermonBiteDTO, SermonBiteDTO } from "../dtos/bite.dto";
import { ISermonBiteDoc } from "../utils/interface.util";

class BiteMapper {
  constructor() {}

  /**
   * @name mapSermonBite
   * @param sermonBite
   * @returns sermonBiteDTO
   */

  public async mapSermonBite(sermon: ISermonBiteDoc): Promise<SermonBiteDTO> {
    const result: SermonBiteDTO = {
      id: sermon.id.toString(),
      title: sermon.title,
      description: sermon.description,
      duration: sermon.duration,
      category: sermon.category,
      biteURL: sermon.biteURL,
      thumbnailUrl: sermon.thumbnailUrl,
      tags: sermon.tags,

      isPublic: sermon.isPublic,
      state: sermon.state,
      status: sermon.status,

      preacher: sermon.preacher.toString(),
      creator: sermon.creator?.toString(),
      playlist: sermon.playlist.map((p) => p.toString()),

      engagementStats: {
        totalViews: sermon.engagementStats.totalViews,
        totalLikes: sermon.engagementStats.totalLikes,
        totalShares: sermon.engagementStats.totalShares,
        totalSaves: sermon.engagementStats.totalSaves,
      },

      createdAt: sermon.createdAt,
      updatedAt: sermon.updatedAt,
    };

    return result;
  }

  public async mapEditSermonBite(dto: EditSermonBiteDTO): Promise<Partial<ISermonBiteDoc>> {
    const update: Partial<ISermonBiteDoc> = {};
  
    if (dto.title) update.title = dto.title;
    if (dto.description) update.description = dto.description;
    if (dto.category) update.category = dto.category;
    if (dto.thumbnailUrl) update.thumbnailUrl = dto.thumbnailUrl;
    if (dto.tags) update.tags = dto.tags;
    
    if (dto.isPublic !== undefined) update.isPublic = dto.isPublic;
    if (dto.state) update.state = dto.state;
    if (dto.status) update.status = dto.status;
  
    return update;
  }
  
}

export default new BiteMapper();
