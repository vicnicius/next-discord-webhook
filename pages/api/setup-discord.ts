// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type {Readable} from "node:stream";
import {InteractionResponseType, InteractionType, verifyKey} from "discord-interactions";

type Data = {
  type?: number,
  data?: {
    content: string
  },
  success?: boolean
}

export async function DiscordRequest(endpoint: string, options: RequestInit) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)'
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

// Simple test command
export const TEST_COMMAND = {
  name: 'test',
  description: 'Basic guild command',
  type: 1,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/1010055401213009951/guilds/1010129111827623986/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'POST', body: JSON.stringify(TEST_COMMAND) });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).end('Something went wrong!');
  }
}
