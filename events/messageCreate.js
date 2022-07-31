const { Discord, MessageEmbed } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const color = require('ansi-colors');

module.exports = async (client, message) => {
    if(!message.channel.type === "GUILD_TEXT") return;
    if(message.author.bot) return;

// Custom Commands
if(config.CommandsEnabled) {
    config.CustomCommands.forEach(cmd => {

        let messageArray = message.content.split(" ");
        let command = messageArray[0].toLowerCase();
        messageArray.slice(1);
        let commandfile = command.slice(config.CommandsPrefix.length);
        if(message.content.startsWith(config.CommandsPrefix) && commandfile === cmd.command) {
            if(config.OnlyInTickets && !client.tickets.has(message.channel.id)) return;

          let logMsg = `\n\n[${new Date().toLocaleString()}] [CUSTOM COMMAND] Command: ${cmd.command}, User: ${message.author.tag}`;
          fs.appendFile("./logs.txt", logMsg, (e) => { 
            if(e) console.log(e);
          });
  
          if(config.LogCommands) console.log(`${color.yellow(`[CUSTOM COMMAND] ${color.cyan(`${message.author.tag}`)} used ${color.cyan(`${config.CommandsPrefix}${cmd.command}`)}`)}`);
  
          let respEmbed = new MessageEmbed()
          .setColor(config.EmbedColors)
          .setDescription(`${cmd.response}`)
  
          if(cmd.deleteMsg) setTimeout(() => message.delete(), 100);
          if(cmd.replyToUser && cmd.Embed) message.reply({ embeds: [respEmbed] })
          if(cmd.replyToUser === false && cmd.Embed) message.channel.send({ embeds: [respEmbed] })
  
          if(cmd.replyToUser && cmd.Embed === false) message.reply({ content: `${cmd.response}` })
          if(cmd.replyToUser === false && cmd.Embed === false) message.channel.send({ content: `${cmd.response}` })
      }
})
}

// Count messages in tickets amnd update lastMessageSent
if(client.tickets.has(message.channel.id)) {
    client.tickets.inc(message.channel.id, "messages");
    client.globalStats.inc(message.guild.id, "totalMessages");

    // Update lastMessageSent
    client.tickets.set(message.channel.id, Date.now(), "lastMessageSent");
}

// Auto Responses
if(config.AutoResponse.Enabled && config.AutoResponse.Responses) {
    if(config.AutoResponse.OnlyInTickets && !client.tickets.has(message.channel.id)) return;

    if(Object.keys(config.AutoResponse.Responses).some(o => message.content.toLowerCase().includes(o.toLowerCase()) || message.content.toLowerCase().startsWith(o.toLowerCase()))) {
        let oWord = Object.keys(config.AutoResponse.Responses).filter(o => Object.keys(config.AutoResponse.Responses).some(a => message.content.toLowerCase().includes(o.toLowerCase())));
        let listIndex = Object.keys(config.AutoResponse.Responses).indexOf(oWord[0]);
    
        let respMsg = Object.values(config.AutoResponse.Responses)[listIndex];
    
        if(config.AutoResponse.MessageType == "EMBED") {
          let respEmbed = new MessageEmbed()
            .setColor(config.EmbedColors)
            .setDescription(`${message.author}, ${respMsg}`)
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
    
            message.reply({ embeds: [respEmbed] });
          } else if(config.AutoResponse.MessageType == "TEXT") {
            message.reply({ content: respMsg });
          } else {
            console.log("Invalid message type for auto response message specified in the config!")
          }
        }
}


// Message command handler
if(config.MessageCommands) {
if(message.content.startsWith(config.Prefix)) {

let messageArray = message.content.split(" ");
let command = messageArray[0].toLowerCase();
let args = messageArray.slice(1);

let commandfile = client.commands.get(command.slice(config.Prefix.length));
if (commandfile) commandfile.run(client, message, args)
if(config.LogCommands && commandfile) console.log(`${color.yellow(`[MESSAGE COMMAND] ${color.cyan(`${message.author.tag}`)} used ${color.cyan(`${command}`)}`)}`);

let logMsg = `\n\n[${new Date().toLocaleString()}] [MESSAGE COMMAND] Command: ${command}, User: ${message.author.tag}`;
if(commandfile) fs.appendFile("./logs.txt", logMsg, (e) => { 
  if(e) console.log(e);
});
}
}

};