import Bull from 'bull';
import { EmailPriority } from '../utils/enums.util';

interface QueuedEmail {
  recipient: string;
  subject: string;
  content: any;
  type: string;
  template?: string;
  attachments?: any[];
}

export class EmailQueue {
  private queue: Bull.Queue;

  constructor() {
    this.queue = new Bull('email-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.setupQueueHandlers();
  }

  private setupQueueHandlers() {
    this.queue.on('completed', (job) => {
      console.log(`Email job ${job.id} completed`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Email job ${job.id} failed:`, err);
    });
  }

  public async add(email: QueuedEmail, priority: EmailPriority): Promise<void> {
    const options: Bull.JobOptions = {
      priority: this.getPriorityLevel(priority),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    };

    await this.queue.add(email, options);
  }

  private getPriorityLevel(priority: EmailPriority): number {
    switch (priority) {
      case EmailPriority.HIGH:
        return 1;
      case EmailPriority.MEDIUM:
        return 2;
      case EmailPriority.LOW:
        return 3;
      default:
        return 2;
    }
  }

  public async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}