import cors, { CorsOptions } from 'cors';
import express from 'express';
import fs from 'fs';
import { Bot } from 'grammy';
import Mustache from 'mustache';
import toml from 'toml';

if (!process.env.telegram_key) {
  console.error(
    `Expect environment variable "telegram_key" to contain the private key for the Telegram bot.`
  );
  process.exit(1);
}

const config = _readConfig('./config.toml');
if (!config || !config.server || !Array.isArray(config.server.origins)) {
  console.error(`Configuration file does not contain "server.origins" array.`);
  process.exit(1);
}
if (!config || !config.telegram || !Array.isArray(config.telegram.groups)) {
  console.error(`Configuration file does not contain "telegram.groups" array.`);
  process.exit(1);
}

const app = express();
const PORT = config.server?.port ?? 7027;

const bot = new Bot(process.env.telegram_key);

const corsOptions = {
  origin: function (origin: string, callback: Function) {
    if (config.server.origins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('not allowed by CORS'));
    }
  },
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  preflightContinue: false,
};

app.use(cors(corsOptions as CorsOptions), express.json());

app.get('/health', (req, res) => {
  return res.send('Form server is running.');
});

app.post('/message', (req, res) => {
  console.info(req.body);
  if (!req.body.domain) {
    req.body.domain = 'Website';
  }
  const message = Mustache.render(letter, req.body);

  for (const group of config.telegram.groups) {
    bot.api.sendMessage(group, message);
  }
  return res.status(200).send('Message sent.');
});

app.listen(PORT, () => {
  console.info('Server started.');
});

const letter = `{{ domain }} received a form.
---

Name: {{ name }}
Email address: {{ email }}
Question/Comment:
{{ comments }}
`;

function _readConfig(file: string) {
  let config;
  let raw;
  try {
    raw = fs.readFileSync(file, {
      encoding: 'utf-8',
      flag: 'r',
    });
  } catch (err: any) {
    console.error(`Unable to read file "${file}":`, err.toString());
    process.exit(1);
  }

  try {
    config = toml.parse(raw);
  } catch (err: any) {
    console.error(`Unable to parse TOML file:`, err.toString());
    process.exit(1);
  }
  return config;
}
