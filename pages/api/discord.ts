// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {verifyKey} from "discord-interactions";

type Data = {
  type: number
}

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const signature = req.headers["X-Signature-Ed25519"];
  const timestamp = req.headers["X-Signature-Timestamp"];

  if (signature === undefined
    || Array.isArray(signature)
    || timestamp === undefined
    || Array.isArray(timestamp)
    || !DISCORD_PUBLIC_KEY
    || !verifyKey(req.body, signature, timestamp, DISCORD_PUBLIC_KEY)
  ) {
    return res.status(401).end('Invalid request signature');
  }

  if (req.body.type === 1) {
    return res.status(200).json({ type: 1 })
  }
}
