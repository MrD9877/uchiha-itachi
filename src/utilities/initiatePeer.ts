import peer from "./peer";

const initiatePeerpromise = new Promise<void>(async (resolve, reject) => {
  try {
    peer.closeConnection();
    await peer.initializePeerConnection();
    resolve();
  } catch {
    reject();
  }
});

export default initiatePeerpromise;
