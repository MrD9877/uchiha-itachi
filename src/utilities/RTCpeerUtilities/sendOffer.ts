import { RTCSendOfferObj } from "../../hooks/useRTCPeer";
import { SocketActions } from "../actions/peerActions";
import peer from "./peer";
import { Socket } from "socket.io-client";

export const sendOffer = async (token: string, coonectId: string, socket: Socket): Promise<void> => {
  const offer = await peer.getOffer();
  const data: RTCSendOfferObj = { offer, from: token, to: coonectId };
  socket.emit(SocketActions.sendOffer, data);
};
