import fetch from 'node-fetch';
import readline from 'readline-sync';
import fs from 'fs';
import chalk from 'chalk';
import cfonts from 'cfonts';

// Display banner
cfonts.say('NT Exhaust', {
  font: 'block',
  align: 'center',
  colors: ['cyan', 'magenta'],
  background: 'black',
  letterSpacing: 1,
  lineHeight: 1,
  space: true,
  maxLength: '0',
});
console.log(chalk.green("=== Telegram Channel : NT Exhaust ( @NTExhaust ) ==="));

// Configuration
const channelIds = readline.question("Enter channel IDs (separate with commas for multiple channels): ").split(',').map(id => id.trim());
const deleteOption = readline.question("Delete message after sending? (yes/no): ").toLowerCase() === 'yes';
const sendDelay = parseInt(readline.question("Set message sending delay (in seconds): ")) * 1000;
let deleteDelay = 0;
let afterDeleteDelay = 0;

if (deleteOption) {
  deleteDelay = parseInt(readline.question("Set message delete delay (in seconds): ")) * 1000;
  afterDeleteDelay = parseInt(readline.question("Set delay after deleting message (in seconds): ")) * 1000;
}

const tokens = fs.readFileSync("token.txt", "utf-8").split('\n').map(token => token.trim());

// Smart reply generator based on message content
const generateSmartReply = (message) => {
  const lowerMsg = message.toLowerCase();
  
  // Context-based responses
  const responsePatterns = [
    {
      keywords: ['hello', 'hi', 'hey', 'sup'],
      responses: ['Hello there! 👋', 'Hey! How are you?', 'Hi! Nice to see you!', 'Hello! 😊']
    },
    {
      keywords: ['how are you', 'how do you do'],
      responses: ['I\'m doing great, thanks!', 'All good here! How about you?', 'Pretty good! 😄', 'Doing well!']
    },
    {
      keywords: ['thank you', 'thanks', 'ty'],
      responses: ['You\'re welcome! 😊', 'No problem!', 'Anytime!', 'Glad to help!']
    },
    {
      keywords: ['?', 'what', 'why', 'how'],
      responses: ['That\'s a good question!', 'Interesting point!', 'What do you think?', 'Let me think about that...']
    },
    {
      keywords: ['lol', 'haha', 'funny', 'lmao'],
      responses: ['😂', 'Haha!', 'That\'s hilarious!', 'LOL! 😄']
    },
    {
      keywords: ['sad', 'bad', 'upset', 'angry'],
      responses: ['Oh no! What happened?', 'I\'m sorry to hear that 😔', 'Hope things get better!', 'Sending positive vibes! ✨']
    },
    {
      keywords: ['good', 'great', 'awesome', 'nice'],
      responses: ['That\'s awesome! 😃', 'Great to hear!', 'Nice! 👍', 'Excellent!']
    }
  ];
  
  // Find matching pattern
  for (const pattern of responsePatterns) {
    for (const keyword of pattern.keywords) {
      if (lowerMsg.includes(keyword)) {
        const randomResponse = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        return randomResponse;
      }
    }
  }
  
  // Default intelligent responses based on message length and content
  const defaultResponses = [
    "Interesting! Tell me more.",
    "I see what you mean.",
    "That's a good point.",
    "Thanks for sharing that.",
    "What are your thoughts on this?",
    "That makes sense.",
    "I agree with you.",
    "Could you elaborate on that?",
    "That's worth discussing.",
    "Nice perspective!"
  ];
  
  // Add some message-specific responses
  if (message.length > 100) {
    return "Wow, that's detailed! Thanks for explaining.";
  } else if (message.length < 10) {
    return "Short and sweet! 😊";
  } else if (message.includes('!')) {
    return "I can tell you're excited about this!";
  }
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Function to read last message and generate reply
const getLastMessageReply = async (channelId, token) => {
  try {
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages?limit=1`, {
      headers: { 'Authorization': token }
    });
    
    if (response.ok) {
      const messages = await response.json();
      if (messages.length > 0) {
        const lastMessage = messages[0].content;
        const senderId = messages[0].author.id;
        
        // Skip if last message is from the bot itself
        if (messages[0].author.bot) {
          console.log(chalk.gray(`[i] Last message is from a bot, skipping...`));
          return null;
        }
        
        // Skip if message is empty or too short
        if (lastMessage.trim().length < 2) {
          return null;
        }
        
        console.log(chalk.cyan(`[AI] Generating reply for: "${lastMessage}"`));
        const smartReply = generateSmartReply(lastMessage);
        
        // Mention the sender
        return `<@${senderId}> ${smartReply}`;
      }
    }
  } catch (error) {
    console.log(chalk.red(`[✗] Error getting last message: ${error.message}`));
  }
  return null;
};

// Send message function
const sendMessage = async (channelId, content, token) => {
  try {
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    
    if (response.ok) {
      const messageData = await response.json();
      console.log(chalk.green(`[✔] Message sent to ${channelId}`));
      console.log(chalk.cyan(`Message: ${content}`));
      
      if (deleteOption) {
        await new Promise(resolve => setTimeout(resolve, deleteDelay));
        await deleteMessage(channelId, messageData.id, token);
      }
      return messageData.id;
    } else if (response.status === 429) {
      const retryAfter = (await response.json()).retry_after;
      console.log(chalk.yellow(`[!] Rate limited. Waiting ${retryAfter} seconds...`));
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return sendMessage(channelId, content, token);
    }
  } catch (error) {
    console.log(chalk.red(`[✗] Error sending message: ${error.message}`));
  }
  return null;
};

// Delete message function
const deleteMessage = async (channelId, messageId, token) => {
  try {
    const delResponse = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });
    if (delResponse.ok) {
      console.log(chalk.blue(`[✔] Deleted message ${messageId} in channel ${channelId}`));
    }
    await new Promise(resolve => setTimeout(resolve, afterDeleteDelay));
  } catch (error) {
    console.log(chalk.red(`[✗] Error deleting message: ${error.message}`));
  }
};

// Main function
(async () => {
  console.log(chalk.yellow(`[!] Starting with ${tokens.length} token(s) and ${channelIds.length} channel(s)`));
  console.log(chalk.cyan(`[i] Using SMART REPLY SYSTEM (No API needed)`));
  
  while (true) {
    for (const token of tokens) {
      for (const channelId of channelIds) {
        const reply = await getLastMessageReply(channelId, token);
        
        if (reply) {
          await sendMessage(channelId, reply, token);
        } else {
          console.log(chalk.yellow(`[!] No reply generated for channel ${channelId}`));
        }
        
        await new Promise(resolve => setTimeout(resolve, sendDelay));
      }
    }
  }
})();
