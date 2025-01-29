export interface RTCPeerExchange {
  from: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
}
export interface InComingCall extends RTCPeerExchange {
  name: string;
  type: "video" | "voice";
}
export type Preetify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface ReduxState {
  userId: string | null | undefined;
  email: string | null | undefined;
  name: string | null | undefined;
  inComingCall: InComingCall;
}
