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

const { Discord, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const commands = yaml.load(fs.readFileSync('./commands.yml', 'utf8'))

exports.run = async (client, message, args) => {
    if(config.PayPalSettings.Enabled === false) return;
    if (config.PayPalSettings.OnlyInTicketChannels && !client.tickets.has(message.channel.id)) return message.channel.send(config.Locale.NotInTicketChannel).then(msg => setTimeout(() => msg.delete(), 5000));

    let doesUserHaveRole = false
    for(let i = 0; i < config.PayPalSettings.AllowedRoles.length; i++) {
        role = message.guild.roles.cache.get(config.PayPalSettings.AllowedRoles[i]);
        if(role && message.member.roles.cache.has(config.PayPalSettings.AllowedRoles[i])) doesUserHaveRole = true;
      }
    if(doesUserHaveRole === false) return message.reply(config.Locale.NoPermsMessage)

    let invalidusage = new MessageEmbed()
    .setColor("RED")
    .setDescription('Too few arguments given\n\nUsage:\n``paypal <@user> <price> <service>``')

    let price = args[1];
    let service = args.slice(2).join(" ");
    let user = message.mentions.users.first()
    if(!user) return message.reply({ embeds: [invalidusage] })
    if(!price) return message.reply({ embeds: [invalidusage] })
    if(!service) return message.reply({ embeds: [invalidusage] })
    let serviceEncoded = encodeURIComponent(service.trim());
    if((isNaN(price))) return message.reply({ embeds: [invalidusage] })
    let url = `https://www.paypal.com/cgi-bin/webscr?&cmd=_xclick&business=${config.PayPalSettings.Email}&currency_code=${config.PayPalSettings.Currency}&amount=${price}&item_name=${serviceEncoded}&no_shipping=1`

    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setStyle('LINK')
            .setURL(`${url}`) 
            .setLabel(config.Locale.PayPalPayInvoice))

            const embed = new MessageEmbed()
            .setTitle(config.Locale.PayPalInvoiceTitle)
            .setColor(config.EmbedColors)
            .setThumbnail("https://www.freepnglogos.com/uploads/paypal-logo-png-7.png")
            .setDescription(config.Locale.PayPalInvoiceMsg)
            .addField(`• ${config.Locale.suggestionInformation}`, `> **${config.Locale.PayPalSeller}** ${message.author}\n> **${config.Locale.PayPalUser}** ${user}\n> **${config.Locale.PayPalPrice}** ${config.PayPalSettings.CurrencySymbol}${price} (${config.PayPalSettings.Currency})`)
            .addField(`• ${config.Locale.PayPalService}`, `> \`\`\`${service}\`\`\``)
            .setTimestamp()
            .setFooter({ text: `${user.username}#${user.discriminator}`, iconURL: `${user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
            message.channel.send({ embeds: [embed], components: [row] });

                let logsChannel; 
                if(!config.paypalInvoice.ChannelID) logsChannel = message.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
                if(config.paypalInvoice.ChannelID) logsChannel = message.guild.channels.cache.get(config.paypalInvoice.ChannelID);

                const log = new MessageEmbed()
                .setColor("GREEN")
                .setTitle(config.Locale.PayPalLogTitle)
                .addField(`• ${config.Locale.logsExecutor}`, `> ${message.author}\n> ${message.author.tag}`)
                .addField(`• ${config.Locale.PayPalUser}`, `> ${user}\n> ${user.tag}`)
                .addField(`• ${config.Locale.PayPalPrice}`, `> ${config.PayPalSettings.CurrencySymbol}${price}`)
                .addField(`• ${config.Locale.PayPalService}`, `> ${service}`)
                .setTimestamp()
                .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
                .setFooter({ text: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
                if (logsChannel && config.paypalInvoice.Enabled) logsChannel.send({ embeds: [log] })

}


module.exports.help = {
  name: 'paypal',
  enabled: commands.Utility.Paypal.Enabled
}