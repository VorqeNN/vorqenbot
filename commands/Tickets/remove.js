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
    if(!client.tickets.has(message.channel.id)) return message.channel.send(config.Locale.NotInTicketChannel).then(msg => setTimeout(() => msg.delete(), 5000));

    let aUser = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if(!aUser) return message.channel.send(config.Locale.MentionUser).then(msg => setTimeout(() => msg.delete(), 5000));
    message.channel.permissionOverwrites.create(aUser, {
        SEND_MESSAGES: false,
        VIEW_CHANNEL: false,
        READ_MESSAGE_HISTORY: false
    });

    let logsChannel; 
    if(!config.userRemove.ChannelID) logsChannel = message.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
    if(config.userRemove.ChannelID) logsChannel = message.guild.channels.cache.get(config.userRemove.ChannelID);

    const log = new Discord.MessageEmbed()
    .setColor("RED")
    .setTitle(config.Locale.userRemoveTitle)
    .addField(`• ${config.Locale.logsExecutor}`, `> ${message.author}\n> ${message.author.tag}`)
    .addField(`• ${config.Locale.logsUser}`, `> ${aUser}\n> ${aUser.tag}`)
    .addField(`• ${config.Locale.logsTicket}`, `> ${message.channel}\n> #${message.channel.name}`)
    .setTimestamp()
    .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
    .setFooter({ text: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })

    let removeLocale = config.Locale.ticketUserRemove.replace(/{user}/g, `${aUser}`).replace(/{user-tag}/g, `${aUser.tag}`);
    const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setDescription(removeLocale)

    message.channel.send({ embeds: [embed] })
    if (logsChannel && config.userRemove.Enabled) logsChannel.send({ embeds: [log] })

}


module.exports.help = {
  name: 'remove',
  enabled: commands.Ticket.Remove.Enabled
}
