const createNotification = async (client, userId, ticketId, title, message, type, projectId = null) => {
  try {
    await client.query(
      `INSERT INTO notifications (user_id, ticket_id, title, message, type, project_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, ticketId, title, message, type, projectId]
    );
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

module.exports = { createNotification };


