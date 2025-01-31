import peer from "../RTCpeerUtilities/peer";

const initiatePeerpromise = async () => {
  try {
    peer.closeConnection();
    await peer.initializePeerConnection();
  } catch {}
};

export default initiatePeerpromise;
