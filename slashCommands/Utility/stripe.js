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

const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require ("discord.js")
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const commands = yaml.load(fs.readFileSync('./commands.yml', 'utf8'))

module.exports = {
    enabled: commands.Utility.Stripe.Enabled,
    data: new SlashCommandBuilder()
        .setName('stripe')
        .setDescription(commands.Utility.Stripe.Description)
        .addUserOption((option) => option.setName('user').setDescription('User').setRequired(true))
        .addStringOption(option => option.setName('email').setDescription('Customer Email').setRequired(true))
        .addIntegerOption((option) => option.setName('price').setDescription('Price').setRequired(true))
        .addStringOption(option => option.setName('service').setDescription('Service').setRequired(true)),
    async execute(interaction, client) {
        if(config.StripeSettings.Enabled === false) return interaction.reply({ content: "This command has been disabled in the config!", ephemeral: true })
        if(config.StripeSettings.OnlyInTicketChannels && !client.tickets.has(interaction.channel.id)) return interaction.reply({ content: config.Locale.NotInTicketChannel, ephemeral: true })
    
        let doesUserHaveRole = false
        for(let i = 0; i < config.StripeSettings.AllowedRoles.length; i++) {
            role = interaction.guild.roles.cache.get(config.StripeSettings.AllowedRoles[i]);
            if(role && interaction.member.roles.cache.has(config.StripeSettings.AllowedRoles[i])) doesUserHaveRole = true;
          }
        if(doesUserHaveRole === false) return interaction.reply({ content: config.Locale.NoPermsMessage, ephemeral: true })
    
        let user = interaction.options.getUser("user");
        let customerEmail = interaction.options.getString("email");
        let price = interaction.options.getInteger("price");
        let service = interaction.options.getString("service");

        price = Math.round(price)
        let fixpriced = price * 100

        await interaction.deferReply();

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
                      .addField(`• ${config.Locale.suggestionInformation}`, `> **${config.Locale.PayPalSeller}** ${interaction.user}\n> **${config.Locale.PayPalUser}** ${user}\n> **${config.Locale.PayPalPrice}** ${config.StripeSettings.CurrencySymbol}${price} (${config.StripeSettings.Currency})\n> **${config.Locale.suggestionStatus}** 🔴 UNPAID`)
                      .addField(`• ${config.Locale.PayPalService}`, `> \`\`\`${service}\`\`\``)
                      .setTimestamp()
                      .setFooter({ text: `${user.username}#${user.discriminator}`, iconURL: `${user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
                      interaction.editReply({ embeds: [embed], components: [row] }).then(async function(msg) {
    
                      let logsChannel; 
                      if(!config.stripeInvoice.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
                      if(config.stripeInvoice.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.stripeInvoice.ChannelID);
      
                      const log = new Discord.MessageEmbed()
                      .setColor("GREEN")
                      .setTitle(config.Locale.StripeLogTitle)
                      .addField(`• ${config.Locale.logsExecutor}`, `> ${interaction.user}\n> ${interaction.user.tag}`)
                      .addField(`• ${config.Locale.PayPalUser}`, `> ${user}\n> ${user.tag}`)
                      .addField(`• ${config.Locale.PayPalPrice}`, `> ${config.StripeSettings.CurrencySymbol}${price}`)
                      .addField(`• ${config.Locale.PayPalService}`, `> ${service}`)
                      .setTimestamp()
                      .setThumbnail(interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
                      .setFooter({ text: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
                      if (logsChannel && config.stripeInvoice.Enabled) logsChannel.send({ embeds: [log] })
    
                      await client.stripeInvoices.ensure(`${invoice2.id}`, {
                        userID: user.id,
                        sellerID: interaction.user.id,
                        channelID: interaction.channel.id,
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

}