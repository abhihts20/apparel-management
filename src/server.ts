import { app } from '.';

import router from './routes/index.route';
import errorMiddleware from './middlewares/error.middleware';
import seedAdminUser from './scripts/seed.script';
import logger from './utils/logger.utility';


seedAdminUser()
  .then(() => {
    logger.info('Seeding Processed');
  })
  .catch((err) => {
    logger.error({ message: 'Seeding failed', data: err.stack });
  });

app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
