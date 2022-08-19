// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type {Readable} from "node:stream";
import {InteractionResponseType, InteractionType, verifyKey} from "discord-interactions";

type Data = {
  type: number,
  data?: {
    content: string
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];

    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');

    if (signature === undefined
      || Array.isArray(signature)
      || timestamp === undefined
      || Array.isArray(timestamp)
      || !DISCORD_PUBLIC_KEY
      || !verifyKey(rawBody, signature, timestamp, DISCORD_PUBLIC_KEY)
    ) {
      return res.status(401).end('Invalid request signature');
    }

    const parsedBody = JSON.parse(rawBody);
    console.log({ parsedBody });
    if (parsedBody.type === InteractionType.PING) {
      return res.status(200).json({ type: InteractionResponseType.PONG })
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (parsedBody.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = parsedBody.data;

      // "test" guild command
      if (name === 'test') {
        // Send a message into the channel where command was triggered from
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: 'Come.',
          },
        });
      }
    }
  }
}
