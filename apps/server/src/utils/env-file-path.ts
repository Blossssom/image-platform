import { join } from 'path';

export const getEnvFilePath = () => {
  const baseDir = join(__dirname, '../../../../');
  const envMode = process.env.NODE_ENV || 'dev';

  console.log(join(baseDir, `.env.${envMode}`));
  return join(baseDir, `.env.${envMode}`);
};
