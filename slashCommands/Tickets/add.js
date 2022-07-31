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
    enabled: commands.Ticket.Add.Enabled,
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription(commands.Ticket.Add.Description)
        .addUserOption((option) => option.setName('user').setDescription('User').setRequired(true)),
    async execute(interaction, client) {
        if(!client.tickets.has(interaction.channel.id)) return interaction.reply({ content: config.Locale.NotInTicketChannel, ephemeral: true })

        let user = interaction.options.getUser("user");

        interaction.channel.permissionOverwrites.create(user, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true
        });

        let logsChannel; 
        if(!config.userAdd.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
        if(config.userAdd.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.userAdd.ChannelID);
    
        const log = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTitle(config.Locale.userAddTitle)
        .addField(`• ${config.Locale.logsExecutor}`, `> ${interaction.user}\n> ${interaction.user.tag}`)
        .addField(`• ${config.Locale.logsUser}`, `> ${user}\n> ${user.tag}`)
        .addField(`• ${config.Locale.logsTicket}`, `> ${interaction.channel}\n> #${interaction.channel.name}`)
        .setTimestamp()
        .setThumbnail(interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .setFooter({ text: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })

        let addLocale = config.Locale.ticketUserAdd.replace(/{user}/g, `${user}`).replace(/{user-tag}/g, `${user.tag}`);
        const embed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setDescription(addLocale)
    
        interaction.reply({ embeds: [embed] })
        if (logsChannel && config.userAdd.Enabled) logsChannel.send({ embeds: [log] })

    }

}