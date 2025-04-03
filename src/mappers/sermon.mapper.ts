import { DeletedSermonDTO, SermonDTO } from "../dtos/sermon.dto";
import { ISermonDoc, IUserDoc } from "../utils/interface.util";

class SermonMapper {
  constructor() {}


  /**
   * @name mapSermon
   * @param sermon
   * @returns SermonDTO
   * @description Converts a sermon document into a DTO for API responses.
   */
  public async mapSermon(sermon: ISermonDoc): Promise<SermonDTO> {
    const result: SermonDTO = {
      id: sermon.id.toString(),
      title: sermon.title,
      description: sermon.description,
      duration: sermon.duration,
      category: sermon.category,
      sermonUrl: sermon.sermonUrl,
      imageUrl: sermon.imageUrl,
      tags: sermon.tags,
      isPublic: sermon.isPublic,
      totalPlay: sermon.totalPlay || 0,
      totalShares: sermon.totalShares || 0,
      // totalShares: sermon.totalShares?.count || 0,
      isSeries: sermon.isSeries,
      state: sermon.state,
      status: sermon.status,
      preacher: sermon.preacher?.toString(),
      series: sermon.series?.toString(),
      staff: sermon.staff?.toString(),
      playlist: sermon.playlist?.toString(),
      library: sermon.library?.toString(),
      createdBy: sermon.createdBy?.toString(),
      createdAt: sermon.createdAt,
      updatedAt: sermon.updatedAt,
    };

    return result;
  }

    /**
   * @name mapDeletedSermon
   * @param sermon
   * @returns DeletedSermonDTO[]
   * @description Converts deleted sermon data for structured responses.
   */
    public async mapDeletedSermon(sermon: ISermonDoc): Promise<DeletedSermonDTO[]> {
        
        const result: DeletedSermonDTO[] = sermon.deletedSermons.map(deleted => ({
          id: deleted.id.toString(),
          deletedBy: deleted.deletedBy.toString(),
          deletedAt: deleted.deletedAt,
          reason: deleted.reason ?? undefined,
        }));

        return result
      }
    


}

export default new SermonMapper();
