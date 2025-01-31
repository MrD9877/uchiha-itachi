"use client";
import React, { useEffect, useState } from "react";
import { SocketActions } from "../utilities/actions/peerActions";
import peer from "../utilities/RTCpeerUtilities/peer";
import { Socket } from "socket.io-client/build/esm";

type RTCComponentType =
  | {
      token: string;
      coonectId: string;
    }
  | undefined;

export type RTCSendOfferObj = {
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

type SendconnectionEstablished = {
  success: boolean;
  from: string;
};
type MediaFunctions =
  | {
      sendStream: () => void;
      stopStream: () => void;
    }
  | undefined;

export default function useRTCPeer(mediaFunctions: MediaFunctions) {
  const { sendStream, stopStream } = mediaFunctions || {};
  const [state, setState] = useState<RTCComponentType>(undefined);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [request, setRequest] = useState(true);

  const sendOffer = async (): Promise<void> => {
    if (state && state.token && state.coonectId && socket) {
      const offer = await peer.getOffer();
      const data: RTCSendOfferObj = { offer, from: state.token, to: state.coonectId };
      socket.emit(SocketActions.sendOffer, data);
    }
  };

  const handleOffer = async ({ offer, from }: RTCReceiveOfferObj): Promise<void> => {
    if (socket && offer && state && from === state.coonectId) {
      const answer = await peer.getAnswer(offer);
      const data: RTCSendAnswerObj = { answer, from: state?.token, to: state.coonectId };
      socket.emit(SocketActions.sendAnswer, data);
    }
  };

  const handleAnswer = async ({ answer, from }: RTCReceiveAnswerObj) => {
    if (socket && answer && state && from === state.coonectId) {
      await peer.setRemoteDescription(answer);
      const data: RCTConnectionEstablished = { success: true, from: state?.token, to: state.coonectId };
      socket.emit(SocketActions.connectionEstablished, data);
    }
  };

  const handleNegotiation = async () => {
    if (state && socket) {
      await sendOffer();
    }
  };

  const handleEstablished = async ({ success, from }: SendconnectionEstablished) => {
    if (success && from === state?.coonectId && sendStream) {
      sendStream();
    }
  };

  const startConnection = () => {
    setRequest(!request);
  };

  useEffect(() => {
    sendOffer();
  }, [request]);

  const endConnection = ({ from }: { from: string }) => {
    if (from === state?.coonectId) {
      stopStream && stopStream();
      peer.closeConnection();
    }
  };

  const closeConnection = async () => {
    stopStream && stopStream();
    peer.closeConnection();
    socket?.emit(SocketActions.closeConnection, { from: state?.token, to: state?.coonectId });
  };

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketActions.receivedOffer, handleOffer);
    socket.on(SocketActions.receivedAnswer, handleAnswer);
    socket.on(SocketActions.connectionEstablished, handleEstablished);
    socket.on(SocketActions.closeConnection, endConnection);
    if (peer.peer) {
      peer.peer.addEventListener("negotiationneeded", handleNegotiation);
    }
    return () => {
      socket.off(SocketActions.receivedOffer, handleOffer);
      socket.off(SocketActions.receivedAnswer, handleAnswer);
      socket.off(SocketActions.closeConnection, endConnection);

      if (peer.peer) peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [state, peer.peer, socket]);

  return [setSocket, setState, { startConnection, closeConnection, peer }];
}
