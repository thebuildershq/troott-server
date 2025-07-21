import { createClient, RedisClientType } from "redis";
import colors from "colors";
import { IData, IOptions } from "../utils/interface.util";

class redisWrapper {
  public client: RedisClientType | null = null;

  public async connect(options: IOptions) {
    if (this.client?.isOpen) return;

    this.client = createClient({
      //url: "redis://localhost:6379" ,
      url: `redis://${options.user}:${options.password}@${options.host}:${options.port}`,
      socket: {
        //tls: true,
        connectTimeout: 10000, // optional: increase timeout
      },
    });

    this.client.on("error", (err: any) => {
      console.error(colors.red.bold("Redis Error:"), err);
    });

    await this.client.connect();
    console.log(colors.yellow.inverse("Connected to REDIS"));
  }

  public async keepData(data: IData, exp: number) {
    const value = JSON.stringify(data.value);
    return await this.client!.set(data.key, value, { EX: exp });
  }

  public async fetchData<T = any>(key: string): Promise<T | null> {
    const data = await this.client!.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async deleteData(key: string) {
    await this.client!.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    const exists = await this.client!.exists(key);
    return exists === 1;
  }

  public async paginate(data: any[], page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return data.slice(start, end);
  }
}

export default new redisWrapper();
