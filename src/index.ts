import express from 'express';
import { config } from 'dotenv';
import ExpressMongoSanitize from 'express-mongo-sanitize';

config();
export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());



