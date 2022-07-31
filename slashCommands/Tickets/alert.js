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
    enabled: commands.Ticket.Alert.Enabled,
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription(commands.Ticket.Alert.Description),
    async execute(interaction, client) {
        if(!client.tickets.has(interaction.channel.id)) return interaction.reply({ content: config.Locale.NotInTicketChannel, ephemeral: true })

        let supportRole = false
        let tButton = client.tickets.get(`${interaction.channel.id}`, "button");
        if(tButton === "TicketButton1") {
            for(let i = 0; i < config.TicketButton1.SupportRoles.length; i++) {
                if(interaction.member.roles.cache.has(config.TicketButton1.SupportRoles[i])) supportRole = true;
            }
        } else if(tButton === "TicketButton2") {
            for(let i = 0; i < config.TicketButton2.SupportRoles.length; i++) {
                if(interaction.member.roles.cache.has(config.TicketButton2.SupportRoles[i])) supportRole = true;
              }
        } else if(tButton === "TicketButton3") {
            for(let i = 0; i < config.TicketButton3.SupportRoles.length; i++) {
                if(interaction.member.roles.cache.has(config.TicketButton3.SupportRoles[i])) supportRole = true;
              }
        } else if(tButton === "TicketButton4") {
            for(let i = 0; i < config.TicketButton4.SupportRoles.length; i++) {
                if(interaction.member.roles.cache.has(config.TicketButton4.SupportRoles[i])) supportRole = true;
              }
        } else if(tButton === "TicketButton5") {
            for(let i = 0; i < config.TicketButton5.SupportRoles.length; i++) {
                if(interaction.member.roles.cache.has(config.TicketButton5.SupportRoles[i])) supportRole = true;
              }
        }
        if(supportRole === false) return interaction.reply({ content: config.Locale.NoPermsMessage, ephemeral: true })
    
        let ticketCreator = await client.users.cache.get(client.tickets.get(`${interaction.channel.id}`, "userID"))
    
        const ticketDeleteButton = new Discord.MessageButton()
        .setCustomId('closeTicket')
        .setLabel(config.Locale.CloseTicketButton)
        .setStyle(config.ButtonColors.closeTicket)
        .setEmoji(config.ButtonEmojis.closeTicket)
        
        let row = new Discord.MessageActionRow().addComponents(ticketDeleteButton);
    
        let descLocale = config.TicketAlert.Message.replace(/{time}/g, `${config.TicketAlert.Time}`);
        const embed = new Discord.MessageEmbed()
        .setColor(config.EmbedColors)
        .setAuthor({ name: `${config.TicketAlert.Title}`, iconURL: `https://i.imgur.com/FxQkyLb.png` })
        .setDescription(descLocale)
        .setTimestamp()
        interaction.reply({ content: `${ticketCreator}`, embeds: [embed], components: [row] })

    }

}