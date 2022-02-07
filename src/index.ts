import express from 'express';
import { Bot } from 'grammy';
import Mustache from 'mustache';

const app = express();
const PORT = 7027;

const bot = new Bot('2107641114:AAG1NGCnIyC7FYTm3A7aXRlmAzuqjzUmpUM');

app.use(express.json());

app.get('/health', (req, res) => {
  return res.send('Form server is running.');
});

app.post('/message', (req, res) => {
  const message = Mustache.render(letter, req.body);

  bot.api.sendMessage('1107012659', message);
  console.log(message);
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
{{ comment }}
`;
