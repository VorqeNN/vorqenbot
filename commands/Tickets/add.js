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
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true
    });
    

    let logsChannel; 
    if(!config.userAdd.ChannelID) logsChannel = message.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
    if(config.userAdd.ChannelID) logsChannel = message.guild.channels.cache.get(config.userAdd.ChannelID);

    const log = new Discord.MessageEmbed()
    .setColor("GREEN")
    .setTitle(config.Locale.userAddTitle)
    .addField(`• ${config.Locale.logsExecutor}`, `> ${message.author}\n> ${message.author.tag}`)
    .addField(`• ${config.Locale.logsUser}`, `> ${aUser}\n> ${aUser.tag}`)
    .addField(`• ${config.Locale.logsTicket}`, `> ${message.channel}\n> #${message.channel.name}`)
    .setTimestamp()
    .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
    .setFooter({ text: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })

    let addLocale = config.Locale.ticketUserAdd.replace(/{user}/g, `${aUser}`).replace(/{user-tag}/g, `${aUser.tag}`);
    const embed = new Discord.MessageEmbed()
    .setColor("GREEN")
    .setDescription(addLocale)

    message.channel.send({ embeds: [embed] })
    if (logsChannel && config.userAdd.Enabled) logsChannel.send({ embeds: [log] })

}


module.exports.help = {
  name: 'add',
  enabled: commands.Ticket.Add.Enabled
}
