# LOCAL DB

## SetUp

```
import { LocalDb } from "uchiha-madara";
 const newDb = new LocalDb([{ store: your-store, keyPath: your-key }], db-name, version-number);
```

## Put

### putOne

```
const res = await db.putOne({ store: your-store, data: your-data-with-key });
```

### putMany

```
const res = await db.putMany({ store: your-store, data: [your-data-with-key] });
```

### Response

```
{
  message: string;
  success: boolean;
  data: any;
  store: string;
  error?: any;
}
```

## Find

### findOne

```
 const data = await db.findOne({ store:your-store , key: your-key });
```

### findMany

```
 const data = await db.findMany({ store:your-store , key: [your-key,key,key ]});
```

### findAll

```
 const data = await db.findAll(store:your-store );
```

### Response

```
{
  message: string;
  success: boolean;
  data?: any;
  store: string;
  key: number | string;
  error?: any;
}
```

## Delete

### deleteOne

```
  const data = await db.deleteOne({ store: store-name, key: key });
```

### deleteMany

```
 const data = await db.deleteMany({ store: store-name, key: [key,key,key...] });
```

### deleteAll

```
  const data = await db.deleteAll(store-name);
```

### Response

```
{
  message: string;
  success: boolean;
  store: string;
  key: number | string;
  error?: any;
}
```

# useRTCPeer

Description:\
\
use browser RTCpeer api to share media as of v-2.0.0 only two user connection is supported multiple user connnection will be added in future versions

## SetUp

```
import { useRTCPeer } from "uchiha-itachi";
  const [setPeerSocket, setPeerData, { startConnection }] = useRTCPeer();
```

## setPeerSocket

This params accept socket

## setPeerData

```
type PeerData = { token: string; coonectId: string };

token should be a jwt token
use LOCAL_SECREAT for encryption
token.decode = {
  room:string
}
```

## startConnection

This is function which should be call after user a and user b setPeerSocket and setPeerData

```
startConnection()
```

# useRTCMedia

## SetUp

```
import { useRTCPeer, useRTCMedia } from "uchiha-itachi";

  const [setType, stream, sendStream] = useRTCMedia();
  const [setPeerSocket, setPeerData, { startConnection }] = useRTCPeer(sendStream);

```

## setType

setType with setPeerSocket and SetPeerData

```
type StreamType = "audio" | "video" | null;

```

## Working Example

```
"use client";
import { useRTCPeer, useRTCMedia } from "uchiha-itachi";
import { useEffect, useState } from "react";
import socket from "../../socket";
import { useSearchParams } from "next/navigation";
import ReactPlayer from "react-player";
type PeerData = { token: string; coonectId: string };

export default function Test() {
  const [token, setToken] = useState<string | null>(null);
  const [connectId, setId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [connetRequest, setConnetRequest] = useState<boolean>(false);
  const [setType, stream, sendStream] = useRTCMedia();
  const [setPeerSocket, setPeerData, { startConnection }] = useRTCPeer(sendStream);

  const start = () => {
    const room = searchParams.get("room");
    if (token && connectId) {
      const data: PeerData = { token, coonectId: connectId };
      setPeerData(data);
      setPeerSocket(socket);
      socket.emit("requestConnection", { from: room, to: connectId });
    }
  };
  const handleRequest = ({ from }: { from: string }) => {
    setId(from);
    setConnetRequest(true);
  };

  const handleAccept = async () => {
    if (token && connectId) {
      const data: PeerData = { token, coonectId: connectId };
      setPeerData(data);
      setPeerSocket(socket);
      startConnection();
    }
  };

  useEffect(() => {
    socket.on("requestConnection", handleRequest);
    setType("video");
    const room = searchParams.get("room");
    if (room === "b") {
      setToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb29tIjoiYiJ9.iR5l91Bc_26m6YLNm0Hud1vqPshJhheZop4nQ3WKyOc");
    } else {
      setToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb29tIjoiYSJ9.ZH95jw_-oD6bPfSX-nCY5J0nfeMsxahjCg9bFqNyaX4");
    }

    return () => {
      socket.off("requestConnection", handleRequest);
    };
  }, [setType, searchParams]);
  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center flex-col gap-5">
      {stream && <ReactPlayer playing={true} muted url={stream} width="150px" height="250px" />}
      {connetRequest ? (
        <>
          <button className="text-black px-2 py-1 bg-blue-700 mx-8" onClick={handleAccept}>
            accept
          </button>
        </>
      ) : (
        <>
          <input type="text" placeholder="ID" className="px-2 bg-white text-black" value={connectId ? connectId : ""} onChange={(e) => setId(e.target.value)} />
          <button onClick={start} className="bg-blue-600 px-2 py-1 text-white">
            sendRequest
          </button>
        </>
      )}
      <button className="text-black px-2 py-1 bg-blue-700 mx-8" onClick={sendStream}>
        sendS
      </button>
    </div>
  );
}

```
