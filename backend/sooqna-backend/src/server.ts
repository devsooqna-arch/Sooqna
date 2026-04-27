import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

app.listen(env.port, () => {
  logger.info(`sooqna-backend listening on http://localhost:${env.port}`, {
    env: env.nodeEnv,
    port: env.port,
  });
});

