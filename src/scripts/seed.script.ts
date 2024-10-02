import bcrypt from 'bcryptjs';
import { readData, writeData } from '../utils/data-file.utility';
import { User } from '../interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';
import { Inventory } from '../interfaces/inventory.interface';
import { UserRole } from '../enums/user.enum';
import logger from '../utils/logger.utility';

const adminUser = {
  id: uuidv4(),
  name: process.env.ADMIN_NAME!,
  email: process.env.ADMIN_EMAIL!,
  password: process.env.ADMIN_PASS!,
  role: UserRole.ADMIN,
};

const seedAdminUser = async () => {
  try {
    const data: { users: User[]; inventory: Inventory[] } = readData() || {
      users: [],
      inventory: [],
    };
    const existingAdmin = data.users.find(
      (user: User) => user.role === UserRole.ADMIN
    );

    if (!existingAdmin) {
      console.log(adminUser);
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      data.users.push({
        ...adminUser,
        password: hashedPassword,
      });

      writeData(data);

      logger.info('Admin user created successfully.');
    } else {
      logger.info('Admin user already exists.');
    }
  } catch (error: any) {
    logger.error({ data: error.stack });
  }
};

export default seedAdminUser;
