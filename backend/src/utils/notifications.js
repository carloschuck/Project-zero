const createNotification = async (client, userId, ticketId, title, message, type) => {
  try {
    await client.query(
      `INSERT INTO notifications (user_id, ticket_id, title, message, type)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, ticketId, title, message, type]
    );
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

module.exports = { createNotification };


