"use client";
import { io, Socket } from "socket.io-client";
import dotenv from "dotenv";
dotenv.config();

const URL = process.env.SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL;

export const socket = io(URL);
