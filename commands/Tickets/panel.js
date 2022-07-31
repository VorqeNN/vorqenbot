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
if(!message.guild.channels.cache.get(config.TicketSettings.LogsChannelID)) return console.log('\x1b[31m%s\x1b[0m', `[WARNING] TicketSettings.LogsChannelID is not a valid channel!`)
if(!message.member.permissions.has("ADMINISTRATOR")) return message.reply(config.Locale.NoPermsMessage);
setTimeout(() => message.delete(), 1000);

if(config.TicketButton1.ButtonColor === "BLURPLE") config.TicketButton1.ButtonColor = "PRIMARY"
if(config.TicketButton1.ButtonColor === "GRAY") config.TicketButton1.ButtonColor = "SECONDARY"
if(config.TicketButton1.ButtonColor === "GREEN") config.TicketButton1.ButtonColor = "SUCCESS"
if(config.TicketButton1.ButtonColor === "RED") config.TicketButton1.ButtonColor = "DANGER"

if(config.TicketButton2.ButtonColor === "BLURPLE") config.TicketButton2.ButtonColor = "PRIMARY"
if(config.TicketButton2.ButtonColor === "GRAY") config.TicketButton2.ButtonColor = "SECONDARY"
if(config.TicketButton2.ButtonColor === "GREEN") config.TicketButton2.ButtonColor = "SUCCESS"
if(config.TicketButton2.ButtonColor === "RED") config.TicketButton2.ButtonColor = "DANGER"

if(config.TicketButton3.ButtonColor === "BLURPLE") config.TicketButton3.ButtonColor = "PRIMARY"
if(config.TicketButton3.ButtonColor === "GRAY") config.TicketButton3.ButtonColor = "SECONDARY"
if(config.TicketButton3.ButtonColor === "GREEN") config.TicketButton3.ButtonColor = "SUCCESS"
if(config.TicketButton3.ButtonColor === "RED") config.TicketButton3.ButtonColor = "DANGER"

if(config.TicketButton4.ButtonColor === "BLURPLE") config.TicketButton4.ButtonColor = "PRIMARY"
if(config.TicketButton4.ButtonColor === "GRAY") config.TicketButton4.ButtonColor = "SECONDARY"
if(config.TicketButton4.ButtonColor === "GREEN") config.TicketButton4.ButtonColor = "SUCCESS"
if(config.TicketButton4.ButtonColor === "RED") config.TicketButton4.ButtonColor = "DANGER"

if(config.TicketButton5.ButtonColor === "BLURPLE") config.TicketButton5.ButtonColor = "PRIMARY"
if(config.TicketButton5.ButtonColor === "GRAY") config.TicketButton5.ButtonColor = "SECONDARY"
if(config.TicketButton5.ButtonColor === "GREEN") config.TicketButton5.ButtonColor = "SUCCESS"
if(config.TicketButton5.ButtonColor === "RED") config.TicketButton5.ButtonColor = "DANGER"


const button1 = new MessageButton()
.setCustomId('button1')
.setLabel(config.TicketButton1.TicketName)
.setStyle(config.TicketButton1.ButtonColor)
.setEmoji(config.TicketButton1.ButtonEmoji)

const button2 = new MessageButton()
.setCustomId('button2')
.setLabel(config.TicketButton2.TicketName)
.setStyle(config.TicketButton2.ButtonColor)
.setEmoji(config.TicketButton2.ButtonEmoji)

const button3 = new MessageButton()
.setCustomId('button3')
.setLabel(config.TicketButton3.TicketName)
.setStyle(config.TicketButton3.ButtonColor)
.setEmoji(config.TicketButton3.ButtonEmoji)

const button4 = new MessageButton()
.setCustomId('button4')
.setLabel(config.TicketButton4.TicketName)
.setStyle(config.TicketButton4.ButtonColor)
.setEmoji(config.TicketButton4.ButtonEmoji)

const button5 = new MessageButton()
.setCustomId('button5')
.setLabel(config.TicketButton5.TicketName)
.setStyle(config.TicketButton5.ButtonColor)
.setEmoji(config.TicketButton5.ButtonEmoji)


let row = ""
if(!config.TicketButton2.Enabled && !config.TicketButton3.Enabled && !config.TicketButton4.Enabled && !config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1);
if(config.TicketButton2.Enabled && !config.TicketButton3.Enabled && !config.TicketButton4.Enabled && !config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2);
if(config.TicketButton2.Enabled && config.TicketButton3.Enabled && !config.TicketButton4.Enabled && !config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2, button3);
if(config.TicketButton2.Enabled && config.TicketButton3.Enabled && !config.TicketButton4.Enabled && config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2, button3, button5);
if(config.TicketButton2.Enabled && config.TicketButton3.Enabled && config.TicketButton4.Enabled && !config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2, button3, button4);
if(config.TicketButton2.Enabled && config.TicketButton3.Enabled && config.TicketButton4.Enabled && config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2, button3, button4, button5);
if(config.TicketButton2.Enabled && !config.TicketButton3.Enabled && config.TicketButton4.Enabled && config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2, button4, button5);
if(config.TicketButton2.Enabled && !config.TicketButton3.Enabled && !config.TicketButton4.Enabled && config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2, button5);
if(config.TicketButton2.Enabled && !config.TicketButton3.Enabled && config.TicketButton4.Enabled && !config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button2, button4);
if(!config.TicketButton2.Enabled && config.TicketButton3.Enabled && config.TicketButton4.Enabled && config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button3, button4, button5);
if(!config.TicketButton2.Enabled && config.TicketButton3.Enabled && config.TicketButton4.Enabled && !config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button3, button4);
if(!config.TicketButton2.Enabled && !config.TicketButton3.Enabled && config.TicketButton4.Enabled && !config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button4);
if(!config.TicketButton2.Enabled && !config.TicketButton3.Enabled && config.TicketButton4.Enabled && config.TicketButton5.Enabled) row = new MessageActionRow().addComponents(button1, button4, button5);


const ticketEmbed = new MessageEmbed()
    .setTitle(config.TicketPanelSettings.PanelTitle)
    .setDescription(config.TicketPanelSettings.PanelMessage)
    if(config.TicketPanelSettings.EmbedColor) ticketEmbed.setColor(config.TicketPanelSettings.EmbedColor)
    if(!config.TicketPanelSettings.EmbedColor) ticketEmbed.setColor(config.EmbedColors)
    if(config.TicketPanelSettings.PanelImage) ticketEmbed.setImage(config.TicketPanelSettings.PanelImage)
    if(config.TicketPanelSettings.PanelThumbnail) ticketEmbed.setThumbnail(config.TicketPanelSettings.PanelThumbnail)
    if(config.TicketPanelSettings.FooterMsg) ticketEmbed.setFooter({ text: `${config.TicketPanelSettings.FooterMsg}` })
    if(config.TicketPanelSettings.FooterMsg && config.TicketPanelSettings.FooterIcon) ticketEmbed.setFooter({ text: `${config.TicketPanelSettings.FooterMsg}`, iconURL: `${config.TicketPanelSettings.FooterIcon}` })
    if(config.TicketPanelSettings.FooterTimestamp) ticketEmbed.setTimestamp()


    const options = [];
    options.push({
      label: config.TicketButton1.TicketName,
      value: "button1",
      description: config.TicketButton1.Description,
      emoji: config.TicketButton1.ButtonEmoji,
    });

    if(config.TicketButton2.Enabled) options.push({
      label: config.TicketButton2.TicketName,
      value: "button2", 
      description: config.TicketButton2.Description,
      emoji: config.TicketButton2.ButtonEmoji,
    });

    if(config.TicketButton3.Enabled) options.push({
      label: config.TicketButton3.TicketName,
      value: "button3",
      description: config.TicketButton3.Description,
      emoji: config.TicketButton3.ButtonEmoji,
    });

    if(config.TicketButton4.Enabled) options.push({
      label: config.TicketButton4.TicketName,
      value: "button4",
      description: config.TicketButton4.Description,
      emoji: config.TicketButton4.ButtonEmoji,
    });

    if(config.TicketButton5.Enabled) options.push({
      label: config.TicketButton5.TicketName,
      value: "button5",
      description: config.TicketButton5.Description,
      emoji: config.TicketButton5.ButtonEmoji,
    });

    let sMenu = new MessageSelectMenu()
    .setCustomId("categorySelect")
    .setPlaceholder(config.Locale.selectCategory)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(options);

    let sRow = new MessageActionRow().addComponents(sMenu);
    if(config.TicketSettings.SelectMenu === false) message.channel.send({ embeds: [ticketEmbed], components: [row] });
    if(config.TicketSettings.SelectMenu) message.channel.send({ embeds: [ticketEmbed], components: [sRow] }).then(async function(msg) {

    client.ticketPanel.set(config.GuildID, options, 'selectMenuOptions');
    client.ticketPanel.set(config.GuildID, msg.id, 'msgID');
    })

}


module.exports.help = {
  name: 'panel',
  enabled: commands.Ticket.Panel.Enabled
}