import type {ChannelDAO} from "../DAO/ChannelDAO";

export class ChannelService {

  constructor(private channelDAO: ChannelDAO) {
  }


  async listFollowing(accountId: string) {
    return this.channelDAO.listFollowing(accountId);
  }

  async listLive() {
    return this.channelDAO.listLive();
  }
}