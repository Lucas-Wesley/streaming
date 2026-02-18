import type { StreamDAO } from "../DAO/StreamDAO";

export class StreamService {

  constructor(private streamDAO: StreamDAO) {
  }

  async create(stream: any) {
    const onlineStream = await this.streamDAO.getOnlineByAccountId(stream.account_id);
    if (onlineStream) {
      throw new Error("Já existe uma live online para esta conta. Encerre-a antes de iniciar outra.");
    }

    const streamData = {
      stream_id: crypto.randomUUID(),
      account_id: stream.account_id,
      title: stream.title,
      stream_key: stream.stream_key,
      is_online: true,
    };

    await this.streamDAO.create(streamData);
    return streamData;
  }

  async getByStreamKey(streamKey: string) {
    const stream = await this.streamDAO.getByStreamKey(streamKey);
    if (!stream) {
      throw new Error("Stream not found");
    }
    return stream;
  }

  async getById(streamId: string) {
    const stream = await this.streamDAO.getById(streamId);
    if (!stream) {
      throw new Error("Stream not found");
    }
    return stream;
  }

  async listByAccountId(accountId: string) {
    return this.streamDAO.listByAccountId(accountId);
  }

  async endStream(streamId: string) {
    const stream = await this.streamDAO.getById(streamId);
    if (!stream) {
      throw new Error("Stream not found");
    }
    await this.streamDAO.updateOnlineStatus(streamId, false);
    return { ...stream, is_online: false };
  }
}