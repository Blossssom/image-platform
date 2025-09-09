import { join } from 'path';

export const getEnvFilePath = () => {
  const baseDir = join(__dirname, '../../../');
  const envMode = process.env.NODE_ENV || 'dev';

  return [join(baseDir, `.env.${envMode}`), join(baseDir, '.env')];
};
