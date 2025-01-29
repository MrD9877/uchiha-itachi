export class PeerService {
  public peer: RTCPeerConnection | undefined | null;
  constructor() {
    if (!this.peer && typeof window !== "undefined") {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
          },
        ],
      });
    }
  }
  async initializePeerConnection() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
        },
      ],
    });
  }
  async getAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | undefined> {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setRemoteDescription(ans: RTCSessionDescriptionInit): Promise<void> {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer(): Promise<RTCSessionDescriptionInit | undefined> {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
  isConnected(): boolean | string {
    if (this.peer) {
      return this.peer.iceConnectionState === "connected";
    }
    return false;
  }

  closeConnection() {
    if (this.peer) {
      this.peer.close();

      const localStreams = this.peer.getSenders();
      localStreams.forEach((sender) => {
        const track = sender.track;
        if (track) {
          track.stop();
        }
      });

      this.peer = null; // Optionally set the peer to null to free the reference
    }
  }
}
let peer = new PeerService();
export default peer;
