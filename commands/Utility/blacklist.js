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
    if(!message.member.permissions.has("MANAGE_CHANNELS")) return message.reply(config.Locale.NoPermsMessage);

    let invalidusage = new Discord.MessageEmbed()
    .setColor("RED")
    .setDescription('Too few arguments given\n\nUsage:\n``blacklist <@user>``')

    let user = message.mentions.users.first()
    if(!user) return message.reply({ embeds: [invalidusage] })

    let alreadyBlacklistedLocale = config.Locale.alreadyBlacklisted.replace(/{user}/g, `${user}`).replace(/{user-tag}/g, `${user.tag}`);
    const alreadyBlacklisted = new Discord.MessageEmbed()
    .setColor("RED")
    .setDescription(alreadyBlacklistedLocale)

    if(client.blacklistedUsers.has(`${user.id}`) && client.blacklistedUsers.get(`${user.id}`, "blacklisted") === true) return message.channel.send({ embeds: [alreadyBlacklisted] })

    let successfullyBlacklistedLocale = config.Locale.successfullyBlacklisted.replace(/{user}/g, `${user}`).replace(/{user-tag}/g, `${user.tag}`);
    const embed = new Discord.MessageEmbed()
    .setColor("GREEN")
    .setDescription(successfullyBlacklistedLocale)

    message.channel.send({ embeds: [embed] })
    client.blacklistedUsers.set(`${user.id}`, true, "blacklisted");
}


module.exports.help = {
  name: 'blacklist',
  enabled: commands.Utility.Blacklist.Enabled
}
