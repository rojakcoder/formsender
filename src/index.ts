import cors, { CorsOptions } from 'cors';
import express from 'express';
import { Bot } from 'grammy';
import Mustache from 'mustache';

const app = express();
const PORT = 7027;

const bot = new Bot('2107641114:AAG1NGCnIyC7FYTm3A7aXRlmAzuqjzUmpUM');

const origins = ['https://www.auracapital.io:7027'];
const corsOptions = {
  origin: function (origin: string, callback: Function) {
    if (origins.indexOf(origin) !== -1 || !origin) {
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
  const message = Mustache.render(letter, req.body);

  bot.api.sendMessage('1107012659', message);
  return res.status(200).send();
});

app.listen(PORT, () => {
  console.info('Server started.');
});

const letter = `auracapital.io received a form.
---

Name: {{ name }}
Email address: {{ email }}
Question/Comment:
{{ comments }}
`;
