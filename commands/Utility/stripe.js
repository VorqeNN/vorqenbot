/*
 _____  _             _______ _      _        _       
|  __ \| |           |__   __(_)    | |      | |      
| |__) | | _____  __    | |   _  ___| | _____| |_ ___ 
|  ___/| |/ _ \ \/ /    | |  | |/ __| |/ / _ \ __/ __|
| |    | |  __/>  <     | |  | | (__|   <  __/ |_\__ \
|_|    |_|\___/_/\_\    |_|  |_|\___|_|\_\___|\__|___/
                                        
Thank you for purchasing Plex Tickets!
If you find any issues, need support, or have a suggestion for the bot, please join our support server and create a ticket,
https://discord.gg/eRaeJdTsPY
*/

const Discord = require ("discord.js")
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const commands = yaml.load(fs.readFileSync('./commands.yml', 'utf8'))

exports.run = async (client, message, args) => {
    if(config.StripeSettings.Enabled === false) return;
    if (config.StripeSettings.OnlyInTicketChannels && !client.tickets.has(message.channel.id)) return message.channel.send(config.Locale.NotInTicketChannel).then(msg => setTimeout(() => msg.delete(), 5000));

    let doesUserHaveRole = false
    for(let i = 0; i < config.StripeSettings.AllowedRoles.length; i++) {
        role = message.guild.roles.cache.get(config.StripeSettings.AllowedRoles[i]);
        if(role && message.member.roles.cache.has(config.StripeSettings.AllowedRoles[i])) doesUserHaveRole = true;
      }
    if(doesUserHaveRole === false) return message.reply(config.Locale.NoPermsMessage)

    let invalidusage = new Discord.MessageEmbed()
    .setColor("RED")
    .setDescription('Too few arguments given\n\nUsage:\n``stripe <@user> <customer email> <price> <service>``')

    let customerEmail = args[1];
    let price = args[2];
    let service = args.slice(3).join(" ");
    let user = message.mentions.users.first()
    if(!user) return message.reply({ embeds: [invalidusage] })
    if(!customerEmail) return message.reply({ embeds: [invalidusage] })
    if(!price) return message.reply({ embeds: [invalidusage] })
    if(!service) return message.reply({ embeds: [invalidusage] })

    price = Math.round(price)
    let fixpriced = price * 100

    client.stripe.customers.create({ email: customerEmail, })
    .then((customer) => {
      return client.stripe.invoiceItems.create({
          customer: customer.id,
          amount: fixpriced,
          currency: config.StripeSettings.Currency,
          description: service,
        })
        .then((invoiceItem) => {
          return client.stripe.invoices.create({
            collection_method: 'send_invoice',
            days_until_due: 30,
            customer: invoiceItem.customer,
          });
        })
        .then(async (invoice) => {
          await client.stripe.invoices.sendInvoice(invoice.id)
          let invoice2 = await client.stripe.invoices.retrieve(invoice.id);
          
          const row = new Discord.MessageActionRow()
          .addComponents(
              new Discord.MessageButton()
                  .setStyle('LINK')
                  .setURL(`${invoice2.hosted_invoice_url}`) 
                  .setLabel(config.Locale.PayPalPayInvoice))
      
                  const embed = new Discord.MessageEmbed()
                  .setTitle(config.Locale.StripeInvoiceTitle)
                  .setColor(config.EmbedColors)
                  .setThumbnail("https://assets.website-files.com/60d5e12b5c772dbf7315804e/6127ddadabd8205a78c21a42_sq.png")
                  .setDescription(config.Locale.PayPalInvoiceMsg)
                  .addField(`• ${config.Locale.suggestionInformation}`, `> **${config.Locale.PayPalSeller}** ${message.author}\n> **${config.Locale.PayPalUser}** ${user}\n> **${config.Locale.PayPalPrice}** ${config.StripeSettings.CurrencySymbol}${price} (${config.StripeSettings.Currency})\n> **${config.Locale.suggestionStatus}** 🔴 UNPAID`)
                  .addField(`• ${config.Locale.PayPalService}`, `> \`\`\`${service}\`\`\``)
                  .setTimestamp()
                  .setFooter({ text: `${user.username}#${user.discriminator}`, iconURL: `${user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
                  message.channel.send({ embeds: [embed], components: [row] }).then(async function(msg) {

                  let logsChannel; 
                  if(!config.stripeInvoice.ChannelID) logsChannel = message.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
                  if(config.stripeInvoice.ChannelID) logsChannel = message.guild.channels.cache.get(config.stripeInvoice.ChannelID);
  
                  const log = new Discord.MessageEmbed()
                  .setColor("GREEN")
                  .setTitle(config.Locale.StripeLogTitle)
                  .addField(`• ${config.Locale.logsExecutor}`, `> ${message.author}\n> ${message.author.tag}`)
                  .addField(`• ${config.Locale.PayPalUser}`, `> ${user}\n> ${user.tag}`)
                  .addField(`• ${config.Locale.PayPalPrice}`, `> ${config.StripeSettings.CurrencySymbol}${price}`)
                  .addField(`• ${config.Locale.PayPalService}`, `> ${service}`)
                  .setTimestamp()
                  .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
                  .setFooter({ text: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
                  if (logsChannel && config.stripeInvoice.Enabled) logsChannel.send({ embeds: [log] })

                  await client.stripeInvoices.ensure(`${invoice2.id}`, {
                    userID: user.id,
                    sellerID: message.author.id,
                    channelID: message.channel.id,
                    messageID: msg.id,
                    customerID: invoice2.customer,
                    invoiceID: invoice2.id,
                    price: price,
                    service: service,
                    status: invoice2.status,
                });
              })

        })
        .catch((err) => {
          console.log(err)
        });
    });

}


module.exports.help = {
  name: 'stripe',
  enabled: commands.Utility.Stripe.Enabled
}
