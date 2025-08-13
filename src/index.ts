import express, { Request, Response, Application } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import routes from './routes';

config();

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port: string | number = process.env.PORT || 3001;
app.use(cors());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript in Node.js!');
});

// Use all routes defined in the routes directory
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
