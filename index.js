if (process.platform !== "win32") require("child_process").exec("npm install");

try {
  require("discord.js");
} catch(e) {
console.log('\x1b[31m%s\x1b[0m', `[ERROR] The node modules have not been installed! You can install them by using \x1b[33m\x1b[0mnpm install\x1b[0m`)
process.exit()
}

const color = require('ansi-colors');
console.log(`${color.yellow(`Starting bot, this can take a while..`)}`);
const fs = require('fs');

const version = Number(process.version.split('.')[0].replace('v', ''));
if (version < 16) {
  console.log(`${color.red(`[ERROR] Plex Tickets requires a NodeJS version of 16.9 or higher!`)}`)

  let logMsg = `\n\n[${new Date().toLocaleString()}] [ERROR] Plex Tickets requires a NodeJS version of 16.9 or higher!`;
  fs.appendFile("./logs.txt", logMsg, (e) => { 
    if(e) console.log(e);
  });

  process.exit()
}

const botVersion = require('./package.json');
let logMsg = `\n\n[${new Date().toLocaleString()}] [STARTING] Attempting to start the bot..\nNodeJS Version: ${process.version}\nBot Version: ${botVersion.version}`;
fs.appendFile("./logs.txt", logMsg, (e) => { 
  if(e) console.log(e);
});

const { Collection, Client, Discord, Intents, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES] 
});

module.exports = client
require("./utils.js");

// Error Handler
client.on('warn', async (error) => {
  console.log(error)
  console.log('\x1b[31m%s\x1b[0m', `[v${botVersion.version}] If you need any support, please create a ticket in our discord server and provide the logs.txt file\n\n`)

  let errorMsg = `\n\n[${new Date().toLocaleString()}] [WARN] [v${botVersion.version}]\n${error.stack}`;
  fs.appendFile("./logs.txt", errorMsg, (e) => { 
    if(e) console.log(e);
  });
})

client.on('error', async (error) => {
  console.log(error)
  console.log('\x1b[31m%s\x1b[0m', `[v${botVersion.version}] If you need any support, please create a ticket in our discord server and provide the logs.txt file\n\n`)

  let errorMsg = `\n\n[${new Date().toLocaleString()}] [ERROR] [v${botVersion.version}]\n${error.stack}`;
  fs.appendFile("./logs.txt", errorMsg, (e) => { 
    if(e) console.log(e);
  });
})

process.on('unhandledRejection', async (error) => {
  console.log(error)
  console.log('\x1b[31m%s\x1b[0m', `[v${botVersion.version}] If you need any support, please create a ticket in our discord server and provide the logs.txt file\n\n`)

  let errorMsg = `\n\n[${new Date().toLocaleString()}] [unhandledRejection] [v${botVersion.version}]\n${error.stack}`;
  fs.appendFile("./logs.txt", errorMsg, (e) => { 
    if(e) console.log(e);
  });
})

process.on('uncaughtException', async (error) => {
  console.log(error)
  console.log('\x1b[31m%s\x1b[0m', `[v${botVersion.version}] If you need any support, please create a ticket in our discord server and provide the logs.txt file\n\n`)

  let errorMsg = `\n\n[${new Date().toLocaleString()}] [uncaughtException] [v${botVersion.version}]\n${error.stack}`;
  fs.appendFile("./logs.txt", errorMsg, (e) => { 
    if(e) console.log(e);
  });
})


// Check for new payments
if(config.StripeSettings.Enabled) {
setInterval(async() => {
  let guild = client.guilds.cache.get(config.GuildID)

// Stripe Payment Detection
if(config.StripeSettings.Enabled) {
  const filtered = client.stripeInvoices.filter(p => p.status === "open")
    filtered.forEach(async eachPayment => {
      let channel = guild.channels.cache.get(eachPayment.channelID);
      let user = guild.members.cache.get(eachPayment.userID);
      let seller = guild.members.cache.get(eachPayment.sellerID);
      let session;
      if(channel && user) {
        session = await client.stripe.invoices.retrieve(eachPayment.invoiceID)
      
      if(session.status === 'paid') await client.stripeInvoices.set(`${session.id}`, "paid", 'status');
      }

      if(channel && user && client.stripeInvoices.get(`${session.id}`, "status") === "paid") {
        await channel.messages.fetch(eachPayment.messageID).then(async msg => {

          const row = new MessageActionRow().addComponents(
              new MessageButton()
                  .setStyle('LINK')
                  .setURL(`https://stripe.com`) 
                  .setLabel(config.Locale.PayPalPayInvoice)
                  .setDisabled(true))

          const embed = msg.embeds[0]
          embed.setColor("GREEN")
          embed.fields[0] = { name: `• ${config.Locale.suggestionInformation}`, value: `> **${config.Locale.PayPalSeller}** ${seller}\n> **${config.Locale.PayPalUser}** ${user}\n> **${config.Locale.PayPalPrice}** ${config.StripeSettings.CurrencySymbol}${eachPayment.price} (${config.StripeSettings.Currency})\n> **${config.Locale.suggestionStatus}** 🟢 PAID` }
          await msg.edit({ embeds: [embed], components: [row] })
          await client.stripeInvoices.delete(session.id)
        })
      }
    })
  }

}, 20000);
}