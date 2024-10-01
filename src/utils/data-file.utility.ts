import { User } from '../interfaces/user.interface';
import fs from 'fs';
import path from 'path';
import { Inventory } from '../interfaces/inventory.interface';

const filePath = path.join(__dirname + '../../../data.json');

/**
 * Function to handle fetch data from the json file acting as a db for this app
 **/
export const readData = (): { users: User[]; inventory: Inventory[] } => {
  try {
    const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return JSON.parse(data) || { users: [], inventory: [] };
  } catch (err) {
    throw err;
  }
};

/**
 * Function to handle write data into the json file acting as a db for this app
 **/
export const writeData = (data: { users: User[]; inventory: Inventory[] } | undefined) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {
    encoding: 'utf-8',
  });
};
