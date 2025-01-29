"use client";
import { SocketActions } from "./utilities/actions/peerActions";
import { socket } from "./utilities/socket";
import React, { useEffect } from "react";
import peer from "./utilities/peer";
import initiatePeerpromise from "utilities/initiatePeer";

type RTCComponentType = {
  token: string;
  coonectId: string;
};

type RTCSendOfferObj = {
  offer: RTCSessionDescriptionInit | undefined;
  from: string;
  to: string;
};

type RTCReceiveOfferObj = {
  from: string;
  offer: RTCSessionDescriptionInit | undefined;
};
type RTCReceiveAnswerObj = {
  from: string;
  answer: RTCSessionDescriptionInit | undefined;
};

type RTCSendAnswerObj = {
  answer: RTCSessionDescriptionInit | undefined;
  from: string;
  to: string;
};

type RCTConnectionEstablished = {
  success: boolean;
  from: string;
  to: string;
};

export default function RTCPeerConnect({ token, coonectId }: RTCComponentType) {
  if (!peer.peer) {
  }
  const sendOffer = async (): Promise<void> => {
    const offer = await peer.getOffer();
    const data: RTCSendOfferObj = { offer, from: token, to: coonectId };
    socket.emit(SocketActions.sendOffer, data);
  };

  const handleOffer = async ({ offer, from }: RTCReceiveOfferObj): Promise<void> => {
    if (offer) {
      const answer = await peer.getAnswer(offer);
      const data: RTCSendAnswerObj = { answer, from: token, to: from };
      socket.emit(SocketActions.sendAnswer, data);
    }
  };

  const handleAnswer = async ({ answer, from }: RTCReceiveAnswerObj) => {
    if (answer) {
      await peer.setRemoteDescription(answer);
      const data: RCTConnectionEstablished = { success: true, from: token, to: from };
      socket.emit(SocketActions.connectionEstablished, data);
    }
  };

  const handleNegotiation = async () => {
    await sendOffer();
  };

  useEffect(() => {
    initiatePeerpromise.then(() => {
      if (!peer.peer) return;
      sendOffer();
      socket.on(SocketActions.receivedOffer, handleOffer);
      socket.on(SocketActions.receivedAnswer, handleAnswer);
      peer.peer.addEventListener("negotiationneeded", handleNegotiation);
    });

    return () => {
      if (!peer.peer) return;
      socket.off(SocketActions.receivedOffer, handleOffer);
      socket.off(SocketActions.receivedAnswer, handleAnswer);
      peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [token, coonectId]);
  return <div></div>;
}
