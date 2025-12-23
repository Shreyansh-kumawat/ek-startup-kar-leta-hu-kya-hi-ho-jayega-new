


//  // // // // Temporary Closed - Dont use this file! // // // //   // 


// const twilio = require('twilio');

// // Initialize Twilio client
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// // Send WhatsApp message
// exports.sendWhatsAppMessage = async (to, message) => {
//   try {
//     // Validate input
//     if (!to || !message) {
//       throw new Error('Recipient phone number and message are required');
//     }

//     // Format phone number to WhatsApp format (e.g., +1234567890)
//     const formattedTo = to.startsWith('+') ? to : `+${to}`;

//     // Send message via Twilio WhatsApp API
//     const response = await client.messages.create({
//       from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//       to: `whatsapp:${formattedTo}`,
//       body: message,
//     });

//     return { success: true, message: 'WhatsApp message sent successfully', sid: response.sid };
//   } catch (error) {
//     throw new Error('Failed to send WhatsApp message: ' + error.message);
//   }
// };

// // Format message templates
// exports.formatMessage = (templateType, data) => {
//   try {
//     // Validate input
//     if (!templateType || !data) {
//       throw new Error('Template type and data are required');
//     }

//     let message = '';

//     switch (templateType.toLowerCase()) {
//       case 'welcome':
//         message = `Hello ${data.username},\nWelcome to our platform! We're excited to have you on board. Get started by visiting your dashboard at ${process.env.APP_URL}/dashboard.`;
//         break;

//       case 'meeting_confirmation':
//         message = `Hello ${data.username},\nYour meeting "${data.title}" is scheduled for ${new Date(data.scheduledDate).toLocaleDateString()} at ${data.scheduledTime}.\nJoin here: ${data.meetingLink || 'TBD'}`;
//         break;

//       case 'payment_confirmation':
//         message = `Hello ${data.username},\nYour payment of ${data.currency} ${data.amount} for order #${data.orderId} was successful.\nItems:\n${data.items.map(item => `- ${item.name} (Qty: ${item.quantity}, Price: ${item.price})`).join('\n')}\nThank you!`;
//         break;

//       default:
//         throw new Error('Invalid template type. Use welcome, meeting_confirmation, or payment_confirmation');
//     }

//     return message;
//   } catch (error) {
//     throw new Error('Failed to format message: ' + error.message);
//   }
// };
