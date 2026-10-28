const { getClient } = require("../db");

const withTransaction = async (action, existingClient = null) => {
  if (existingClient) return action(existingClient);
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { withTransaction };
